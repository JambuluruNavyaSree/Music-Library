const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema({
  userId:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type:    { type: String, enum: ['new_song', 'system'] },
  songId:  { type: Schema.Types.ObjectId, ref: 'Song' },
  message: { type: String, required: true },
  isRead:  { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
