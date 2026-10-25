const fs = require('fs');
const path = require('path');
const readline = require('readline');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const csv = require('csv-parser');

const Movie = require('../models/Movie');
const Rating = require('../models/Rating');
const Watchlist = require('../models/Watchlist');
const User = require('../models/User');
const { downloadDataset, TARGET_FILE } = require('./downloadDataset');

dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const ISO_LANG_MAP = {
  en: { language: 'English', industry: 'Hollywood' },
  hi: { language: 'Hindi', industry: 'Bollywood' },
  ja: { language: 'Japanese', industry: 'Japanese' },
  ko: { language: 'Korean', industry: 'Korean' },
  zh: { language: 'Mandarin', industry: 'World' },
  cn: { language: 'Cantonese', industry: 'World' },
  fr: { language: 'French', industry: 'European' },
  it: { language: 'Italian', industry: 'European' },
  de: { language: 'German', industry: 'European' },
  es: { language: 'Spanish', industry: 'European' },
  sv: { language: 'Swedish', industry: 'European' },
  ru: { language: 'Russian', industry: 'European' },
  pt: { language: 'Portuguese', industry: 'World' },
  ta: { language: 'Tamil', industry: 'Bollywood' },
  te: { language: 'Telugu', industry: 'Bollywood' },
  ml: { language: 'Malayalam', industry: 'Bollywood' },
  tr: { language: 'Turkish', industry: 'World' },
  ar: { language: 'Arabic', industry: 'World' }
};

// Parse command line arguments
const args = process.argv.slice(2);
function getArg(flag, defaultValue = null) {
  const idx = args.indexOf(flag);
  if (idx !== -1 && idx + 1 < args.length) {
    return args[idx + 1];
  }
  return defaultValue;
}

const LIMIT = parseInt(getArg('--limit', process.env.SEED_LIMIT || '0'), 10);
const BATCH_SIZE = parseInt(getArg('--batch', '5000'), 10);
const SHOULD_CLEAN = args.includes('--clean') || !args.includes('--append');

function parseMovieRow(row) {
  // Discard empty or corrupt rows without title or valid poster path
  if (!row.title || !row.poster_path || typeof row.poster_path !== 'string') return null;
  const posterClean = row.poster_path.trim();
  if (!posterClean.startsWith('/') || posterClean === '/None' || posterClean === 'None') return null;

  const rawYear = row.release_date ? parseInt(row.release_date.split('-')[0], 10) : null;
  const releaseYear = (rawYear && rawYear >= 1888 && rawYear <= 2030) ? rawYear : 2020;

  const voteAvg = parseFloat(row.vote_average) || parseFloat(row.averageRating);
  // Scale to 1.0 - 5.0 for the recommendation star scale
  const averageRating = voteAvg ? Math.min(5, Math.max(1, voteAvg <= 5 ? voteAvg : voteAvg / 2)) : 4.0;
  const numRatings = parseInt(row.vote_count, 10) || parseInt(row.numVotes, 10) || Math.floor(Math.random() * 200) + 15;

  let genres = [];
  if (row.genres) {
    genres = row.genres.split(',').map(s => s.trim()).filter(Boolean);
  }
  if (genres.length === 0) genres = ['Drama'];

  const langKey = (row.original_language || 'en').toLowerCase().trim();
  const langInfo = ISO_LANG_MAP[langKey] || { language: 'English', industry: 'Hollywood' };

  let cast = [];
  if (row.cast) {
    cast = row.cast.split(',').map(s => s.trim()).filter(Boolean).slice(0, 5);
  }
  if (cast.length === 0) cast = ['Leading Performer', 'Co-Star'];

  let director = 'Renowned Filmmaker';
  if (row.directors) {
    director = row.directors.split(',')[0].trim() || 'Renowned Filmmaker';
  }

  const posterUrl = `https://image.tmdb.org/t/p/w500${posterClean}`;
  const backdropClean = row.backdrop_path ? row.backdrop_path.trim() : '';
  const bannerUrl = (backdropClean && backdropClean.startsWith('/'))
    ? `https://image.tmdb.org/t/p/original${backdropClean}`
    : posterUrl;

  const overview = (row.overview && row.overview.trim().length > 10)
    ? row.overview.trim()
    : 'A compelling and visually stunning cinematic masterpiece.';

  return {
    tmdbId: String(row.id || ''),
    title: row.title.trim(),
    description: overview,
    releaseYear,
    genres: genres.slice(0, 4),
    director,
    cast,
    duration: parseInt(row.runtime, 10) || (105 + Math.floor(Math.random() * 35)),
    language: langInfo.language,
    industry: langInfo.industry,
    contentType: 'Movie',
    posterUrl,
    bannerUrl,
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    averageRating: parseFloat(averageRating.toFixed(1)),
    numRatings
  };
}

async function seed1MTMDB() {
  const startTime = Date.now();
  console.log('===============================================================');
  console.log('🎬 TMDB 1-MILLION MOVIE DATASET INGESTION & SEEDER PIPELINE');
  console.log('===============================================================');
  console.log(`Config: Batch Size = ${BATCH_SIZE} | Limit = ${LIMIT > 0 ? LIMIT : 'All (~1,000,000)'} | Clean = ${SHOULD_CLEAN}`);

  // 1. Connect to MongoDB
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/movie_recommendation_db';
  console.log(`\n🔌 Connecting to MongoDB: ${mongoUri}`);
  await mongoose.connect(mongoUri, { maxPoolSize: 50 });
  console.log('✅ Connected to MongoDB successfully.');

  // Ensure high-performance indexes are created
  console.log('⚡ Ensuring compound & single indexes exist on Movie collection...');
  await Movie.init();
  console.log('✅ Movie indexes ready.');

  // 2. Download / Verify Dataset
  let csvFilePath = TARGET_FILE;
  if (!fs.existsSync(csvFilePath) || fs.statSync(csvFilePath).size < 1000000) {
    console.log(`\n📦 Dataset file not found locally. Triggering download...`);
    csvFilePath = await downloadDataset();
  } else {
    console.log(`\n📂 Using local dataset: ${csvFilePath} (${(fs.statSync(csvFilePath).size / (1024 * 1024)).toFixed(1)} MB)`);
  }

  // 3. Clean existing movies if requested
  if (SHOULD_CLEAN) {
    console.log('🧹 Purging existing movie records for fresh 1M ingestion...');
    await Movie.deleteMany({});
    console.log('✅ Movie collection cleared.');
  }

  // 4. Stream and Batch Insert into MongoDB
  console.log('\n🚀 Starting streaming ingestion into MongoDB...');
  let currentBatch = [];
  let totalProcessed = 0;
  let totalInserted = 0;
  let batchIndex = 0;

  const stream = fs.createReadStream(csvFilePath)
    .pipe(csv());

  for await (const row of stream) {
    totalProcessed++;
    const movieDoc = parseMovieRow(row);
    if (movieDoc) {
      currentBatch.push({
        insertOne: {
          document: movieDoc
        }
      });
    }

    if (currentBatch.length >= BATCH_SIZE) {
      batchIndex++;
      const res = await Movie.bulkWrite(currentBatch, { ordered: false });
      totalInserted += res.insertedCount || currentBatch.length;
      currentBatch = [];

      const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
      const speed = Math.round(totalInserted / Math.max(1, (Date.now() - startTime) / 1000));
      const ramMb = (process.memoryUsage().heapUsed / (1024 * 1024)).toFixed(1);

      console.log(`🍿 [Batch #${batchIndex}] Inserted: ${totalInserted.toLocaleString()} movies | Speed: ${speed.toLocaleString()} m/s | RAM: ${ramMb}MB | Time: ${elapsedSec}s`);

      if (LIMIT > 0 && totalInserted >= LIMIT) {
        console.log(`\n🎯 Hit target limit of ${LIMIT.toLocaleString()} movies! Stopping stream.`);
        break;
      }
    }
  }

  // Flush remaining items
  if (currentBatch.length > 0 && (LIMIT === 0 || totalInserted < LIMIT)) {
    const res = await Movie.bulkWrite(currentBatch, { ordered: false });
    totalInserted += res.insertedCount || currentBatch.length;
    currentBatch = [];
  }

  const totalTimeSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n===============================================================');
  console.log(`🎉 INGESTION COMPLETE!`);
  console.log(`📊 Total Movies Processed: ${totalProcessed.toLocaleString()}`);
  console.log(`💾 Total Movies in MongoDB: ${totalInserted.toLocaleString()}`);
  console.log(`⏱️ Elapsed Time: ${totalTimeSec} seconds`);
  console.log('===============================================================');

  // 5. Seed Demo Users & Baseline Ratings
  console.log('\n👤 Verifying Demo Accounts & AI Recommendation Baselines...');
  let admin = await User.findOne({ email: 'admin@movieai.com' });
  if (!admin) {
    admin = await User.create({
      name: 'CineAI Administrator',
      email: 'admin@movieai.com',
      password: 'adminpassword123',
      role: 'admin',
      preferredGenres: ['Action', 'Science Fiction', 'Adventure']
    });
    console.log('✅ Created demo admin user: admin@movieai.com');
  }

  let user = await User.findOne({ email: 'user@movieai.com' });
  if (!user) {
    user = await User.create({
      name: 'Alex Johnson',
      email: 'user@movieai.com',
      password: 'userpassword123',
      role: 'user',
      preferredGenres: ['Science Fiction', 'Drama', 'Adventure']
    });
    console.log('✅ Created demo user: user@movieai.com');
  }

  // Baseline ratings
  const sampleTopMovies = await Movie.find({}).sort({ averageRating: -1, numRatings: -1 }).limit(10);
  if (sampleTopMovies.length >= 6) {
    await Rating.deleteMany({ user: { $in: [user._id, admin._id] } });
    await Watchlist.deleteMany({ user: user._id });

    await Rating.insertMany([
      { user: user._id, movie: sampleTopMovies[0]._id, score: 5, reviewText: 'A groundbreaking cinematic feat with unforgettable visuals!' },
      { user: user._id, movie: sampleTopMovies[1]._id, score: 5, reviewText: 'Tremendous depth, emotion, and soundscapes.' },
      { user: user._id, movie: sampleTopMovies[2]._id, score: 4, reviewText: 'Riveting storytelling from start to finish.' },
      { user: admin._id, movie: sampleTopMovies[0]._id, score: 5, reviewText: 'Exquisite directorial craftsmanship.' },
      { user: admin._id, movie: sampleTopMovies[3]._id, score: 4, reviewText: 'Classic narrative pacing and iconic cast.' }
    ]);

    await Watchlist.insertMany([
      { user: user._id, movie: sampleTopMovies[4]._id },
      { user: user._id, movie: sampleTopMovies[5]._id }
    ]);
    console.log('⭐ Baseline ratings & watchlist seeded for Hybrid Recommendation testing.');
  }

  console.log('\n🚀 All done! System is primed and ready with real TMDB movies and original posters.');
  process.exit(0);
}

if (require.main === module) {
  seed1MTMDB().catch(err => {
    console.error('❌ Seeder encountered fatal error:', err);
    process.exit(1);
  });
}

module.exports = { seed1MTMDB };
