const mongoose = require("mongoose");

const tipSchema = new mongoose.Schema(
    {
        streamer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        donorName: {
            type: String,
            required: true,
            trim: true
        },

        donorEmail: {
            type: String,
            trim: true,
            default: ""
        },

        amount: {
            type: Number,
            required: true,
            min: 1
        },

       amount: {
    type: Number,
    required: true
},

currency: {
    type: String,
    required: true,
    default: "INR",
    uppercase: true
},

        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200
        },

        razorpayOrderId: {
    type: String,
    default: ""
},

razorpayPaymentId: {
    type: String,
    default: ""
},

        status: {
            type: String,
            enum: ["pending", "paid", "failed"],
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Tip", tipSchema);