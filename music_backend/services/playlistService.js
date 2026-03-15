const Playlist = require('../models/Playlist');

const BACKEND = process.env.BACKEND_URL || 'http://localhost:5000';

// Normalise a single song object's coverImage to a full URL
const fixSong = (song) => {
  if (!song) return song;
  const obj = song.toObject ? song.toObject() : { ...song };
  if (obj.coverImage && !obj.coverImage.startsWith('http')) {
    const path = obj.coverImage.replace(/\\/g, '/');
    const cleanPath = path.startsWith('/') ? path : '/' + path;
    obj.coverImage = `${BACKEND}${encodeURI(cleanPath)}`;
  }
  return obj;
};

// Get all playlists for a user
const getUserPlaylists = async (userId) => {
  const playlists = await Playlist.find({ userId }).populate('songs');
  return playlists.map(pl => {
    const obj = pl.toObject();
    obj.songs = (obj.songs || []).map(fixSong);
    return obj;
  });
};

// Get a single playlist by ID (with full song details)
const getPlaylistById = async (id, userId) => {
  const playlist = await Playlist.findOne({ _id: id, userId })
    .populate({
      path: 'songs',
      populate: [
        { path: 'artistId',   select: 'artistName' },
        { path: 'albumId',    select: 'albumName'  },
        { path: 'directorId', select: 'directorName' },
      ],
    });
  if (!playlist) throw new Error('Playlist not found');
  const obj = playlist.toObject();
  obj.songs = (obj.songs || []).map(fixSong);
  return obj;
};

// Create a new playlist
const createPlaylist = async (userId, data) => {
  return await Playlist.create({ ...data, userId });
};

// Update playlist name
const updatePlaylist = async (id, userId, data) => {
  const playlist = await Playlist.findOneAndUpdate(
    { _id: id, userId },
    data,
    { new: true }
  );
  if (!playlist) throw new Error('Playlist not found');
  return playlist;
};

// Delete a playlist
const deletePlaylist = async (id, userId) => {
  const playlist = await Playlist.findOneAndDelete({ _id: id, userId });
  if (!playlist) throw new Error('Playlist not found');
  return playlist;
};

// Add a song to a playlist
const addSongToPlaylist = async (id, userId, songId) => {
  if (!songId) throw new Error('songId required');
  const playlist = await Playlist.findOneAndUpdate(
    { _id: id, userId },
    { $addToSet: { songs: songId } },
    { new: true }
  );
  if (!playlist) throw new Error('Playlist not found');
  return playlist;
};

// Remove a song from a playlist
const removeSongFromPlaylist = async (id, userId, songId) => {
  const playlist = await Playlist.findOneAndUpdate(
    { _id: id, userId },
    { $pull: { songs: songId } },
    { new: true }
  );
  if (!playlist) throw new Error('Playlist not found');
  return playlist;
};

module.exports = {
  getUserPlaylists, getPlaylistById, createPlaylist, updatePlaylist,
  deletePlaylist, addSongToPlaylist, removeSongFromPlaylist
};
