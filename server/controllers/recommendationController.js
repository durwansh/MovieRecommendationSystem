const { generateRecommendations } = require('../utils/recommendationEngine');
const Movie = require('../models/Movie');

// @desc    Get personalized AI movie recommendations
// @route   GET /api/recommendations
// @access  Private (or Public with cold-start)
const getRecommendations = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const userId = req.user ? req.user._id : null;

    if (!userId) {
      // Guest cold start recommendations based on top rated movies
      const topMovies = await Movie.find({})
        .sort({ averageRating: -1, numRatings: -1 })
        .limit(limit);

      const guestRecs = topMovies.map(movie => ({
        movie,
        matchScore: Math.round(((movie.averageRating || 4.0) / 5.0) * 100),
        matchReason: `Top Community Favorite (${movie.averageRating.toFixed(1)} ★)`,
        matchType: 'Top Rated'
      }));

      return res.json({
        success: true,
        recommendations: guestRecs,
        strategy: 'Cold Start (Guest)'
      });
    }

    const recommendations = await generateRecommendations(userId, limit);

    res.json({
      success: true,
      recommendations,
      strategy: 'Hybrid AI (Content + Collaborative + ColdStart)'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getRecommendations
};
