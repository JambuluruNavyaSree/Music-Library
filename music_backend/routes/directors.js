const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const { uploadDirector } = require('../middleware/upload');
const directorService = require('../services/directorService');

// Get all directors
router.get('/', protect, async (req, res) => {
  try {
    res.json(await directorService.getAllDirectors());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add director — photo optional (form-data)
router.post('/', protect, adminOnly, uploadDirector.single('directorPhoto'), async (req, res) => {
  try {
    const director = await directorService.addDirector(req.body, req.file ? req.file.path : null);
    res.status(201).json(director);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update director details
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    res.json(await directorService.updateDirector(req.params.id, req.body));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Upload or update director photo later
router.patch('/:id/photo', protect, adminOnly, uploadDirector.single('directorPhoto'), async (req, res) => {
  try {
    const director = await directorService.updateDirectorPhoto(req.params.id, req.file.path);
    res.json({ message: 'Director photo updated', director });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete director
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await directorService.deleteDirector(req.params.id);
    res.json({ message: 'Director deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
