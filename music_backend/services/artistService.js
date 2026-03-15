const Artist = require('../models/Artist');
const fs = require('fs');

const getAllArtists = async () => await Artist.find();

const addArtist = async (data, photoPath) => {
  return await Artist.create({
    artistName:  data.artistName,
    artistPhoto: photoPath ? photoPath.replace(/\\/g, '/') : null
  });
};

const updateArtist = async (id, data) => {
  const artist = await Artist.findByIdAndUpdate(id, data, { new: true });
  if (!artist) throw new Error('Artist not found');
  return artist;
};

// Upload or replace artist photo — deletes old file
const updateArtistPhoto = async (id, newPhotoPath) => {
  const artist = await Artist.findById(id);
  if (!artist) throw new Error('Artist not found');

  // Delete old photo if exists
  if (artist.artistPhoto && fs.existsSync(artist.artistPhoto)) {
    fs.unlinkSync(artist.artistPhoto);
  }

  artist.artistPhoto = newPhotoPath ? newPhotoPath.replace(/\\/g, '/') : null;
  await artist.save();
  return artist;
};

const deleteArtist = async (id) => {
  const artist = await Artist.findByIdAndDelete(id);
  if (!artist) throw new Error('Artist not found');

  // Delete photo file if exists
  if (artist.artistPhoto && fs.existsSync(artist.artistPhoto)) {
    fs.unlinkSync(artist.artistPhoto);
  }

  return artist;
};

module.exports = { getAllArtists, addArtist, updateArtist, updateArtistPhoto, deleteArtist };
