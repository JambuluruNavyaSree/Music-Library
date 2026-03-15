const mongoose = require('mongoose');
require('dotenv').config();

async function test_regex() {
  const name = "A(B";
  try {
    console.log('Testing unsafe RegExp construction with:', name);
    const regex = new RegExp(`^${name}$`, 'i');
    console.log('RegExp created:', regex);
  } catch (err) {
    console.error('CRASHED! Error:', err.message);
  }
}

test_regex();
