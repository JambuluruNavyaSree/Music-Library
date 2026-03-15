const mongoose = require('mongoose');
const { Schema } = mongoose;

const songSchema = new Schema({
  songName:   { type: String, required: true },
  albumId:    { type: Schema.Types.ObjectId, ref: 'Album',         required: true },
  artistId:   [{ type: Schema.Types.ObjectId, ref: 'Artist' }],
  directorId: { type: Schema.Types.ObjectId, ref: 'MusicDirector', required: true },
  duration:   { type: Number },
  filePath:   { type: String, required: true },
  coverImage: { type: String, default: null },
  isVisible:  { type: Boolean, default: true }
}, { timestamps: true });

// Indexes for faster search
songSchema.index({ songName: 'text' });
songSchema.index({ artistId: 1 });
songSchema.index({ directorId: 1 });
songSchema.index({ albumId: 1 });

module.exports = mongoose.model('Song', songSchema);
