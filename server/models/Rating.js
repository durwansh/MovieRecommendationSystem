const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true
    },
    score: {
      type: Number,
      required: [true, 'Rating score between 1 and 5 is required'],
      min: 1,
      max: 5
    },
    reviewText: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// One rating per user per movie
ratingSchema.index({ user: 1, movie: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
