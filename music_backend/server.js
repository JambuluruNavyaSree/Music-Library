const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
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

// if (require.main === module) {
//   mongoose.connect(process.env.MONGO_URI)
//     .then(() => {
//       console.log('MongoDB connected');
//       app.listen(process.env.PORT, () =>
//         console.log(`Server running on port ${process.env.PORT}`)
//       );
//     })
//     .catch(err => console.log(err));
// }
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const server = http.createServer(app);

const wss = new WebSocketServer({ server });
initWebSocket(wss);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`WebSocket server is ready`);
});
// module.exports = app;