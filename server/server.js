const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const streamerRoutes = require("./routes/streamerRoutes");
const tipRoutes = require("./routes/tipRoutes");
const protect = require("./middleware/authMiddleware");
const dashboardRoutes = require("./routes/dashboardRoutes");
const paymentRoutes =require("./routes/paymentRoutes");

const crypto = require("crypto");

const Tip = require("./models/Tip");

const app = express();

const server = http.createServer(app);



const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST", "PUT"]
    }
});

app.post(
    "/api/payments/webhook",
    express.raw({
        type: "application/json"
    }),
    async (req, res) => {

        try {

            const signature =
                req.headers["x-razorpay-signature"];

            if (!signature) {
                return res.status(400).send(
                    "Missing webhook signature"
                );
            }

            const expectedSignature = crypto
                .createHmac(
                    "sha256",
                    process.env.RAZORPAY_WEBHOOK_SECRET
                )
                .update(req.body)
                .digest("hex");

            const expectedBuffer =
                Buffer.from(expectedSignature);

            const receivedBuffer =
                Buffer.from(signature);

            if (
                expectedBuffer.length !==
                receivedBuffer.length
            ) {
                return res.status(400).send(
                    "Invalid signature"
                );
            }

            const isValid =
                crypto.timingSafeEqual(
                    expectedBuffer,
                    receivedBuffer
                );

            if (!isValid) {
                return res.status(400).send(
                    "Invalid signature"
                );
            }

            const event = JSON.parse(
                req.body.toString()
            );

          if (event.event === "payment.captured") {

    const payment =
        event.payload.payment.entity;

    const orderId =
        payment.order_id;

    const paymentId =
        payment.id;

    const tip =
        await Tip.findOne({
            razorpayOrderId: orderId
        }).populate("streamer");

    if (!tip) {
        console.log(
            "Tip not found for order:",
            orderId
        );

        return res.status(200).send("OK");
    }

    // CHECK AMOUNT
    const expectedAmount =
        Math.round(tip.amount * 100);

    if (payment.amount !== expectedAmount) {

        console.error(
            "Payment amount mismatch"
        );

        return res.status(400).send(
            "Amount mismatch"
        );
    }

    // CHECK CURRENCY
    if (payment.currency !== tip.currency) {

    return res.status(400).send(
        "Currency mismatch"
    );
}

    // CHECK DUPLICATE
    if (tip.status === "paid") {

        console.log(
            "Tip already processed:",
            tip._id
        );

        return res.status(200).send("OK");
    }

    // MARK AS PAID
    tip.status = "paid";

    tip.razorpayPaymentId =
        paymentId;

    await tip.save();

    // SEND OBS ALERT
   io
    .to(tip.streamer.username)
    .emit("newTip", {

        donorName:
            tip.donorName,

        amount:
            tip.amount,

        currency:
            tip.currency,

        message:
            tip.message
    });

   console.log(
    `Paid tip processed: ${tip.currency} ${tip.amount}`
);
}

            return res.status(200).send("OK");

        } catch (error) {

            console.error(
                "Webhook error:",
                error
            );

            return res.status(500).send(
                "Webhook processing failed"
            );
        }
    }
);

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        methods: [
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "PATCH"
        ],
        credentials: true
    })
);
app.use(express.json());

app.use(
    "/uploads",
    express.static(
        path.join(__dirname, "uploads")
    )
);

app.use((req, res, next) => {
    req.io = io;
    next();
});

app.use(
    "/api/dashboard",
    dashboardRoutes
);
app.use("/api/auth", authRoutes);
app.use("/api/streamers", streamerRoutes);

app.use(
    "/api/payments",
    paymentRoutes
);

app.use("/api/tips", tipRoutes);

app.get("/api/health", (req, res) => {
    res.json({
        message: "TipWave backend is running!"
    });
});

app.get("/api/auth/me", protect, (req, res) => {
    res.json({
        message: "You are authenticated",
        user: req.user
    });
});

io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("joinStreamer", (username) => {
        const room = username.toLowerCase();

        socket.join(room);

        console.log(
            `${socket.id} joined streamer room: ${room}`
        );
    });

    socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
    });
});

const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");

        server.listen(PORT, () => {
            console.log(
                `Server running on http://localhost:${PORT}`
            );
        });
    })
    .catch((error) => {
        console.error(
            "MongoDB connection failed:",
            error.message
        );
    });