const mongoose = require('mongoose');
const { Schema } = mongoose;

const artistSchema = new Schema({
  artistName:  { type: String, required: true },
  artistPhoto: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Artist', artistSchema);
