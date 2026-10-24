const Rating = require('../models/Rating');
const Movie = require('../models/Movie');

// Recalculates movie average rating and numRatings
async function updateMovieStats(movieId) {
  const ratings = await Rating.find({ movie: movieId });
  if (ratings.length === 0) {
    await Movie.findByIdAndUpdate(movieId, { averageRating: 0, numRatings: 0 });
  } else {
    const totalScore = ratings.reduce((sum, r) => sum + r.score, 0);
    const avgScore = Number((totalScore / ratings.length).toFixed(1));
    await Movie.findByIdAndUpdate(movieId, { averageRating: avgScore, numRatings: ratings.length });
  }
}

// @desc    Add or update rating for a movie
// @route   POST /api/ratings
// @access  Private
const addOrUpdateRating = async (req, res) => {
  try {
    const { movieId, score, reviewText } = req.body;
    const userId = req.user._id;

    if (!movieId || !score || score < 1 || score > 5) {
      return res.status(400).json({ success: false, message: 'Valid movieId and rating score (1-5) are required' });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    let rating = await Rating.findOne({ user: userId, movie: movieId });

    if (rating) {
      rating.score = score;
      if (reviewText !== undefined) rating.reviewText = reviewText;
      await rating.save();
    } else {
      rating = await Rating.create({
        user: userId,
        movie: movieId,
        score,
        reviewText: reviewText || ''
      });
    }

    await updateMovieStats(movieId);
    const updatedMovie = await Movie.findById(movieId);

    res.json({
      success: true,
      message: 'Rating saved successfully',
      rating,
      movieStats: {
        averageRating: updatedMovie.averageRating,
        numRatings: updatedMovie.numRatings
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get ratings by logged in user
// @route   GET /api/ratings/my-ratings
// @access  Private
const getUserRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ user: req.user._id })
      .populate('movie', 'title posterUrl releaseYear genres averageRating')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      ratings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete rating
// @route   DELETE /api/ratings/:id
// @access  Private
const deleteRating = async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id);

    if (!rating) {
      return res.status(404).json({ success: false, message: 'Rating entry not found' });
    }

    if (rating.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this rating' });
    }

    const movieId = rating.movie;
    await rating.deleteOne();
    await updateMovieStats(movieId);

    res.json({
      success: true,
      message: 'Rating deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addOrUpdateRating,
  getUserRatings,
  deleteRating
};
