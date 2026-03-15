const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const { uploadArtist } = require('../middleware/upload');
const artistService = require('../services/artistService');

// Get all artists
router.get('/', protect, async (req, res) => {
  try {
    res.json(await artistService.getAllArtists());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add artist — photo optional (form-data)
router.post('/', protect, adminOnly, uploadArtist.single('artistPhoto'), async (req, res) => {
  try {
    const artist = await artistService.addArtist(req.body, req.file ? req.file.path : null);
    res.status(201).json(artist);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update artist details
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    res.json(await artistService.updateArtist(req.params.id, req.body));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Upload or update artist photo later
router.patch('/:id/photo', protect, adminOnly, uploadArtist.single('artistPhoto'), async (req, res) => {
  try {
    const artist = await artistService.updateArtistPhoto(req.params.id, req.file.path);
    res.json({ message: 'Artist photo updated', artist });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete artist
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await artistService.deleteArtist(req.params.id);
    res.json({ message: 'Artist deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
