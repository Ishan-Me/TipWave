const express = require("express");
const Tip = require("../models/Tip");
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");
const crypto = require("crypto");
const multer = require("multer");
const path = require("path");
const fs = require("fs");


const router = express.Router();

const uploadFolder = path.join(
    __dirname,
    "../uploads"
);

// Make sure uploads folder exists
if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, {
        recursive: true
    });
}

console.log(
    "Upload folder:",
    uploadFolder
);

const storage = multer.diskStorage({

    destination: function (
        req,
        file,
        cb
    ) {

        console.log(
            "Destination:",
            uploadFolder
        );

        cb(
            null,
            uploadFolder
        );
    },

    filename: function (
        req,
        file,
        cb
    ) {

        const uniqueName =
            crypto
                .randomBytes(12)
                .toString("hex");

        const extension =
            path
                .extname(
                    file.originalname
                )
                .toLowerCase();

        const finalName =
            uniqueName + extension;

        console.log(
            "New filename:",
            finalName
        );

        cb(
            null,
            finalName
        );
    }
});

const fileFilter = (req, file, cb) => {

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!allowedTypes.includes(file.mimetype)) {
        return cb(
            new Error(
                "Only JPG, PNG and WEBP images are allowed"
            )
        );
    }

    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

router.post(
    "/profile-image",

    protect,

    (req, res, next) => {

        console.log(
            "====== PROFILE IMAGE ROUTE HIT ======"
        );

        console.log(
            "Authenticated user:",
            req.user
        );

        upload.single(
            "profileImage"
        )(
            req,
            res,
            function (error) {

                if (error) {

                    console.error(
                        "MULTER ERROR:",
                        error
                    );

                    return res.status(400).json({
                        message: error.message
                    });
                }

                console.log(
                    "Multer finished"
                );

                console.log(
                    "req.file:",
                    req.file
                );

                next();
            }
        );
    },

    async (req, res) => {

        try {

            console.log(
                "Processing uploaded file:",
                req.file
            );

            if (!req.file) {

                return res.status(400).json({
                    message:
                        "No image file received"
                });
            }

            const user =
                await User.findById(
                    req.user.userId
                );

            if (!user) {

                return res.status(404).json({
                    message:
                        "User not found"
                });
            }

            const imageUrl =
                `${API_URL}/uploads/${req.file.filename}`;

            user.profileImage =
                imageUrl;

            await user.save();

            console.log(
                "IMAGE SAVED TO USER:",
                imageUrl
            );

            res.json({
                message:
                    "Profile image uploaded successfully",

                profileImage:
                    imageUrl
            });

        } catch (error) {

            console.error(
                "DATABASE/UPLOAD ERROR:",
                error
            );

            res.status(500).json({
                message:
                    "Unable to upload image"
            });
        }
    }
);

router.post(
    "/overlay-key",
    protect,
    async (req, res) => {

        try {

            const user = await User.findById(
                req.user.userId
            );

            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            if (!user.overlayKey) {

                user.overlayKey = crypto
                    .randomBytes(24)
                    .toString("hex");

                await user.save();
            }

            res.json({
                overlayKey: user.overlayKey
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                message:
                    "Unable to create overlay key"
            });
        }
    }
);

router.get("/stats", protect, async (req, res) => {
    try {

        const streamer = await User.findById(
            req.user.userId
        );

        if (!streamer) {
            return res.status(404).json({
                message: "Streamer not found"
            });
        }

        const paidTips = await Tip.find({
            streamer: streamer._id,
            status: "paid"
        });

        const totalsByCurrency = {};

        paidTips.forEach((tip) => {

            const currency =
                tip.currency || "INR";

            if (!totalsByCurrency[currency]) {
                totalsByCurrency[currency] = 0;
            }

            totalsByCurrency[currency] +=
                tip.amount;
        });

        const totalTips =
            paidTips.length;

      const topTipsByCurrency = {};

paidTips.forEach((tip) => {

    const currency =
        tip.currency || "INR";

    if (
        !topTipsByCurrency[currency] ||
        tip.amount >
        topTipsByCurrency[currency]
    ) {
        topTipsByCurrency[currency] =
            tip.amount;
    }
});
res.json({
    totalsByCurrency,
    totalTips,
    topTipsByCurrency
});

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message:
                "Unable to load stats"
        });
    }
});

router.get("/tips", protect, async (req, res) => {
    try {

        const tips = await Tip.find({
            streamer: req.user.userId,
            status: "paid"
        })
            .sort({
                createdAt: -1
            })
            .limit(20);

        res.json(tips);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Unable to load tips"
        });
    }
});

// GET FULL TIP HISTORY
// GET TIP HISTORY WITH PAGINATION
router.get(
    "/tip-history",
    protect,
    async (req, res) => {
        try {

            const streamer =
                await User.findById(
                    req.user.userId
                );

            if (!streamer) {
                return res.status(404).json({
                    message: "Streamer not found"
                });
            }

            let page =
                Number(req.query.page) || 1;

            let limit =
                Number(req.query.limit) || 10;

            if (page < 1) {
                page = 1;
            }

            if (limit < 1) {
                limit = 10;
            }

            if (limit > 50) {
                limit = 50;
            }

            const skip =
                (page - 1) * limit;

           const search =
    String(req.query.search || "").trim();

const currency =
    String(req.query.currency || "ALL")
        .toUpperCase();


const filter = {
    streamer: streamer._id,
    status: "paid"
};


// CURRENCY FILTER
if (currency !== "ALL") {

    filter.currency = currency;
}


// SEARCH
if (search) {

    filter.$or = [
        {
            donorName: {
                $regex: search,
                $options: "i"
            }
        },
        {
            message: {
                $regex: search,
                $options: "i"
            }
        },
        {
            razorpayPaymentId: {
                $regex: search,
                $options: "i"
            }
        }
    ];
}

            const tips =
                await Tip.find(filter)
                    .sort({
                        createdAt: -1
                    })
                    .skip(skip)
                    .limit(limit);

            const totalTips =
                await Tip.countDocuments(
                    filter
                );

            const totalPages =
                Math.ceil(
                    totalTips / limit
                );

            res.json({
                tips,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalTips,
                    limit
                }
            });

        } catch (error) {

            console.error(
                "TIP HISTORY ERROR:",
                error
            );

            res.status(500).json({
                message:
                    "Unable to load tip history"
            });
        }
    }
);

router.get(
    "/alert-settings",
    protect,
    async (req, res) => {

        try {

            const user = await User.findById(
                req.user.userId
            ).select("alertSettings");

            if (!user) {

                return res.status(404).json({
                    message: "User not found"
                });
            }

            res.json(
                user.alertSettings
            );

        } catch (error) {

            console.error(error);

            res.status(500).json({
                message:
                    "Unable to load alert settings"
            });
        }
    }
);

router.put(
    "/alert-settings",
    protect,
    async (req, res) => {

        try {

            const {
                duration,
                minimumAmount,
                showMessage,
                fontSize
            } = req.body;

            const user = await User.findById(
                req.user.userId
            );

            if (!user) {

                return res.status(404).json({
                    message: "User not found"
                });
            }

            if (
                duration < 2 ||
                duration > 30
            ) {

                return res.status(400).json({
                    message:
                        "Duration must be between 2 and 30 seconds"
                });
            }

            if (minimumAmount < 1) {

                return res.status(400).json({
                    message:
                        "Minimum amount must be at least ₹1"
                });
            }

            if (
                fontSize < 12 ||
                fontSize > 60
            ) {

                return res.status(400).json({
                    message:
                        "Font size must be between 12 and 60"
                });
            }

            user.alertSettings = {
                duration,
                minimumAmount,
                showMessage,
                fontSize
            };

            await user.save();

            res.json({
                message:
                    "Alert settings updated",

                alertSettings:
                    user.alertSettings
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                message:
                    "Unable to update alert settings"
            });
        }
    }
);


router.post(
    "/test-alert",
    protect,
    async (req, res) => {

        try {

            const user =
                await User.findById(
                    req.user.userId
                );

            if (!user) {

                return res.status(404).json({
                    message:
                        "User not found"
                });
            }

            req.io
                .to(user.username)
                .emit(
                    "newTip",
                    {
                        donorName:
                            "Test Viewer",

                        amount: 100,

                        message:
                            "This is a test TipWave alert!"
                    }
                );

            res.json({
                message:
                    "Test alert sent"
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                message:
                    "Unable to send test alert"
            });
        }
    }
);

router.get(
    "/profile",
    protect,
    async (req, res) => {
        try {
            const user = await User.findById(
                req.user.userId
            ).select(
                "username displayName bio profileImage"
            );

            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            res.json(user);

        } catch (error) {
            console.error(error);

            res.status(500).json({
                message: "Unable to load profile"
            });
        }
    }
);
router.put(
    "/profile",
    protect,
    async (req, res) => {
        try {
            const {
                displayName,
                bio,
                profileImage
            } = req.body;

            if (!displayName?.trim()) {
                return res.status(400).json({
                    message: "Display name is required"
                });
            }

            if (displayName.length > 50) {
                return res.status(400).json({
                    message:
                        "Display name cannot exceed 50 characters"
                });
            }

            if (bio && bio.length > 200) {
                return res.status(400).json({
                    message:
                        "Bio cannot exceed 200 characters"
                });
            }

            const user = await User.findById(
                req.user.userId
            );

            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            user.displayName =
                displayName.trim();

            user.bio =
                bio?.trim() || "";

            if (profileImage && profileImage.trim()) {
    user.profileImage =
        profileImage.trim();
}

            await user.save();

            res.json({
                message:
                    "Profile updated successfully",

                user: {
                    username:
                        user.username,

                    displayName:
                        user.displayName,

                    bio:
                        user.bio,

                    profileImage:
                        user.profileImage
                }
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                message:
                    "Unable to update profile"
            });
        }
    }
);

router.get(
    "/branding-settings",
    protect,
    async (req, res) => {

        try {

            const user = await User.findById(
                req.user.userId
            ).select("brandingSettings");

            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            res.json(
                user.brandingSettings
            );

        } catch (error) {

            console.error(error);

            res.status(500).json({
                message:
                    "Unable to load branding settings"
            });
        }
    }
);

router.put(
    "/branding-settings",
    protect,
    async (req, res) => {
        try {

            const {
                accentColor,
                buttonColor,
                backgroundColor,
                cardColor,
                tipAmounts
            } = req.body;

            if (
                !Array.isArray(tipAmounts) ||
                tipAmounts.length !== 4
            ) {
                return res.status(400).json({
                    message:
                        "Exactly 4 tip amounts are required"
                });
            }

            const cleanTipAmounts =
                tipAmounts.map(Number);

            const user =
                await User.findById(
                    req.user.userId
                );

            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            user.brandingSettings = {
                accentColor,
                buttonColor,
                backgroundColor,
                cardColor,
                tipAmounts: cleanTipAmounts
            };

            await user.save();

            res.json({
                message:
                    "Branding settings saved",

                brandingSettings:
                    user.brandingSettings
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                message:
                    "Unable to save branding settings"
            });
        }
    }
);
module.exports = router;