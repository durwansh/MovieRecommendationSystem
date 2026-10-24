import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Clock, Calendar, User, Film, Bookmark, Check, ArrowLeft, Play, Sparkles } from 'lucide-react';
import { getMovieById } from '../services/movieService';
import RatingWidget from '../components/RatingWidget';
import ReviewSection from '../components/ReviewSection';
import { WatchlistContext } from '../context/WatchlistContext';
import { AuthContext } from '../context/AuthContext';

export default function MovieDetails() {
  const { id } = useParams();
  const { isAuthenticated } = useContext(AuthContext);
  const { isInWatchlist, addMovie, removeMovie } = useContext(WatchlistContext);

  const [movie, setMovie] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTrailerModal, setShowTrailerModal] = useState(false);

  const inWatchlist = movie ? isInWatchlist(movie._id) : false;

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const data = await getMovieById(id);
      setMovie(data.movie);
      setUserRating(data.userRating || 0);
      setReviews(data.reviews || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load movie details');
    } finally {
      setLoading(false);
    }
  };

  const handleWatchlistToggle = () => {
    if (!isAuthenticated) return alert('Please log in to manage your watchlist');

    if (inWatchlist) {
      removeMovie(movie._id);
    } else {
      addMovie(movie._id);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Loading cinema details...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-red-400">{error || 'Movie Not Found'}</h2>
        <Link to="/movies" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      
      {/* Back Button */}
      <Link
        to="/movies"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Movies
      </Link>

      {/* Banner / Poster Header */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
        <div className="absolute inset-0 z-0">
          <img
            src={movie.bannerUrl || movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover opacity-20 blur-md scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        <div className="relative z-10 p-6 sm:p-10 flex flex-col md:flex-row gap-8 items-start">
          
          {/* Poster Card */}
          <div className="w-48 sm:w-64 flex-shrink-0 rounded-2xl overflow-hidden border-2 border-slate-700/80 shadow-2xl group relative bg-slate-950">
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80';
              }}
            />
          </div>

          {/* Details Metadata */}
          <div className="flex-1 space-y-4">
            
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-brand-600 text-white">
                {movie.releaseYear}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> {movie.duration || 120} mins
              </span>
              <div className="flex items-center gap-1 bg-amber-950/60 border border-amber-900/80 px-3 py-1 rounded-full text-xs font-bold text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{movie.averageRating ? movie.averageRating.toFixed(1) : 'NEW'} / 5.0</span>
                <span className="text-[10px] text-slate-400 font-normal">({movie.numRatings || 0} ratings)</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {movie.title}
            </h1>

            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {(movie.genres || []).map((g) => (
                <span
                  key={g}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-indigo-300 border border-slate-700"
                >
                  {g}
                </span>
              ))}
            </div>

            <p className="text-sm text-slate-300 leading-relaxed pt-2">
              {movie.description}
            </p>

            {/* Director & Cast Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Director</span>
                <span className="text-slate-100 font-semibold text-sm">{movie.director}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Starring Cast</span>
                <span className="text-slate-200 font-medium">
                  {(movie.cast || []).join(', ') || 'N/A'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-4">
              <button
                onClick={handleWatchlistToggle}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg transition-all ${
                  inWatchlist
                    ? 'bg-brand-600 text-white shadow-brand-600/30'
                    : 'bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200'
                }`}
              >
                {inWatchlist ? (
                  <>
                    <Check className="w-4 h-4" /> In Your Watchlist
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" /> Add to Watchlist
                  </>
                )}
              </button>

              <Link
                to="/recommendations"
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 flex items-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4 text-indigo-400" /> Similar AI Picks
              </Link>
            </div>

          </div>

        </div>
      </div>

      {/* Ratings & Community Reviews Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        
        {/* Left Column: Interactive Rating Widget */}
        <div className="lg:col-span-1">
          {isAuthenticated ? (
            <RatingWidget
              movieId={movie._id}
              initialRating={userRating}
              onRatingSubmitted={() => fetchDetails()}
            />
          ) : (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-center space-y-3">
              <Star className="w-8 h-8 text-amber-400 mx-auto" />
              <h3 className="font-bold text-slate-200 text-base">Have you watched this movie?</h3>
              <p className="text-xs text-slate-400">
                Log in to rate this film and improve your personalized AI recommendations!
              </p>
              <Link
                to="/login"
                className="inline-block px-4 py-2 bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Log In to Rate
              </Link>
            </div>
          )}
        </div>

        {/* Right Column: User Reviews List */}
        <div className="lg:col-span-2">
          <ReviewSection reviews={reviews} />
        </div>

      </div>

    </div>
  );
}
