const mongoose = require('mongoose');
require('dotenv').config();

const MusicDirector = require('./models/MusicDirector');
const Song = require('./models/Song');

async function removeWrongDirector() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI not found in .env');
    }
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

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

removeWrongDirector();
