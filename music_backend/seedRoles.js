const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Role = require('./models/Role');
require('dotenv').config();

const seedAll = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB:', process.env.MONGO_URI);

  // --- Step 1: Seed Roles ---
  let adminRole = await Role.findOne({ roleName: 'admin' });
  if (!adminRole) {
    adminRole = await Role.create({ roleName: 'admin' });
    console.log('✅ Admin role created.');
  } else {
    console.log('ℹ️  Admin role already exists.');
  }

  let userRole = await Role.findOne({ roleName: 'user' });
  if (!userRole) {
    await Role.create({ roleName: 'user' });
    console.log('✅ User role created.');
  } else {
    console.log('ℹ️  User role already exists.');
  }

  // --- Step 2: Seed Admin User ---
  const existing = await User.findOne({ email: 'admin@musiclibrary.com' });
  if (existing) {
    console.log('ℹ️  Admin user already exists:', existing.email);
    process.exit();
  }

  const hashed = await bcrypt.hash('Admin@123', 10);
  await User.create({
    name:     'Admin',
    email:    'admin@musicbook.com',
    phone:    '9999999999',
    password: hashed,
    roleId:   adminRole._id
  });

  console.log('\n🎉 Admin user created successfully!');
  console.log('   Email   : admin@musicbook.com');
  console.log('   Password: Admin@123');
  console.log('   >> Change the password after first login!\n');
  process.exit();
};

seedAll().catch(err => {
  console.error('Seed error:', err.message);
  process.exit(1);
});