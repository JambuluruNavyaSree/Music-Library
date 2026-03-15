const MusicDirector = require('../models/MusicDirector');
const fs = require('fs');

const getAllDirectors = async () => await MusicDirector.find();

const findOrCreateDirector = async (name) => {
  if (!name) return null;
  let director = await MusicDirector.findOne({ directorName: { $regex: new RegExp(`^${name}$`, 'i') } });
  if (!director) {
    director = await MusicDirector.create({ directorName: name });
  }
  return director;
};

const addDirector = async (data, photoPath) => {
  return await MusicDirector.create({
    directorName:  data.directorName,
    directorPhoto: photoPath ? photoPath.replace(/\\/g, '/') : null
  });
};

const updateDirector = async (id, data) => {
  const director = await MusicDirector.findByIdAndUpdate(id, data, { new: true });
  if (!director) throw new Error('Director not found');
  return director;
};

// Upload or replace director photo — deletes old file
const updateDirectorPhoto = async (id, newPhotoPath) => {
  const director = await MusicDirector.findById(id);
  if (!director) throw new Error('Director not found');

  // Delete old photo if exists
  if (director.directorPhoto && fs.existsSync(director.directorPhoto)) {
    fs.unlinkSync(director.directorPhoto);
  }

  director.directorPhoto = newPhotoPath ? newPhotoPath.replace(/\\/g, '/') : null;
  await director.save();
  return director;
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
