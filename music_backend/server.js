const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { WebSocketServer } = require('ws');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth',require('./routes/auth'));
app.use('/api/songs',require('./routes/songs'));
app.use('/api/playlists',require('./routes/playlists'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/artists',require('./routes/artists'));
app.use('/api/directors',require('./routes/directors'));
app.use('/api/albums',require('./routes/albums'));
app.use('/api/users', require('./routes/users'));

const PORT = process.env.PORT || 5000;

// Basic WebSocket initialization (placeholder since original logic was missing)
function initWebSocket(wss) {
  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    ws.on('close', () => console.log('Client disconnected from WebSocket'));
  });
}

const server = http.createServer(app);
const wss = new WebSocketServer({ server });
initWebSocket(wss);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`WebSocket server is ready`);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));