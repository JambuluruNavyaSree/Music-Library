const router = require('express').Router();
const { protect } = require('../middleware/auth');
const notificationService = require('../services/notificationService');

// Get notifications for logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await notificationService.getAllNotifications(req.user.id);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark as read
router.patch('/:id/read', protect, async (req, res) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user.id);
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark all as read
router.put('/read-all', protect, async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete notification
router.delete('/:id', protect, async (req, res) => {
  try {
    await notificationService.deleteNotification(req.params.id, req.user.id);
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
