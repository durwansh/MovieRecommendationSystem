const Watchlist = require('../models/Watchlist');
const Movie = require('../models/Movie');

// @desc    Add movie to watchlist
// @route   POST /api/watchlist
// @access  Private
const addToWatchlist = async (req, res) => {
  try {
    const { movieId } = req.body;
    const userId = req.user._id;

    if (!movieId) {
      return res.status(400).json({ success: false, message: 'Movie ID is required' });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    const exists = await Watchlist.findOne({ user: userId, movie: movieId });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Movie is already in your watchlist' });
    }

    const watchlistEntry = await Watchlist.create({
      user: userId,
      movie: movieId
    });

    res.status(201).json({
      success: true,
      message: 'Movie added to watchlist',
      watchlistEntry
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove movie from watchlist
// @route   DELETE /api/watchlist/:movieId
// @access  Private
const removeFromWatchlist = async (req, res) => {
  try {
    const { movieId } = req.params;
    const userId = req.user._id;

    const entry = await Watchlist.findOneAndDelete({ user: userId, movie: movieId });

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Movie not in your watchlist' });
    }

    res.json({
      success: true,
      message: 'Movie removed from watchlist'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user watchlist
// @route   GET /api/watchlist
// @access  Private
const getWatchlist = async (req, res) => {
  try {
    const watchlist = await Watchlist.find({ user: req.user._id })
      .populate('movie')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      watchlist: watchlist.map(w => w.movie).filter(Boolean)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addToWatchlist,
  removeFromWatchlist,
  getWatchlist
};
