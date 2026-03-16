const mongoose = require('mongoose');
const Album = require('../models/Album');
const Song = require('../models/Song');
const directorService = require('./directorService');

const getAllAlbums = async () => {
  const albums = await Album.find().populate('directorId');
  
  // Enhance albums with song covers if missing
  const enhanced = await Promise.all(albums.map(async (a) => {
    const obj = a.toObject();
    
    // If no album cover, try to find a song in this album that has one
    if (!obj.coverImage) {
      const songWithCover = await Song.findOne({ albumId: a._id, coverImage: { $ne: null } });
      if (songWithCover) obj.coverImage = songWithCover.coverImage;
    }

    if (obj.coverImage) {
      const ci = obj.coverImage.replace(/\\/g, '/');
      const cleanCI = ci.startsWith('/') ? ci : `/${ci}`;
      obj.coverImage = encodeURI(cleanCI);
    }
    return obj;
  }));
  
  return enhanced;
};

const findOrCreateAlbum = async (albumName, directorName, fallbackCover = null, releaseDate = null) => {
  if (!albumName) return null;
  
  // Resolve director first if name provided
  let directorId = null;
  if (directorName) {
    const director = await directorService.findOrCreateDirector(directorName);
    if (director) directorId = director._id;
  }

  let album = await Album.findOne({ albumName: { $regex: new RegExp(`^${albumName}$`, 'i') } });
  if (!album) {
    album = await Album.create({ albumName, directorId, coverImage: fallbackCover, releaseDate });
  } else {
    // Update existing album if it didn't have a director, cover, or release date
    let changed = false;
    if (directorId && !album.directorId) {
      album.directorId = directorId;
      changed = true;
    }
    if (fallbackCover && !album.coverImage) {
      album.coverImage = fallbackCover;
      changed = true;
    }
    if (releaseDate && !album.releaseDate) {
      album.releaseDate = releaseDate;
      changed = true;
    }
    if (changed) await album.save();
  }
  return album;
};

const addAlbum = async (data, coverImagePath) => {
  const isValidId = (val) => mongoose.Types.ObjectId.isValid(val) && /^[0-9a-fA-F]{24}$/.test(val);
  let directorId = data.directorId;

  console.log('[addAlbum] Input director:', data.directorId, data.directorName);

  if (data.directorName || (data.directorId && !isValidId(data.directorId))) {
    const director = await directorService.findOrCreateDirector(data.directorName || data.directorId);
    directorId = director?._id;
  }

  console.log('[addAlbum] Resolved directorId:', directorId);

  return await Album.create({
    albumName: data.albumName,
    releaseDate: data.releaseDate,
    directorId: directorId,
    coverImage: coverImagePath ? `/${coverImagePath.replace(/\\/g, '/')}` : (data.coverImage || null)
  });
};

const updateAlbum = async (id, data, coverImagePath) => {
  const isValidId = (val) => mongoose.Types.ObjectId.isValid(val) && /^[0-9a-fA-F]{24}$/.test(val);
  let directorId = data.directorId;

  console.log('[updateAlbum] Input director:', data.directorId, data.directorName);

  if (data.directorName || (data.directorId && !isValidId(data.directorId))) {
    const director = await directorService.findOrCreateDirector(data.directorName || data.directorId);
    directorId = director?._id;
  }

  console.log('[updateAlbum] Resolved directorId:', directorId);

  const updateFields = {
    albumName: data.albumName,
    releaseDate: data.releaseDate,
    directorId: directorId
  };
  if (coverImagePath) updateFields.coverImage = `/${coverImagePath.replace(/\\/g, '/')}`;

  const album = await Album.findByIdAndUpdate(id, updateFields, { new: true });
  if (!album) throw new Error('Album not found');
  return album;
};

const deleteAlbum = async (id) => {
  const album = await Album.findByIdAndDelete(id);
  if (!album) throw new Error('Album not found');
  return album;
};

module.exports = { getAllAlbums, addAlbum, updateAlbum, deleteAlbum, findOrCreateAlbum };
