const Movie = require('../models/Movie');
const User = require('../models/User');
const Rating = require('../models/Rating');

// @desc    Add a new movie
// @route   POST /api/admin/movies
// @access  Private/Admin
const addMovie = async (req, res) => {
  try {
    const { title, description, releaseYear, genres, director, cast, duration, posterUrl, bannerUrl, trailerUrl } = req.body;

    if (!title || !description || !releaseYear || !genres || !director || !posterUrl) {
      return res.status(400).json({ success: false, message: 'Please provide all required movie fields' });
    }

    const movie = await Movie.create({
      title,
      description,
      releaseYear: Number(releaseYear),
      genres: Array.isArray(genres) ? genres : genres.split(',').map(g => g.trim()),
      director,
      cast: Array.isArray(cast) ? cast : (cast ? cast.split(',').map(c => c.trim()) : []),
      duration: duration ? Number(duration) : 120,
      posterUrl,
      bannerUrl: bannerUrl || posterUrl,
      trailerUrl: trailerUrl || ''
    });

    res.status(201).json({
      success: true,
      message: 'Movie added successfully',
      movie
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update existing movie
// @route   PUT /api/admin/movies/:id
// @access  Private/Admin
const updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    const { title, description, releaseYear, genres, director, cast, duration, posterUrl, bannerUrl, trailerUrl } = req.body;

    movie.title = title || movie.title;
    movie.description = description || movie.description;
    movie.releaseYear = releaseYear ? Number(releaseYear) : movie.releaseYear;
    if (genres) {
      movie.genres = Array.isArray(genres) ? genres : genres.split(',').map(g => g.trim());
    }
    movie.director = director || movie.director;
    if (cast) {
      movie.cast = Array.isArray(cast) ? cast : cast.split(',').map(c => c.trim());
    }
    movie.duration = duration ? Number(duration) : movie.duration;
    movie.posterUrl = posterUrl || movie.posterUrl;
    movie.bannerUrl = bannerUrl || movie.bannerUrl;
    movie.trailerUrl = trailerUrl !== undefined ? trailerUrl : movie.trailerUrl;

    const updatedMovie = await movie.save();

    res.json({
      success: true,
      message: 'Movie updated successfully',
      movie: updatedMovie
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete movie
// @route   DELETE /api/admin/movies/:id
// @access  Private/Admin
const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    await movie.deleteOne();
    await Rating.deleteMany({ movie: req.params.id });

    res.json({
      success: true,
      message: 'Movie deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({
      success: true,
      users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user account
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    if (user.role === 'admin' && user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own admin account' });
    }

    await user.deleteOne();
    await Rating.deleteMany({ user: req.params.id });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get system dashboard analytics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getSystemStats = async (req, res) => {
  try {
    const totalMovies = await Movie.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalRatings = await Rating.countDocuments();

    const avgRatingAggregate = await Rating.aggregate([
      { $group: { _id: null, avgScore: { $avg: '$score' } } }
    ]);

    const systemAvgRating = avgRatingAggregate.length > 0
      ? Number(avgRatingAggregate[0].avgScore.toFixed(2))
      : 0;

    const recentRatings = await Rating.find({})
      .populate('user', 'name email')
      .populate('movie', 'title')
      .sort({ createdAt: -1 })
      .limit(8);

    res.json({
      success: true,
      stats: {
        totalMovies,
        totalUsers,
        totalRatings,
        systemAvgRating
      },
      recentRatings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addMovie,
  updateMovie,
  deleteMovie,
  getUsers,
  deleteUser,
  getSystemStats
};
