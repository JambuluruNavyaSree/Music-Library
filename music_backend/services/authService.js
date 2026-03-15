const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const fs = require('fs');

// Register a new user
const registerUser = async ({ name, email, phone, password }) => {
  const role = await Role.findOne({ roleName: 'user' });
  if (!role) throw new Error('Default role not found. Please seed roles first.');
  const hashed = await bcrypt.hash(password, 10);
  return await User.create({ name, email, phone, password: hashed, roleId: role._id });
};

// Login
const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).populate('roleId');
  if (!user) throw new Error('User not found');
  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error('Wrong password');
  const roleName = user.roleId.roleName;
  const token = jwt.sign({ id: user._id, role: roleName }, process.env.JWT_SECRET, { expiresIn: '1d' });
  return { token, user: { id: user._id, name: user.name, email: user.email, role: roleName } };
};

// Replace profile picture — deletes old file
const updateProfilePicture = async (userId, newFilePath) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // Delete old profile picture if exists
  if (user.profilePicture && fs.existsSync(user.profilePicture)) {
    fs.unlinkSync(user.profilePicture);
  }

  user.profilePicture = newFilePath ? newFilePath.replace(/\\/g, '/') : null;
  await user.save();
  return user;
};

// Get user profile without password
const getUserProfile = async (userId) => {
  return await User.findById(userId).select('-password').populate('roleId');
};

module.exports = { registerUser, loginUser, updateProfilePicture, getUserProfile };
