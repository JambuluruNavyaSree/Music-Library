const mongoose = require('mongoose');
const { Schema } = mongoose;

const playlistSchema = new Schema({
  playlistName: { type: String, required: true },
  userId:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
  songs:        [{ type: Schema.Types.ObjectId, ref: 'Song' }]
}, { timestamps: true });

module.exports = mongoose.model('Playlist', playlistSchema);
