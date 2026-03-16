const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const MusicDirector = require('./models/MusicDirector');
const Song = require('./models/Song');
const Album = require('./models/Album');

async function consolidate() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI not found in .env');
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const directors = await MusicDirector.find();
    console.log(`Found ${directors.length} directors.`);

    const normalizedMap = new Map(); // normalizedName -> primaryDirector
    let consolidatedCount = 0;

    // Sort so shortest names come first (usually the most correct one)
    const sortedDirectors = directors.sort((a, b) => a.directorName.length - b.directorName.length);

    for (const director of sortedDirectors) {
      const normalized = director.directorName
        .toLowerCase()
        .replace(/\./g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (normalizedMap.has(normalized)) {
        const primary = normalizedMap.get(normalized);
        console.log(`\nDuplicate found: "${director.directorName}" (${director._id})`);
        console.log(`Merging into: "${primary.directorName}" (${primary._id})`);

        const songUpdate = await Song.updateMany(
          { directorId: director._id },
          { directorId: primary._id }
        );
        console.log(`- Updated ${songUpdate.modifiedCount} songs.`);

        const albumUpdate = await Album.updateMany(
          { directorId: director._id },
          { directorId: primary._id }
        );
        console.log(`- Updated ${albumUpdate.modifiedCount} albums.`);

        if (director.directorPhoto && !primary.directorPhoto) {
          primary.directorPhoto = director.directorPhoto;
          await primary.save();
          console.log(`- Migrated photo to primary.`);
        }

        await MusicDirector.findByIdAndDelete(director._id);
        console.log(`- Deleted duplicate director record.`);
        consolidatedCount++;
      } else {
        normalizedMap.set(normalized, director);
      }
    }

    console.log(`\nConsolidation complete. Merged ${consolidatedCount} duplicates.`);
  } catch (err) {
    console.error('Error during consolidation:', err);
  } finally {
    await mongoose.disconnect();
  }
}

consolidate();
