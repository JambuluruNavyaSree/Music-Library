const mongoose = require('mongoose');
const { Schema } = mongoose;

const albumSchema = new Schema({
  albumName:   { type: String, required: true },
  releaseDate: { type: Date },
  directorId:  { type: Schema.Types.ObjectId, ref: 'MusicDirector' },
  coverImage:  { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Album', albumSchema);
