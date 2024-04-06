const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const notificationSchema = new Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "user",
        require: true,
    },

    postId: {
        type: mongoose.Types.ObjectId,
        ref:"post"
    },

    from: {
        type: mongoose.Types.ObjectId,
        ref: "user",
    },

    fromUser: {
        type: String
    },

    message: {
        type: String,
        required: true,
    },

    isRead: {
        type: Boolean,
        required: true,
        default: false,
    }
}, {
    timestamps: true,
});

const Notifications = model("notification", notificationSchema);

module.exports = Notifications;
