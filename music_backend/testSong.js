const mongoose = require('mongoose');
const Song = require('./models/Song');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const songs = await Song.find({songName: /bagari/i}).populate('artistId');
  console.log(JSON.stringify(songs, null, 2));
  process.exit(0);
});
