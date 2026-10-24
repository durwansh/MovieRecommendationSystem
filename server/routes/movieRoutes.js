const express = require('express');
const router = express.Router();
const { getMovies, getMovieById, getGenres } = require('../controllers/movieController');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware for optional auth parsing
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_movie_rec_2026_hci_project');
      req.user = await User.findById(decoded.id).select('-password');
    } catch (e) {
      // ignore invalid token in optional auth
    }
  }
  next();
};

router.get('/', getMovies);
router.get('/genres', getGenres);
router.get('/:id', optionalAuth, getMovieById);

module.exports = router;
