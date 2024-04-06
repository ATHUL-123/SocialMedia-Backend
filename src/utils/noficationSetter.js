const Notifications = require('../models/notificationModel');

// Function to set a new notification
const setNotification = async (userId, from, fromUser, message,postId=null) => {
    try {
        const notification = new Notifications({
            userId,
            postId,
            from,
            fromUser,
            message,
            isRead: false // Default value
        });
        const savedNotification = await notification.save();
        return savedNotification;
    } catch (error) {
        console.log(error);
        console.error("Error while setting notification:", error);
        throw error;
    }
};

module.exports = {
    setNotification
};