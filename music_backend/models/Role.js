const mongoose = require('mongoose');
const { Schema } = mongoose;

const roleSchema = new Schema({
  roleName: { type: String, enum: ['admin', 'user'], default: 'user' }
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);
