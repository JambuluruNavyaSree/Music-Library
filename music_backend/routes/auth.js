const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { uploadProfile } = require('../middleware/upload');
const authService = require('../services/authService');

// Register
router.post('/register', async (req, res) => {
  try {
    await authService.registerUser(req.body);
    res.status(201).json({ message: 'Registered successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const result = await authService.loginUser(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Upload profile picture
router.post('/profile-picture', protect, uploadProfile.single('profilePicture'), async (req, res) => {
  try {
    const user = await authService.updateProfilePicture(req.user.id, req.file.path);
    res.json({ message: 'Profile picture updated', profilePicture: user.profilePicture });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await authService.getUserProfile(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
