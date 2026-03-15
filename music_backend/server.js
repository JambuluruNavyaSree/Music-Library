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

// Serve static files from the frontend build folder
app.use(express.static(path.join(__dirname, '../music_frontend/build')));

// Catch-all route to serve the frontend's index.html
app.get('(.*)', (req, res) => {
  res.sendFile(path.join(__dirname, '../music_frontend/build', 'index.html'));
});

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