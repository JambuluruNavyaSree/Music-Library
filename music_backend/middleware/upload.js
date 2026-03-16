const multer = require('multer');
const path = require('path');

// Helper to create storage config
const createStorage = (folder, nameFn) => multer.diskStorage({
  destination: (req, file, cb) => cb(null, `uploads/${folder}`),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${nameFn(req)}_${Date.now()}${ext}`);
  }
});

// Profile picture storage
const profileStorage = createStorage('profiles', () => 'profile');

// Song file storage
const songStorage = createStorage('songs', (req) => {
  return req.body.songName
    ? req.body.songName.trim().replace(/\s+/g, '_')
    : `song_${Date.now()}`;
});

// Artist photo storage
const artistStorage = createStorage('artists', (req) => {
  return req.body.artistName
    ? req.body.artistName.trim().replace(/\s+/g, '_')
    : 'artist';
});

// Director photo storage
const directorStorage = createStorage('directors', (req) => {
  return req.body.directorName
    ? req.body.directorName.trim().replace(/\s+/g, '_')
    : 'director';
});

// ── Custom storage that routes songFile→songs/, coverImage→covers/, directorPhoto→directors/ ──
const songWithCoverStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'coverImage') {
      cb(null, 'uploads/covers');
    } else if (file.fieldname === 'directorPhoto') {
      cb(null, 'uploads/directors');
    } else if (file.fieldname === 'artistPhotos') {
      cb(null, 'uploads/artists');
    } else {
      cb(null, 'uploads/songs');
    }
  },
  filename: (req, file, cb) => {
    const ext  = path.extname(file.originalname);
    const base = req.body.songName
      ? req.body.songName.trim().replace(/\s+/g, '_')
      : `file_${Date.now()}`;
    cb(null, `${base}_${Date.now()}${ext}`);
  }
});

// File type filter — audio for songFile, image for coverImage/directorPhoto/artistPhotos
const songWithCoverFilter = (req, file, cb) => {
  if (file.fieldname === 'coverImage' || file.fieldname === 'directorPhoto' || file.fieldname === 'artistPhotos') {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error(`${file.fieldname} must be an image file`), false);
  } else {
    if (file.mimetype.startsWith('audio/')) cb(null, true);
    else cb(new Error('Song must be an audio file'), false);
  }
};

exports.uploadProfile  = multer({ storage: profileStorage });
exports.uploadSong     = multer({ storage: songStorage });
exports.uploadArtist   = multer({ storage: artistStorage });
exports.uploadDirector = multer({ storage: directorStorage });

// Combined upload: songFile, coverImage, directorPhoto, artistPhotos
exports.uploadSongWithCover = multer({
  storage: songWithCoverStorage,
  fileFilter: songWithCoverFilter
}).fields([
  { name: 'songFile',      maxCount: 1 },
  { name: 'coverImage',    maxCount: 1 },
  { name: 'directorPhoto', maxCount: 1 },
  { name: 'artistPhotos',  maxCount: 10 }
]);

// Album cover upload
const albumCoverStorage = createStorage('covers', (req) => {
  return req.body.albumName
    ? req.body.albumName.trim().replace(/\s+/g, '_')
    : 'album';
});

exports.uploadAlbumCover = multer({
  storage: albumCoverStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Cover must be an image file'), false);
  }
}).single('coverImage');
