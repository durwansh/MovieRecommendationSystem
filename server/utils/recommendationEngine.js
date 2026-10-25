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
  // 1. Attempt to query dedicated Python Machine Learning Service (FastAPI / SVD + TF-IDF)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    const pyResp = await fetch(`http://127.0.0.1:8000/recommend/${userId}?limit=${limit}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (pyResp.ok) {
      const pyData = await pyResp.json();
      if (pyData.recommendations && pyData.recommendations.length > 0) {
        return pyData.recommendations;
      }
    }
  } catch (pyErr) {
    // Python ML service is offline or timed out; continue with local fallback
  }

  // Fetch current user ratings and watchlist
  const [userRatings, userWatchlist, user] = await Promise.all([
    Rating.find({ user: userId }).lean(),
    Watchlist.find({ user: userId }).lean(),
    User.findById(userId).lean()
  ]);

  const ratedMovieIds = new Set(userRatings.map(r => r.movie.toString()));
  const watchlistMovieIds = new Set(userWatchlist.map(w => w.movie.toString()));

  // Cold Start Check: If user has fewer than 2 ratings
  if (userRatings.length < 2) {
    const preferredGenres = user?.preferredGenres || [];
    let query = {};
    if (preferredGenres.length > 0) {
      query.genres = { $in: preferredGenres };
    }
    const coldStartCandidates = await Movie.find(query)
      .sort({ averageRating: -1, numRatings: -1 })
      .limit(60)
      .lean();

    return generateColdStartRecommendations(coldStartCandidates, ratedMovieIds, preferredGenres, limit);
  }

  // 1. Content-Based Profile Construction
  const positiveRatings = userRatings.filter(r => r.score >= 3);
  const positiveMovieIds = positiveRatings.map(r => r.movie);
  const seedMovieIds = [...new Set([...positiveMovieIds, ...userWatchlist.map(w => w.movie)])];

  const seedMovies = await Movie.find({ _id: { $in: seedMovieIds } }).lean();

  const genreWeights = {};
  const directorWeights = {};

  seedMovies.forEach(m => {
    (m.genres || []).forEach(g => {
      genreWeights[g] = (genreWeights[g] || 0) + 1;
    });
    if (m.director) {
      directorWeights[m.director] = (directorWeights[m.director] || 0) + 1;
    }
  });

  (user?.preferredGenres || []).forEach(g => {
    genreWeights[g] = (genreWeights[g] || 0) + 2;
  });

  const topUserGenres = Object.keys(genreWeights)
    .sort((a, b) => genreWeights[b] - genreWeights[a])
    .slice(0, 5);

  // Retrieve candidate movies (top matching genres + popular baseline)
  const candidateQuery = topUserGenres.length > 0
    ? { genres: { $in: topUserGenres } }
    : {};

  const candidateMovies = await Movie.find(candidateQuery)
    .sort({ averageRating: -1, numRatings: -1 })
    .limit(500)
    .lean();

  if (candidateMovies.length === 0) return [];

  let totalPositiveCount = Math.max(1, seedMovies.length);

  // 2. Collaborative Filtering Calculation
  // Fetch recent ratings for collaborative signals
  const allRatings = await Rating.find({}).limit(5000).lean();
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

  for (const movie of candidateMovies) {
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
