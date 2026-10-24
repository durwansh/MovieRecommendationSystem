const fs = require('fs');
const readline = require('readline');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const csv = require('csv-parser');
const Movie = require('../models/Movie');
const Rating = require('../models/Rating');
const Watchlist = require('../models/Watchlist');
const User = require('../models/User');

dotenv.config({ path: '../.env' });

const TMDB_GENRES = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western'
};

async function loadCreditsMap() {
  console.log('⏳ Parsing TMDB credits (Cast & Crew)...');
  const creditsMap = new Map();

  return new Promise((resolve, reject) => {
    fs.createReadStream('tmdb_5000_credits.csv')
      .pipe(csv())
      .on('data', (row) => {
        try {
          const movieId = row.movie_id || row.id;
          let castList = [];
          let directorName = '';

          if (row.cast) {
            try {
              const castParsed = JSON.parse(row.cast);
              castList = castParsed.slice(0, 4).map(c => c.name);
            } catch (e) {}
          }

          if (row.crew) {
            try {
              const crewParsed = JSON.parse(row.crew);
              const dirObj = crewParsed.find(cr => cr.job === 'Director');
              if (dirObj) directorName = dirObj.name;
            } catch (e) {}
          }

          if (movieId) {
            creditsMap.set(String(movieId), {
              cast: castList,
              director: directorName
            });
          }
        } catch (err) {}
      })
      .on('end', () => {
        console.log(`✅ Loaded credits for ${creditsMap.size} movies.`);
        resolve(creditsMap);
      })
      .on('error', (err) => {
        console.warn('⚠️ Warning: credits parser had an error, proceeding with available credits:', err.message);
        resolve(creditsMap);
      });
  });
}

async function loadWeaviateMovies() {
  console.log('⏳ Parsing TMDB movies dataset...');
  const movies = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream('weaviate_movies.csv')
      .pipe(csv())
      .on('data', (row) => {
        try {
          if (!row.title || !row.poster_path || row.poster_path.trim() === '') return;

          let genres = [];
          if (row.genre_ids) {
            try {
              const parsedIds = JSON.parse(row.genre_ids.replace(/'/g, '"'));
              if (Array.isArray(parsedIds)) {
                genres = parsedIds.map(id => TMDB_GENRES[id] || 'Drama').filter(Boolean);
              }
            } catch (e) {
              genres = ['Drama'];
            }
          }
          if (genres.length === 0) genres = ['Drama'];

          const year = parseInt(row.year || (row.release_date ? row.release_date.split('-')[0] : '2018')) || 2018;
          const rating = parseFloat(row.vote_average) ? Math.min(5, Math.max(1, (parseFloat(row.vote_average) / 2))) : 4.0;
          const voteCount = parseInt(row.vote_count) || 100;

          const posterUrl = `https://image.tmdb.org/t/p/w500${row.poster_path.trim()}`;
          const bannerUrl = row.backdrop_path && row.backdrop_path.trim() !== ''
            ? `https://image.tmdb.org/t/p/original${row.backdrop_path.trim()}`
            : posterUrl;

          movies.push({
            tmdbId: String(row.id),
            title: row.title.trim(),
            description: row.overview && row.overview.trim() !== '' ? row.overview.trim() : 'An acclaimed cinematic journey.',
            releaseYear: year,
            genres: Array.from(new Set(genres)).slice(0, 4),
            duration: 110 + Math.floor(Math.random() * 40),
            posterUrl,
            bannerUrl,
            averageRating: parseFloat(rating.toFixed(1)),
            numRatings: voteCount
          });
        } catch (err) {}
      })
      .on('end', () => {
        console.log(`✅ Loaded ${movies.length} valid movies with TMDB posters.`);
        resolve(movies);
      })
      .on('error', reject);
  });
}

async function seedRealTMDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/movie_recommendation_db';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB.');

    const creditsMap = await loadCreditsMap();
    const rawMovies = await loadWeaviateMovies();

    const preparedMovies = rawMovies.map(m => {
      const credit = creditsMap.get(m.tmdbId);
      return {
        title: m.title,
        description: m.description,
        releaseYear: m.releaseYear,
        genres: m.genres,
        director: (credit && credit.director) || 'Renowned Filmmaker',
        cast: (credit && credit.cast && credit.cast.length > 0) ? credit.cast : ['Leading Actor', 'Co-Star'],
        duration: m.duration,
        posterUrl: m.posterUrl,
        bannerUrl: m.bannerUrl,
        trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        averageRating: m.averageRating,
        numRatings: m.numRatings
      };
    });

    console.log('🧹 Clearing old dummy movies...');
    await Movie.deleteMany({});
    console.log(`🚀 Inserting ${preparedMovies.length} authentic TMDB movies...`);
    const insertedMovies = await Movie.insertMany(preparedMovies);
    console.log(`🎉 Successfully inserted ${insertedMovies.length} TMDB movies into MongoDB!`);

    // Ensure demo users exist
    let admin = await User.findOne({ email: 'admin@movieai.com' });
    if (!admin) {
      admin = await User.create({
        name: 'CineAI Administrator',
        email: 'admin@movieai.com',
        password: 'adminpassword123',
        role: 'admin',
        preferredGenres: ['Sci-Fi', 'Action', 'Thriller']
      });
      console.log('👤 Created demo admin user.');
    }

    let user = await User.findOne({ email: 'user@movieai.com' });
    if (!user) {
      user = await User.create({
        name: 'Alex Johnson',
        email: 'user@movieai.com',
        password: 'userpassword123',
        role: 'user',
        preferredGenres: ['Sci-Fi', 'Drama', 'Adventure']
      });
      console.log('👤 Created demo normal user.');
    }

    // Refresh ratings for demo users using some newly inserted movies
    await Rating.deleteMany({});
    await Watchlist.deleteMany({});

    if (insertedMovies.length >= 8) {
      const topMovies = insertedMovies.slice(0, 8);
      const demoRatings = [
        { user: user._id, movie: topMovies[0]._id, score: 5, reviewText: 'An absolute cinematic masterpiece, mind-blowing!' },
        { user: user._id, movie: topMovies[1]._id, score: 5, reviewText: 'Emotional depth, visual spectacles, and stunning sound design.' },
        { user: user._id, movie: topMovies[2]._id, score: 4, reviewText: 'Incredible pacing and unforgettable performances.' },
        { user: user._id, movie: topMovies[3]._id, score: 4, reviewText: 'Great plot development and phenomenal direction.' },
        { user: admin._id, movie: topMovies[0]._id, score: 5, reviewText: 'Top notch production and storytelling.' },
        { user: admin._id, movie: topMovies[1]._id, score: 4, reviewText: 'Very well crafted!' },
        { user: admin._id, movie: topMovies[4]._id, score: 5, reviewText: 'A modern classic in its genre.' }
      ];
      await Rating.insertMany(demoRatings);
      console.log(`⭐ Created ${demoRatings.length} baseline ratings for hybrid engine testing.`);

      await Watchlist.insertMany([
        { user: user._id, movie: topMovies[4]._id },
        { user: user._id, movie: topMovies[5]._id }
      ]);
      console.log(`📌 Added 2 watchlist items.`);
    }

    console.log('==================================================');
    console.log('✅ DATABASE HAS BEEN UPGRADED TO REAL TMDB DATASET!');
    console.log(`📊 Total real movies loaded: ${insertedMovies.length}`);
    console.log('==================================================');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seedRealTMDB();
