const Artist = require('../models/Artist');
const fs = require('fs');

const formatArtist = (artist) => {
  if (!artist) return null;
  const obj = artist.toObject ? artist.toObject() : artist;
  if (obj.artistPhoto) {
    const ap = obj.artistPhoto.replace(/\\/g, '/');
    const cleanAP = ap.startsWith('/') ? ap : `/${ap}`;
    obj.artistPhoto = encodeURI(cleanAP);
  }
  return obj;
};

const getAllArtists = async () => {
  const artists = await Artist.find();
  return artists.map(formatArtist);
};

const addArtist = async (data, photoPath) => {
  const artist = await Artist.create({
    artistName:  data.artistName,
    artistPhoto: photoPath ? photoPath.replace(/\\/g, '/') : null
  });
  return formatArtist(artist);
};

const updateArtist = async (id, data) => {
  const artist = await Artist.findByIdAndUpdate(id, data, { new: true });
  if (!artist) throw new Error('Artist not found');
  return formatArtist(artist);
};

// Upload or replace artist photo — deletes old file
const updateArtistPhoto = async (id, newPhotoPath) => {
  const artist = await Artist.findById(id);
  if (!artist) throw new Error('Artist not found');

  // Delete old photo if exists
  const oldPath = artist.artistPhoto;
  if (oldPath && fs.existsSync(oldPath)) {
    fs.unlinkSync(oldPath);
  }

  artist.artistPhoto = newPhotoPath ? newPhotoPath.replace(/\\/g, '/') : null;
  await artist.save();
  return formatArtist(artist);
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
