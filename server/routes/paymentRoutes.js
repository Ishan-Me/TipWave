const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const Tip = require("../models/Tip");
const User = require("../models/User");

const router = express.Router();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const TIP_LIMITS =
    require("../config/tipLimits");

router.post("/create-order", async (req, res) => {
    try {

        const {
            streamerUsername,
            donorName,
            donorEmail,
            amount,
            currency,
            message
        } = req.body;

        const selectedCurrency =
    String(currency || "INR").toUpperCase();

const allowedCurrencies = [
    "INR",
    "USD",
    "EUR",
    "GBP",
    "CHF",
    "SGD",
    "CAD",
    "AUD"
];

if (
    !allowedCurrencies.includes(
        selectedCurrency
    )
) {
    return res.status(400).json({
        message: "Unsupported currency"
    });
}

        if (
            !streamerUsername ||
            !donorName ||
            !amount ||
            !message
        ) {
            return res.status(400).json({
                message: "Required fields are missing"
            });
        }

       const numericAmount = Number(amount);

if (!Number.isFinite(numericAmount)) {
    return res.status(400).json({
        message: "Invalid tip amount"
    });
}

const limits =
    TIP_LIMITS[selectedCurrency];

if (!limits) {
    return res.status(400).json({
        message: "Unsupported currency"
    });
}

if (numericAmount < limits.min) {
    return res.status(400).json({
        message:
            `Minimum tip amount is ${selectedCurrency} ${limits.min}`
    });
}

if (numericAmount > limits.max) {
    return res.status(400).json({
        message:
            `Maximum tip amount is ${selectedCurrency} ${limits.max}`
    });
}
        const streamer = await User.findOne({
            username: streamerUsername.toLowerCase()
        });

        if (!streamer) {
            return res.status(404).json({
                message: "Streamer not found"
            });
        }

        const order = await razorpay.orders.create({
            amount: Math.round(numericAmount * 100),
            currency: selectedCurrency,
            receipt: `tip_${Date.now()}`
        });

        const tip = await Tip.create({
            streamer: streamer._id,
            donorName,
            donorEmail: donorEmail || "",
            amount: numericAmount,
            message,
            status: "pending",
            currency: selectedCurrency,
            razorpayOrderId: order.id
        });

        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,

            tipId: tip._id,

            key: process.env.RAZORPAY_KEY_ID,

            streamer: {
                username: streamer.username,
                displayName: streamer.displayName
            }
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Unable to create payment order"
        });
    }
});

router.post("/verify", async (req, res) => {

    try {

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        // 1. Basic validation
        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                message: "Missing payment details"
            });
        }

        // 2. Find tip from our database
        const tip = await Tip.findOne({
            razorpayOrderId: razorpay_order_id
        }).populate("streamer");

        if (!tip) {
            return res.status(404).json({
                message: "Tip not found"
            });
        }

        // 3. Verify Razorpay signature
        const body =
            tip.razorpayOrderId +
            "|" +
            razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(body)
            .digest("hex");

        if (
            expectedSignature !==
            razorpay_signature
        ) {
            return res.status(400).json({
                message:
                    "Payment verification failed"
            });
        }

        // 4. Fetch actual payment from Razorpay
        const payment =
            await razorpay.payments.fetch(
                razorpay_payment_id
            );

        // 5. Check payment belongs to correct order
        if (
            payment.order_id !==
            tip.razorpayOrderId
        ) {
            return res.status(400).json({
                message:
                    "Payment order mismatch"
            });
        }

        // 6. Check exact amount
        const expectedAmount =
            Math.round(
                tip.amount * 100
            );

        if (
            Number(payment.amount) !==
            expectedAmount
        ) {
            return res.status(400).json({
                message:
                    "Payment amount mismatch"
            });
        }

        // 7. Check correct currency
        if (
            payment.currency !==
            tip.currency
        ) {
            return res.status(400).json({
                message:
                    "Payment currency mismatch"
            });
        }

        // 8. Payment must actually be captured
        if (
            payment.status !==
            "captured"
        ) {
            return res.status(400).json({
                message:
                    "Payment has not been captured"
            });
        }

        // 9. Prevent duplicate OBS alerts
      const updatedTip = await Tip.findOneAndUpdate(
    {
        _id: tip._id,
        status: {
            $ne: "paid"
        }
    },
    {
        $set: {
            status: "paid",
            razorpayPaymentId:
                razorpay_payment_id
        }
    },
    {
        new: true
    }
);

if (updatedTip) {

    req.io
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
}

        res.json({
            message:
                "Payment verified",

            tipId:
                tip._id
        });

    } catch (error) {

        console.error(
            "PAYMENT VERIFY ERROR:",
            error
        );

        res.status(500).json({
            message:
                "Payment verification error"
        });
    }
});
module.exports = router;