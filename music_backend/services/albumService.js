const mongoose = require('mongoose');
const Album = require('../models/Album');
const directorService = require('./directorService');

const getAllAlbums = async () => await Album.find().populate('directorId');

const findOrCreateAlbum = async (albumName, directorName) => {
  if (!albumName) return null;
  
  // Resolve director first if name provided
  let directorId = null;
  if (directorName) {
    const director = await directorService.findOrCreateDirector(directorName);
    if (director) directorId = director._id;
  }

  let album = await Album.findOne({ albumName: { $regex: new RegExp(`^${albumName}$`, 'i') } });
  if (!album) {
    album = await Album.create({ albumName, directorId });
  } else if (directorId && !album.directorId) {
    // Update existing album if it didn't have a director
    album.directorId = directorId;
    await album.save();
  }
  return album;
};

const addAlbum = async (data) => {
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
    coverImage: data.coverImage
  });
};

const updateAlbum = async (id, data) => {
  const isValidId = (val) => mongoose.Types.ObjectId.isValid(val) && /^[0-9a-fA-F]{24}$/.test(val);
  let directorId = data.directorId;

  console.log('[updateAlbum] Input director:', data.directorId, data.directorName);

  if (data.directorName || (data.directorId && !isValidId(data.directorId))) {
    const director = await directorService.findOrCreateDirector(data.directorName || data.directorId);
    directorId = director?._id;
  }

  console.log('[updateAlbum] Resolved directorId:', directorId);

  // Use explicit update object to avoid passing string names to the model
  const updateFields = {
    albumName: data.albumName,
    releaseDate: data.releaseDate,
    coverImage: data.coverImage,
    directorId: directorId
  };

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
