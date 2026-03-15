const mongoose = require('mongoose');
const { Schema } = mongoose;

const musicDirectorSchema = new Schema({
  directorName:  { type: String, required: true },
  directorPhoto: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('MusicDirector', musicDirectorSchema);
