const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Movie = require('../models/Movie');
const Rating = require('../models/Rating');
const Watchlist = require('../models/Watchlist');

dotenv.config({ path: '../.env' });

const sampleMovies = [
  {
    title: 'Inception',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    releaseYear: 2010,
    genres: ['Sci-Fi', 'Action', 'Adventure'],
    director: 'Christopher Nolan',
    cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page', 'Tom Hardy'],
    duration: 148,
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    averageRating: 4.8,
    numRatings: 12
  },
  {
    title: 'Interstellar',
    description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    releaseYear: 2014,
    genres: ['Sci-Fi', 'Drama', 'Adventure'],
    director: 'Christopher Nolan',
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
    duration: 169,
    posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80',
    averageRating: 4.9,
    numRatings: 15
  },
  {
    title: 'The Dark Knight',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological tests.',
    releaseYear: 2008,
    genres: ['Action', 'Crime', 'Drama'],
    director: 'Christopher Nolan',
    cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart', 'Maggie Gyllenhaal'],
    duration: 152,
    posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1200&q=80',
    averageRating: 4.9,
    numRatings: 20
  },
  {
    title: 'Blade Runner 2049',
    description: 'Young Blade Runner K\'s discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard, who\'s been missing for thirty years.',
    releaseYear: 2017,
    genres: ['Sci-Fi', 'Mystery', 'Drama'],
    director: 'Denis Villeneuve',
    cast: ['Ryan Gosling', 'Harrison Ford', 'Ana de Armas', 'Sylvia Hoeks'],
    duration: 164,
    posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    averageRating: 4.6,
    numRatings: 9
  },
  {
    title: 'Dune: Part Two',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    releaseYear: 2024,
    genres: ['Sci-Fi', 'Adventure', 'Action'],
    director: 'Denis Villeneuve',
    cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem'],
    duration: 166,
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
    averageRating: 4.8,
    numRatings: 18
  },
  {
    title: 'The Matrix',
    description: 'When a beautiful stranger leads computer hacker Neo to a forbidding underworld, he discovers the shocking truth--the life he knows is the elaborate deception of an evil cyber-intelligence.',
    releaseYear: 1999,
    genres: ['Sci-Fi', 'Action'],
    director: 'Lana Wachowski, Lilly Wachowski',
    cast: ['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss', 'Hugo Weaving'],
    duration: 136,
    posterUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    averageRating: 4.7,
    numRatings: 14
  },
  {
    title: 'Pulp Fiction',
    description: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
    releaseYear: 1994,
    genres: ['Crime', 'Drama'],
    director: 'Quentin Tarantino',
    cast: ['John Travolta', 'Uma Thurman', 'Samuel L. Jackson', 'Bruce Willis'],
    duration: 154,
    posterUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80',
    averageRating: 4.6,
    numRatings: 11
  },
  {
    title: 'Whiplash',
    description: 'A promising young me drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing to realize a student\'s potential.',
    releaseYear: 2014,
    genres: ['Drama', 'Music'],
    director: 'Damien Chazelle',
    cast: ['Miles Teller', 'J.K. Simmons', 'Melissa Benoist'],
    duration: 106,
    posterUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    averageRating: 4.7,
    numRatings: 8
  },
  {
    title: 'La La Land',
    description: 'While navigating their careers in Los Angeles, a pianist and an actress fall in love while attempting to reconcile their aspirations for the future.',
    releaseYear: 2016,
    genres: ['Comedy', 'Drama', 'Music', 'Romance'],
    director: 'Damien Chazelle',
    cast: ['Ryan Gosling', 'Emma Stone', 'Rosemarie DeWitt'],
    duration: 128,
    posterUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    averageRating: 4.5,
    numRatings: 10
  },
  {
    title: 'Spirited Away',
    description: 'During her family\'s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.',
    releaseYear: 2001,
    genres: ['Animation', 'Adventure', 'Family', 'Fantasy'],
    director: 'Hayao Miyazaki',
    cast: ['Rumi Hiiragi', 'Miyu Irino', 'Mari Natsuki'],
    duration: 125,
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
    averageRating: 4.9,
    numRatings: 16
  },
  {
    title: 'Parasite',
    description: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
    releaseYear: 2019,
    genres: ['Drama', 'Thriller'],
    director: 'Bong Joon Ho',
    cast: ['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong', 'Choi Woo-shik'],
    duration: 132,
    posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
    averageRating: 4.8,
    numRatings: 17
  },
  {
    title: 'Oppenheimer',
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
    releaseYear: 2023,
    genres: ['Biography', 'Drama', 'History'],
    director: 'Christopher Nolan',
    cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.'],
    duration: 180,
    posterUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80',
    averageRating: 4.7,
    numRatings: 13
  },
  {
    title: 'Spider-Man: Into the Spider-Verse',
    description: 'Teen Miles Morales becomes the Spider-Man of his universe, and must join with five spider-powered individuals from other dimensions to stop a threat for all realities.',
    releaseYear: 2018,
    genres: ['Animation', 'Action', 'Adventure', 'Sci-Fi'],
    director: 'Bob Persichetti, Peter Ramsey, Rodney Rothman',
    cast: ['Shameik Moore', 'Jake Johnson', 'Hailee Steinfeld', 'Mahershala Ali'],
    duration: 117,
    posterUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
    averageRating: 4.8,
    numRatings: 19
  },
  {
    title: 'The Shawshank Redemption',
    description: 'Over the course of several years, two convicts form a friendship, seeking consolation and eventual redemption through basic compassion.',
    releaseYear: 1994,
    genres: ['Drama'],
    director: 'Frank Darabont',
    cast: ['Tim Robbins', 'Morgan Freeman', 'Bob Gunton'],
    duration: 142,
    posterUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80',
    averageRating: 4.9,
    numRatings: 25
  },
  {
    title: 'Spider-Man: Across the Spider-Verse',
    description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
    releaseYear: 2023,
    genres: ['Animation', 'Action', 'Adventure', 'Sci-Fi'],
    director: 'Joaquim Dos Santos, Kemp Powers, Justin K. Thompson',
    cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac'],
    duration: 140,
    posterUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=1200&q=80',
    averageRating: 4.8,
    numRatings: 15
  }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/movie_recommendation_db';
    await mongoose.connect(mongoUri);
    console.log('[Seed]: Connected to MongoDB at', mongoUri);

    // Clear existing data
    await User.deleteMany({});
    await Movie.deleteMany({});
    await Rating.deleteMany({});
    await Watchlist.deleteMany({});
    console.log('[Seed]: Cleared previous collections');

    // Create Admin and Regular Users
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@movieai.com',
      password: 'adminpassword123',
      role: 'admin',
      preferredGenres: ['Sci-Fi', 'Action', 'Drama']
    });

    const regularUser = await User.create({
      name: 'Durwansh Sharnagat',
      email: 'user@movieai.com',
      password: 'userpassword123',
      role: 'user',
      preferredGenres: ['Sci-Fi', 'Action']
    });

    const cinephileUser = await User.create({
      name: 'Gaurav Gadariya',
      email: 'cinephile@movieai.com',
      password: 'userpassword123',
      role: 'user',
      preferredGenres: ['Sci-Fi', 'Adventure', 'Drama']
    });

    console.log('[Seed]: Created sample users (Admin, User, Cinephile)');

    // Insert Movies
    const createdMovies = await Movie.insertMany(sampleMovies);
    console.log(`[Seed]: Inserted ${createdMovies.length} movies into database`);

    // Create initial ratings
    const inception = createdMovies.find(m => m.title === 'Inception');
    const interstellar = createdMovies.find(m => m.title === 'Interstellar');
    const darkKnight = createdMovies.find(m => m.title === 'The Dark Knight');
    const matrix = createdMovies.find(m => m.title === 'The Matrix');
    const dune = createdMovies.find(m => m.title === 'Dune: Part Two');

    if (inception && interstellar) {
      await Rating.create([
        {
          user: regularUser._id,
          movie: inception._id,
          score: 5,
          reviewText: 'Absolute masterpiece! Mind-bending visuals and Hans Zimmer score.'
        },
        {
          user: regularUser._id,
          movie: interstellar._id,
          score: 5,
          reviewText: 'Emotional sci-fi journey through space and time.'
        },
        {
          user: cinephileUser._id,
          movie: inception._id,
          score: 5,
          reviewText: 'Top tier storytelling and pacing.'
        },
        {
          user: cinephileUser._id,
          movie: darkKnight._id,
          score: 5,
          reviewText: 'Best superhero movie of all time. Heath Ledger is iconic.'
        },
        {
          user: cinephileUser._id,
          movie: dune._id,
          score: 5,
          reviewText: 'Visually stunning space opera.'
        }
      ]);

      await Watchlist.create([
        { user: regularUser._id, movie: matrix._id },
        { user: regularUser._id, movie: dune._id }
      ]);
      console.log('[Seed]: Created initial ratings and watchlists');
    }

    console.log('\n========================================');
    console.log('SEEDING COMPLETED SUCCESSFULLY!');
    console.log('Admin Account: admin@movieai.com / adminpassword123');
    console.log('User Account:  user@movieai.com  / userpassword123');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDB();
