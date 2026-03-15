const Notification = require('../models/Notification');

// Get notifications for logged-in user
const getAllNotifications = async (userId) => {
  return await Notification.find({ userId }).populate('songId').sort({ createdAt: -1 });
};

// Mark a notification as read
const markAsRead = async (id, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: id, userId },
    { isRead: true },
    { new: true }
  );
  if (!notification) throw new Error('Notification not found');
  return notification;
};

// Delete a notification
const deleteNotification = async (id, userId) => {
  const notification = await Notification.findOneAndDelete({ _id: id, userId });
  if (!notification) throw new Error('Notification not found');
  return notification;
};

module.exports = { getAllNotifications, markAsRead, deleteNotification };
