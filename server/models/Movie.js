const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Movie description is required']
    },
    releaseYear: {
      type: Number,
      required: [true, 'Release year is required']
    },
    genres: [
      {
        type: String,
        required: true
      }
    ],
    director: {
      type: String,
      required: [true, 'Director is required']
    },
    cast: [
      {
        type: String
      }
    ],
    duration: {
      type: Number, // duration in minutes
      default: 120
    },
    language: {
      type: String,
      default: 'English',
      index: true
    },
    industry: {
      type: String,
      enum: ['Hollywood', 'Bollywood', 'Korean', 'Japanese', 'European', 'World'],
      default: 'Hollywood',
      index: true
    },
    contentType: {
      type: String,
      enum: ['Movie', 'Web Series', 'Drama'],
      default: 'Movie',
      index: true
    },
    posterUrl: {
      type: String,
      required: [true, 'Poster image URL is required']
    },
    bannerUrl: {
      type: String
    },
    trailerUrl: {
      type: String
    },
    tmdbId: {
      type: String,
      index: true,
      sparse: true
    },
    averageRating: {
      type: Number,
      default: 0
    },
    numRatings: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// High-performance compound & single indexes for 1M+ scale
movieSchema.index({ averageRating: -1, numRatings: -1 });
movieSchema.index({ releaseYear: -1 });
movieSchema.index({ title: 1 });
movieSchema.index({ genres: 1, averageRating: -1 });
movieSchema.index({ industry: 1, averageRating: -1 });
movieSchema.index({ createdAt: -1 });

// Index for text search by title, director, cast, description
movieSchema.index(
  { title: 'text', director: 'text', description: 'text' },
  { language_override: 'text_language_override', default_language: 'none' }
);

module.exports = mongoose.model('Movie', movieSchema);
