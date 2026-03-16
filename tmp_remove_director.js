const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'music_backend/.env') });

const MusicDirector = require('./music_backend/models/MusicDirector');
const Song = require('./music_backend/models/Song');

async function removeWrongDirector() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const name = 'Life Is Beautiful';
    const director = await MusicDirector.findOne({ 
      directorName: { $regex: new RegExp(`^${name}$`, 'i') } 
    });

    if (!director) {
      console.log(`Director "${name}" not found.`);
      return;
    }

    console.log(`Found director: "${director.directorName}" (${director._id})`);

    const songCount = await Song.countDocuments({ directorId: director._id });
    console.log(`This director has ${songCount} songs.`);

    // Delete the director
    await MusicDirector.findByIdAndDelete(director._id);
    console.log(`Deleted director "${director.directorName}".`);

    if (songCount > 0) {
      console.log(`WARNING: ${songCount} songs are now orphaned (no director).`);
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

removeWrongDirector();
