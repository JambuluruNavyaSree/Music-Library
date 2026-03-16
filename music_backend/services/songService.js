const mongoose = require('mongoose');
const Song = require('../models/Song');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Artist = require('../models/Artist');
const directorService = require('./directorService');
const albumService = require('./albumService');

// Find or create an artist by name
const findOrCreateArtist = async (name) => {
  if (!name) return null;
  let artist = await Artist.findOne({ artistName: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
  if (!artist) artist = await Artist.create({ artistName: name.trim() });
  return artist;
};

// Helper to resolve metadata names to IDs
const resolveMetadata = async (data) => {
  const isValidId = (val) => {
    if (!val || typeof val !== 'string') return false;
    return mongoose.Types.ObjectId.isValid(val) && /^[0-9a-fA-F]{24}$/.test(val);
  };
  
  let directorId = null;
  let albumId = null;

  console.log('[resolveMetadata] Input:', { 
    albumId: data.albumId, 
    albumName: data.albumName, 
    directorId: data.directorId, 
    directorName: data.directorName,
    releaseDate: data.releaseDate
  });

  // 1. Resolve Director
  if (data.directorName) {
    const director = await directorService.findOrCreateDirector(data.directorName);
    directorId = director?._id;
  } else if (data.directorId) {
    if (isValidId(data.directorId)) {
      directorId = data.directorId;
    } else {
      // It's a name passed in the ID field
      const director = await directorService.findOrCreateDirector(data.directorId);
      directorId = director?._id;
    }
  }

  // If a photo was uploaded, update the director
  if (directorId && data.directorPhotoPath) {
    await directorService.updateDirectorPhoto(directorId, data.directorPhotoPath);
  }

  // 2. Resolve Album
  if (data.albumName) {
    const album = await albumService.findOrCreateAlbum(
      data.albumName, 
      data.directorName || data.directorId,
      data.albumCoverPath,
      data.releaseDate
    );
    albumId = album?._id;
    if (!directorId && album?.directorId) directorId = album.directorId;
  } else if (data.albumId) {
    if (isValidId(data.albumId)) {
      albumId = data.albumId;
      if (data.releaseDate) {
        await albumService.updateAlbum(albumId, { releaseDate: data.releaseDate });
      }
    } else {
      // It's a name passed in the ID field
      const album = await albumService.findOrCreateAlbum(
        data.albumId, 
        data.directorName || data.directorId,
        data.albumCoverPath,
        data.releaseDate
      );
      albumId = album?._id;
      if (!directorId && album?.directorId) directorId = album.directorId;
    }
  }

  // 3. Resolve Artist name(s) if provided as text
  let resolvedArtistIds = null;
  if (data.artistName) {
    const names = data.artistName.split(',').map(n => n.trim()).filter(Boolean);
    const artistDocs = await Promise.all(names.map(n => findOrCreateArtist(n)));
    resolvedArtistIds = artistDocs.filter(Boolean).map(a => a._id);
  }

  console.log('[resolveMetadata] Resolved:', { albumId, directorId, resolvedArtistIds });
  return { albumId, directorId, resolvedArtistIds };
};

// Get all visible songs with optional search filters
const getAllSongs = async ({ search, artist, album, director, all }) => {
  let query = {};
  // Only filter visible songs unless `all` flag is set (admin usage)
  if (!all) query.isVisible = true;
  if (search) query.songName = { $regex: search, $options: 'i' };

  let result = await Song.find(query)
    .populate('albumId')
    .populate('artistId')
    .populate('directorId');

  if (artist)   result = result.filter(s => s.artistId.some(a => a.artistName?.match(new RegExp(artist, 'i'))));
  if (album)    result = result.filter(s => s.albumId?.albumName?.match(new RegExp(album, 'i')));
  if (director) result = result.filter(s => s.directorId?.directorName?.match(new RegExp(director, 'i')));

  return result.map(s => {
    const obj = s.toObject();
    obj.filePath = (obj.filePath || '').replace(/\\/g, '/');
    if (obj.coverImage) {
      const ci = obj.coverImage.replace(/\\/g, '/');
      const cleanCI = ci.startsWith('/') ? ci : `/${ci}`;
      obj.coverImage = encodeURI(cleanCI);
    }
    return obj;
  });
};

// Get single song by ID
const getSongById = async (id) => {
  const song = await Song.findById(id).populate('albumId').populate('artistId').populate('directorId');
  if (!song) throw new Error('Song not found');
  const obj = song.toObject();
  obj.filePath = (obj.filePath || '').replace(/\\/g, '/');
  if (obj.coverImage) {
    const ci = obj.coverImage.replace(/\\/g, '/');
    const cleanCI = ci.startsWith('/') ? ci : `/${ci}`;
    obj.coverImage = encodeURI(cleanCI);
  }
  return obj;
};

// Add new song and broadcast notification to ALL users
const addSong = async (body, filePath, coverImagePath, directorPhotoPath, adminUserId) => {
  if (!filePath) throw new Error('Song file is required');

  const { albumId, directorId, resolvedArtistIds } = await resolveMetadata({
    ...body,
    albumCoverPath: coverImagePath,
    directorPhotoPath: directorPhotoPath
  });

  if (!albumId || !directorId) {
    throw new Error(`Failed to resolve Album (${body.albumId || body.albumName}) or Director (${body.directorId || body.directorName}) to a valid ID. Please ensure they exist or are named correctly.`);
  }

  // Use resolved artist IDs from name, or fall back to IDs sent directly
  let artistIds = resolvedArtistIds;
  if (!artistIds) {
    const raw = body.artistId;
    if (Array.isArray(raw)) {
      artistIds = raw;
    } else if (typeof raw === 'string') {
      try {
        // Try parsing only if it looks like a JSON array
        artistIds = raw.startsWith('[') ? JSON.parse(raw) : [raw];
      } catch (e) {
        artistIds = [raw]; // Fallback to treating as single ID
      }
    } else {
      artistIds = [];
    }
  }

  const song = await Song.create({
    songName:   body.songName,
    albumId:    albumId,
    artistId:   artistIds,
    directorId: directorId,
    duration:   body.duration,
    filePath:   filePath ? filePath.replace(/\\/g, '/') : null,
    coverImage: coverImagePath ? `/${coverImagePath.replace(/\\/g, '/')}` : null
  });

  // If album doesn't have a cover, use this song's cover as a sticky fallback
  if (coverImagePath) {
    const Album = require('../models/Album');
    await Album.findByIdAndUpdate(albumId, { $setOnInsert: { coverImage: `/${coverImagePath.replace(/\\/g, '/')}` } });
    // Or simpler: if album cover is null, set it.
    const album = await Album.findById(albumId);
    if (album && !album.coverImage) {
      album.coverImage = `/${coverImagePath.replace(/\\/g, '/')}`;
      await album.save();
    }
  }

  // Broadcast logic
  try {
    const allUsers = await User.find({}, '_id');
    const notifications = allUsers.map(u => ({
      userId:  u._id,
      type:    'new_song',
      songId:  song._id,
      message: `New song added: ${song.songName}`
    }));
    if (notifications.length > 0) await Notification.insertMany(notifications);
  } catch (err) {
    console.error('Notification broadcast failed:', err);
  }

  // Return with populated fields so names are visible immediately
  const populated = await Song.findById(song._id)
    .populate('albumId')
    .populate('artistId')
    .populate('directorId');
  return populated;
};

// Update song details
const updateSong = async (id, data, filePath, coverImagePath, directorPhotoPath) => {
  const { albumId, directorId, resolvedArtistIds } = await resolveMetadata({
    ...data,
    albumCoverPath: coverImagePath,
    directorPhotoPath: directorPhotoPath
  });
  
  const updateFields = {};
  if (data.songName)   updateFields.songName = data.songName;
  if (data.duration)   updateFields.duration = data.duration;
  if ('isVisible' in data) updateFields.isVisible = data.isVisible;
  if (albumId)         updateFields.albumId = albumId;
  if (directorId)      updateFields.directorId = directorId;
  if (resolvedArtistIds) {
    updateFields.artistId = resolvedArtistIds;
  } else if (data.artistId) {
    const raw = data.artistId;
    if (Array.isArray(raw)) {
      updateFields.artistId = raw;
    } else if (typeof raw === 'string') {
      try {
        updateFields.artistId = raw.startsWith('[') ? JSON.parse(raw) : [raw];
      } catch (e) {
        updateFields.artistId = [raw];
      }
    }
  }
  // Update files only if new ones were uploaded
  if (filePath)        updateFields.filePath    = filePath.replace(/\\/g, '/');
  if (coverImagePath)  updateFields.coverImage  = `/${coverImagePath.replace(/\\/g, '/')}`;

  const song = await Song.findByIdAndUpdate(id, updateFields, { new: true })
    .populate('albumId')
    .populate('artistId')
    .populate('directorId');
    
  if (!song) throw new Error('Song not found');
  return song;
};

// Delete a song
const deleteSong = async (id) => {
  const song = await Song.findByIdAndDelete(id);
  if (!song) throw new Error('Song not found');
  return song;
};

// Toggle song visibility (show/hide from users)
const toggleVisibility = async (id) => {
  const song = await Song.findById(id);
  if (!song) throw new Error('Song not found');
  song.isVisible = !song.isVisible;
  await song.save();
  return song;
};

module.exports = { getAllSongs, getSongById, addSong, updateSong, deleteSong, toggleVisibility };