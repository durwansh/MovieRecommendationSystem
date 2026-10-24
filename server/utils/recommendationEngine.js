const Movie = require('../models/Movie');
const Rating = require('../models/Rating');
const Watchlist = require('../models/Watchlist');
const User = require('../models/User');

/**
 * Calculates Jaccard similarity between two arrays of strings (e.g. genres, directors, cast)
 */
function calculateJaccardSimilarity(arr1, arr2) {
  if (!arr1 || !arr2 || arr1.length === 0 || arr2.length === 0) return 0;
  const s1 = new Set(arr1.map(item => item.toLowerCase().trim()));
  const s2 = new Set(arr2.map(item => item.toLowerCase().trim()));
  const intersection = new Set([...s1].filter(x => s2.has(x)));
  const union = new Set([...s1, ...s2]);
  return intersection.size / union.size;
}

/**
 * Calculates Cosine Similarity between two user rating vectors
 * ratingsMap1: { movieId: score }, ratingsMap2: { movieId: score }
 */
function calculateCosineSimilarity(ratingsMap1, ratingsMap2) {
  const commonMovies = Object.keys(ratingsMap1).filter(id => id in ratingsMap2);
  if (commonMovies.length === 0) return 0;

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (const movieId of commonMovies) {
    dotProduct += ratingsMap1[movieId] * ratingsMap2[movieId];
  }

  for (const movieId in ratingsMap1) {
    norm1 += Math.pow(ratingsMap1[movieId], 2);
  }
  for (const movieId in ratingsMap2) {
    norm2 += Math.pow(ratingsMap2[movieId], 2);
  }

  if (norm1 === 0 || norm2 === 0) return 0;
  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

/**
 * Generate Hybrid AI Movie Recommendations for a User
 */
async function generateRecommendations(userId, limit = 10) {
  const allMovies = await Movie.find({});
  if (allMovies.length === 0) return [];

  // Fetch current user ratings and watchlist
  const userRatings = await Rating.find({ user: userId });
  const userWatchlist = await Watchlist.find({ user: userId });
  const user = await User.findById(userId);

  const ratedMovieIds = new Set(userRatings.map(r => r.movie.toString()));
  const watchlistMovieIds = new Set(userWatchlist.map(w => w.movie.toString()));

  // Cold Start Check: If user has fewer than 2 ratings
  if (userRatings.length < 2) {
    return generateColdStartRecommendations(allMovies, ratedMovieIds, user?.preferredGenres || [], limit);
  }

  // 1. Content-Based Score Calculation
  // Construct user profile based on highly rated movies (score >= 3) & watchlist movies
  const positiveRatings = userRatings.filter(r => r.score >= 3);
  const positiveMovieIds = positiveRatings.map(r => r.movie.toString());
  const seedMovies = allMovies.filter(m => positiveMovieIds.includes(m._id.toString()) || watchlistMovieIds.has(m._id.toString()));

  // Extract aggregated user genre weights and director preferences
  const genreWeights = {};
  const directorWeights = {};
  let totalPositiveCount = seedMovies.length || 1;

  seedMovies.forEach(m => {
    (m.genres || []).forEach(g => {
      genreWeights[g] = (genreWeights[g] || 0) + 1;
    });
    if (m.director) {
      directorWeights[m.director] = (directorWeights[m.director] || 0) + 1;
    }
  });

  // Include explicit preferred genres if set
  (user?.preferredGenres || []).forEach(g => {
    genreWeights[g] = (genreWeights[g] || 0) + 2;
  });

  // 2. Collaborative Filtering Calculation
  // Fetch all ratings across all users
  const allRatings = await Rating.find({});
  const userRatingsMap = {}; // { userId: { movieId: score } }

  allRatings.forEach(r => {
    const uId = r.user.toString();
    const mId = r.movie.toString();
    if (!userRatingsMap[uId]) userRatingsMap[uId] = {};
    userRatingsMap[uId][mId] = r.score;
  });

  const currentUserMap = userRatingsMap[userId.toString()] || {};
  const userSimilarities = {};

  for (const otherUserId in userRatingsMap) {
    if (otherUserId === userId.toString()) continue;
    const sim = calculateCosineSimilarity(currentUserMap, userRatingsMap[otherUserId]);
    if (sim > 0.1) {
      userSimilarities[otherUserId] = sim;
    }
  }

  // Calculate scores for candidate movies (not yet rated by the target user)
  const recommendations = [];

  for (const movie of allMovies) {
    const mId = movie._id.toString();
    if (ratedMovieIds.has(mId)) continue; // Skip already rated movies

    // Content-based score (0 to 1)
    let contentScore = 0;
    let matchingGenre = null;

    (movie.genres || []).forEach(g => {
      if (genreWeights[g]) {
        contentScore += (genreWeights[g] / totalPositiveCount);
        if (!matchingGenre) matchingGenre = g;
      }
    });

    if (directorWeights[movie.director]) {
      contentScore += 0.3;
    }

    contentScore = Math.min(1.0, contentScore);

    // Collaborative score calculation
    let collabNumerator = 0;
    let collabDenominator = 0;

    for (const otherUserId in userSimilarities) {
      const otherRating = userRatingsMap[otherUserId][mId];
      if (otherRating !== undefined) {
        const sim = userSimilarities[otherUserId];
        collabNumerator += sim * otherRating;
        collabDenominator += sim;
      }
    }

    let collabScore = 0;
    if (collabDenominator > 0) {
      // Normalize predicted rating from 1..5 scale to 0..1
      const predictedRating = collabNumerator / collabDenominator;
      collabScore = predictedRating / 5.0;
    }

    // Rating baseline normalized (0..1)
    const ratingBaseline = (movie.averageRating || 3.5) / 5.0;

    // Hybrid score weighted formula: Content (40%) + Collaborative (40%) + Rating Baseline (20%)
    const finalMatchScore = Math.round(((contentScore * 0.4) + (collabScore * 0.4) + (ratingBaseline * 0.2)) * 100);

    // Generate human-readable HCI AI explanation
    let matchReason = `Top Rated ${movie.genres[0] || 'Film'}`;
    let matchType = 'Hybrid AI';

    if (contentScore > 0.4 && matchingGenre) {
      matchType = 'Content Match';
      matchReason = `Matches your preference for ${matchingGenre}`;
    } else if (collabScore > 0.5) {
      matchType = 'Collaborative Pick';
      matchReason = `Highly recommended by cinephiles with similar taste`;
    } else if (userRatings.length >= 2) {
      matchType = 'Hybrid Match';
      matchReason = `Curated based on your viewing pattern & high user ratings`;
    }

    recommendations.push({
      movie,
      matchScore: Math.max(65, Math.min(99, finalMatchScore)),
      matchReason,
      matchType
    });
  }

  // Sort recommendations descending by matchScore
  recommendations.sort((a, b) => b.matchScore - a.matchScore);
  return recommendations.slice(0, limit);
}

/**
 * Cold-Start Fallback Strategy for New Users
 */
function generateColdStartRecommendations(allMovies, ratedMovieIds, preferredGenres, limit) {
  const unratedMovies = allMovies.filter(m => !ratedMovieIds.has(m._id.toString()));

  const recommendations = unratedMovies.map(movie => {
    let genreMatch = false;
    let primaryMatchedGenre = '';

    if (preferredGenres && preferredGenres.length > 0) {
      for (const g of movie.genres || []) {
        if (preferredGenres.includes(g)) {
          genreMatch = true;
          primaryMatchedGenre = g;
          break;
        }
      }
    }

    const baselineScore = (movie.averageRating || 4.0) / 5.0;
    const finalScore = Math.round((genreMatch ? baselineScore * 0.95 : baselineScore * 0.8) * 100);

    let matchReason = genreMatch
      ? `Matches your selected preference: ${primaryMatchedGenre}`
      : `Popular among all viewers (${movie.averageRating.toFixed(1)} ★)`;

    return {
      movie,
      matchScore: Math.max(70, Math.min(98, finalScore)),
      matchReason,
      matchType: genreMatch ? 'Genre Preference' : 'Trending Popular'
    };
  });

  recommendations.sort((a, b) => b.matchScore - a.matchScore);
  return recommendations.slice(0, limit);
}

module.exports = {
  generateRecommendations
};
