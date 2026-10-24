const Movie = require('../models/Movie');
const Rating = require('../models/Rating');
const Watchlist = require('../models/Watchlist');

// @desc    Get movies with search, filter, and pagination
// @route   GET /api/movies
// @access  Public
const getMovies = async (req, res) => {
  try {
    const { search, genre, industry, language, contentType, sort, limit = 24, page = 1 } = req.query;

    let query = {};

    if (genre && genre !== 'All') {
      query.genres = genre;
    }

    if (industry && industry !== 'All') {
      query.industry = industry;
    }

    if (language && language !== 'All') {
      query.language = language;
    }

    if (contentType && contentType !== 'All') {
      query.contentType = contentType;
    }

    if (search) {
      const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { title: { $regex: safeSearch, $options: 'i' } },
        { director: { $regex: safeSearch, $options: 'i' } },
        { cast: { $regex: safeSearch, $options: 'i' } },
        { description: { $regex: safeSearch, $options: 'i' } },
        { industry: { $regex: safeSearch, $options: 'i' } },
        { language: { $regex: safeSearch, $options: 'i' } }
      ];
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'rating') sortOptions = { averageRating: -1, numRatings: -1 };
    if (sort === 'year') sortOptions = { releaseYear: -1 };
    if (sort === 'title') sortOptions = { title: 1 };

    const skip = (Number(page) - 1) * Number(limit);
    const count = await Movie.countDocuments(query);
    const movies = await Movie.find(query)
      .sort(sortOptions)
      .limit(Number(limit))
      .skip(skip);

    res.json({
      success: true,
      movies,
      page: Number(page),
      pages: Math.ceil(count / Number(limit)),
      total: count
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get movie details by ID
// @route   GET /api/movies/:id
// @access  Public
const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    let userRating = null;
    let inWatchlist = false;

    if (req.user) {
      const rating = await Rating.findOne({ user: req.user._id, movie: movie._id });
      if (rating) userRating = rating.score;

      const watchlistEntry = await Watchlist.findOne({ user: req.user._id, movie: movie._id });
      if (watchlistEntry) inWatchlist = true;
    }

    const reviews = await Rating.find({ movie: movie._id })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      movie,
      userRating,
      inWatchlist,
      reviews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all distinct filter metadata
// @route   GET /api/movies/genres
// @access  Public
const getGenres = async (req, res) => {
  try {
    const [genres, industries, languages, contentTypes] = await Promise.all([
      Movie.distinct('genres'),
      Movie.distinct('industry'),
      Movie.distinct('language'),
      Movie.distinct('contentType')
    ]);

    res.json({
      success: true,
      genres: genres.filter(Boolean).sort(),
      industries: industries.filter(Boolean).sort(),
      languages: languages.filter(Boolean).sort(),
      contentTypes: contentTypes.filter(Boolean).sort()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMovies,
  getMovieById,
  getGenres
};
