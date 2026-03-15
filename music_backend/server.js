const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { WebSocketServer } = require('ws');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth',require('./routes/auth'));
app.use('/api/songs',require('./routes/songs'));
app.use('/api/playlists',require('./routes/playlists'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/artists',require('./routes/artists'));
app.use('/api/directors',require('./routes/directors'));
app.use('/api/albums',require('./routes/albums'));
app.use('/api/users', require('./routes/users'));

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));