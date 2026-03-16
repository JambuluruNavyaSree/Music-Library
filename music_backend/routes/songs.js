const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const { uploadSongWithCover } = require('../middleware/upload');
const songService = require('../services/songService');


// Get all visible songs with optional search
router.get('/', protect, async (req, res) => {
  try {
    const songs = await songService.getAllSongs(req.query);
    res.json(songs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const song = await songService.getSongById(req.params.id);
    res.json(song);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});

// Admin: Add song with audio file + optional cover image
router.post(
  '/',
  protect,
  adminOnly,
  uploadSongWithCover,
  async (req, res) => {
    try {
      const songFile      = req.files?.songFile?.[0];
      const coverFile     = req.files?.coverImage?.[0];
      const directorPhoto = req.files?.directorPhoto?.[0];
      const artistPhotos  = req.files?.artistPhotos || [];

      const song = await songService.addSong(
        req.body,
        songFile ? songFile.path : null,
        coverFile ? coverFile.path : null,
        directorPhoto ? directorPhoto.path : null,
        artistPhotos.map(f => ({ path: f.path, originalName: f.originalname })),
        req.user.id
      );
      res.status(201).json(song);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);


// Admin: Update song (supports new audio file + new cover image)
router.put('/:id', protect, adminOnly, uploadSongWithCover, async (req, res) => {
  try {
    const songFile      = req.files?.songFile?.[0];
    const coverFile     = req.files?.coverImage?.[0];
    const directorPhoto = req.files?.directorPhoto?.[0];
    const artistPhotos  = req.files?.artistPhotos || [];

    const song = await songService.updateSong(
      req.params.id,
      req.body,
      songFile      ? songFile.path      : null,
      coverFile     ? coverFile.path     : null,
      directorPhoto ? directorPhoto.path : null,
      artistPhotos.map(f => ({ path: f.path, originalName: f.originalname }))
    );
    res.json(song);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// Admin: Delete song
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await songService.deleteSong(req.params.id);
    res.json({ message: 'Song deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Admin: Toggle visibility
router.patch('/:id/visibility', protect, adminOnly, async (req, res) => {
  try {
    const song = await songService.toggleVisibility(req.params.id);

    res.json({
      message: `Song is now ${song.isVisible ? 'visible' : 'hidden'}`,
      song
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// User: Record song play for history
router.post('/:id/play', protect, async (req, res) => {
  try {
    const User = require('../models/User');
    // Remove existing entry for same song, then push new one at front, cap at 20
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { playHistory: { songId: req.params.id } }
    });
    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        playHistory: {
          $each: [{ songId: req.params.id, playedAt: new Date() }],
          $position: 0,
          $slice: 20
        }
      }
    });
    res.json({ message: 'Play recorded' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;