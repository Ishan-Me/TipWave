const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },

        password: {
            type: String,
            required: true
        },

        displayName: {
            type: String,
            required: true,
            trim: true
        },

          overlayKey: {
            type: String,
            unique: true
        },

        profileImage: {
            type: String,
            default: ""
        },

        bio: {
            type: String,
            default: ""
        },

  brandingSettings: {
    accentColor: {
        type: String,
        default: "#111111"
    },

    buttonColor: {
        type: String,
        default: "#111111"
    },

    backgroundColor: {
        type: String,
        default: "#f4f5f7"
    },

    cardColor: {
        type: String,
        default: "#ffffff"
    },

    tipAmounts: {
        type: [Number],
        default: [50, 100, 500, 1000]
    }
},

        alertSettings: {
    duration: {
        type: Number,
        default: 8
    },

    minimumAmount: {
        type: Number,
        default: 1
    },

    showMessage: {
        type: Boolean,
        default: true
    },

    fontSize: {
        type: Number,
        default: 18
    }
},
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);