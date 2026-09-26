const express = require("express");
const Tip = require("../models/Tip");
const User = require("../models/User");

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const {
            streamerUsername,
            donorName,
            donorEmail,
            amount,
            message
        } = req.body;

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

        if (
            !Number.isFinite(numericAmount) ||
            numericAmount < 1
        ) {
            return res.status(400).json({
                message: "Invalid tip amount"
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

        const tip = await Tip.create({
            streamer: streamer._id,
            donorName,
            donorEmail: donorEmail || "",
            amount: numericAmount,
            message,
            status: "pending"
        });
        

        res.status(201).json({
            message: "Tip created",
            tip: {
                id: tip._id,
                donorName: tip.donorName,
                amount: tip.amount,
                message: tip.message,
                status: tip.status
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

module.exports = router;