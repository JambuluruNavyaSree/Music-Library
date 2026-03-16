const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const User = require('../models/User');
const Role = require('../models/Role');

// GET /api/users/play-history — returns last 20 played songs for logged-in user
router.get('/play-history', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'playHistory.songId',
        populate: [
          { path: 'artistId',   select: 'artistName' },
          { path: 'albumId',    select: 'albumName' },
          { path: 'directorId', select: 'directorName' }
        ]
      });

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Filter out null entries (deleted songs) and return the song objects
    const songs = user.playHistory
      .filter(h => h.songId)
      .map(h => ({ ...h.songId.toObject(), playedAt: h.playedAt }));

    res.json(songs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/profile — get full profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('roleId', 'roleName');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/admin/all — list all users (Admin only)
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('roleId', 'roleName')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/users/admin/toggle-role/:id — toggle user role (Admin only)
router.patch('/admin/toggle-role/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('roleId', 'roleName');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Prevent self-demotion
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot change your own role' });
    }

    const currentRole = user.roleId.roleName;
    const targetRole = currentRole === 'admin' ? 'user' : 'admin';
    
    const roleDoc = await Role.findOne({ roleName: targetRole });
    if (!roleDoc) return res.status(404).json({ message: `Role ${targetRole} not found` });

    user.roleId = roleDoc._id;
    await user.save();
    
    // Refresh user object to return with populated role
    const updatedUser = await User.findById(user._id).select('-password').populate('roleId', 'roleName');
    res.json({ message: `User role updated to ${targetRole}`, user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
