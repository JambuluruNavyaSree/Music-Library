const router = require('express').Router();
const { protect } = require('../middleware/auth');
const playlistService = require('../services/playlistService');

// Get my playlists
router.get('/', protect, async (req, res) => {
  try {
    const playlists = await playlistService.getUserPlaylists(req.user.id);
    res.json(playlists);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single playlist by ID (with full song details)
router.get('/:id', protect, async (req, res) => {
  try {
    const playlist = await playlistService.getPlaylistById(req.params.id, req.user.id);
    res.json(playlist);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});

// Create playlist
router.post('/', protect, async (req, res) => {
  try {
    const playlist = await playlistService.createPlaylist(req.user.id, req.body);
    res.status(201).json(playlist);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update playlist
router.put('/:id', protect, async (req, res) => {
  try {
    const playlist = await playlistService.updatePlaylist(req.params.id, req.user.id, req.body);
    res.json(playlist);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});

// Delete playlist
router.delete('/:id', protect, async (req, res) => {
  try {
    await playlistService.deletePlaylist(req.params.id, req.user.id);
    res.json({ message: 'Playlist deleted' });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});

// Add song to playlist
router.post('/:id/songs', protect, async (req, res) => {
  try {
    const playlist = await playlistService.addSongToPlaylist(req.params.id, req.user.id, req.body.songId);
    res.json(playlist);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Remove song from playlist
router.delete('/:id/songs/:songId', protect, async (req, res) => {
  try {
    const playlist = await playlistService.removeSongFromPlaylist(req.params.id, req.user.id, req.params.songId);
    res.json(playlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
