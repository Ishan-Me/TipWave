const express = require("express");
const User = require("../models/User");

const router = express.Router();


router.get("/overlay/:key", async (req, res) => {
    try {

        const streamer = await User.findOne({
            overlayKey: req.params.key
        }).select(
    "username displayName profileImage alertSettings"
);

        if (!streamer) {
            return res.status(404).json({
                message: "Invalid overlay key"
            });
        }

        res.json(streamer);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

router.get("/:username", async (req, res) => {
    try {
        const username = req.params.username.toLowerCase();

        const streamer = await User.findOne({ username }).select(
    "username displayName profileImage bio brandingSettings"
);

        if (!streamer) {
            return res.status(404).json({
                message: "Streamer not found"
            });
        }

        res.json(streamer);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

module.exports = router;