const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { username, email, password, displayName } = req.body;

        if (!username || !email || !password || !displayName) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                message: "Username or email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
const overlayKey = crypto
    .randomBytes(24)
    .toString("hex");
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            displayName,
            overlayKey
        });

        res.status(201).json({
            message: "User registered successfully",
          user: {
    id: user._id,
    username: user.username,
    email: user.email,
    displayName: user.displayName,
    overlayKey: user.overlayKey
}
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                username: user.username
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
    id: user._id,
    username: user.username,
    email: user.email,
    displayName: user.displayName,
    overlayKey: user.overlayKey
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