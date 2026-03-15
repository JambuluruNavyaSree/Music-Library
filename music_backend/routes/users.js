const router = require('express').Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

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

module.exports = router;
