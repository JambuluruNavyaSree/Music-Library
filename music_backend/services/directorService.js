const MusicDirector = require('../models/MusicDirector');
const fs = require('fs');

const formatDirector = (director) => {
  if (!director) return null;
  const obj = director.toObject ? director.toObject() : director;
  if (obj.directorPhoto) {
    const dp = obj.directorPhoto.replace(/\\/g, '/');
    const cleanDP = dp.startsWith('/') ? dp : `/${dp}`;
    obj.directorPhoto = encodeURI(cleanDP);
  }
  return obj;
};

const getAllDirectors = async () => {
  const directors = await MusicDirector.find();
  return directors.map(formatDirector);
};

const findOrCreateDirector = async (name) => {
  if (!name) return null;
  const normalized = name.trim();
  let director = await MusicDirector.findOne({ 
    directorName: { $regex: new RegExp(`^${normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } 
  });
  if (!director) {
    director = await MusicDirector.create({ directorName: normalized });
  }
  return director;
};

const addDirector = async (data, photoPath) => {
  const director = await MusicDirector.create({
    directorName:  data.directorName,
    directorPhoto: photoPath ? photoPath.replace(/\\/g, '/') : null
  });
  return formatDirector(director);
};

const updateDirector = async (id, data) => {
  const director = await MusicDirector.findByIdAndUpdate(id, data, { new: true });
  if (!director) throw new Error('Director not found');
  return formatDirector(director);
};

// Upload or replace director photo — deletes old file
const updateDirectorPhoto = async (id, newPhotoPath) => {
  const director = await MusicDirector.findById(id);
  if (!director) throw new Error('Director not found');

  // Delete old photo if exists
  const oldPath = director.directorPhoto;
  if (oldPath && fs.existsSync(oldPath)) {
    fs.unlinkSync(oldPath);
  }

  director.directorPhoto = newPhotoPath ? newPhotoPath.replace(/\\/g, '/') : null;
  await director.save();
  return formatDirector(director);
};

const deleteDirector = async (id) => {
  const director = await MusicDirector.findByIdAndDelete(id);
  if (!director) throw new Error('Director not found');

  // Delete photo file if exists
  if (director.directorPhoto && fs.existsSync(director.directorPhoto)) {
    fs.unlinkSync(director.directorPhoto);
  }

  return director;
};

module.exports = { getAllDirectors, addDirector, updateDirector, updateDirectorPhoto, deleteDirector, findOrCreateDirector };
