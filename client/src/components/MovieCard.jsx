import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Bookmark, Check, Sparkles, HelpCircle } from 'lucide-react';
import { WatchlistContext } from '../context/WatchlistContext';
import { AuthContext } from '../context/AuthContext';
import ExplainabilityModal from './ExplainabilityModal';

export default function MovieCard({ movie, matchScore, matchReason, matchType }) {
  const { isInWatchlist, addMovie, removeMovie } = useContext(WatchlistContext);
  const { isAuthenticated } = useContext(AuthContext);
  const [showXAIModal, setShowXAIModal] = useState(false);

  const inWatchlist = movie ? isInWatchlist(movie._id) : false;

  const handleWatchlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return alert('Please log in to manage your watchlist');

    if (inWatchlist) {
      removeMovie(movie._id);
    } else {
      addMovie(movie._id);
    }
  };

  const handleOpenXAI = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowXAIModal(true);
  };

  if (!movie) return null;

  return (
    <>
      <div className="group relative rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-hidden hover:border-slate-700 hover:shadow-2xl hover:shadow-black/70 transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1">
        
        {/* Poster Container */}
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-950">
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80';
            }}
          />

          {/* Backdrop Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

          {/* Top Badges */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
            
            {/* Match Score Badge (Clickable to open XAI modal) */}
            {matchScore !== undefined ? (
              <button
                onClick={handleOpenXAI}
                className="flex items-center gap-1.5 bg-indigo-950/90 hover:bg-indigo-900 border border-indigo-500/60 backdrop-blur-md px-2.5 py-1 rounded-full text-indigo-300 text-xs font-bold shadow-lg transition-transform hover:scale-105"
                title="Click to view AI Recommendation Explanation"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
                <span>{matchScore}% Match</span>
                <HelpCircle className="w-3 h-3 text-indigo-400 opacity-70" />
              </button>
            ) : (
              <div className="px-2.5 py-0.5 rounded-md bg-slate-900/80 border border-slate-800 text-[11px] font-semibold text-slate-300 backdrop-blur-md">
                {movie.releaseYear}
              </div>
            )}

            {/* Watchlist Toggle Button */}
            <button
              onClick={handleWatchlistToggle}
              className={`p-2 rounded-full backdrop-blur-md transition-all duration-200 shadow-md ${
                inWatchlist
                  ? 'bg-brand-600 text-white border border-brand-500'
                  : 'bg-slate-900/70 text-slate-300 hover:text-white border border-slate-700/80 hover:bg-slate-800'
              }`}
              title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              {inWatchlist ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
          </div>

          {/* Rating score badge */}
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 text-xs font-semibold text-amber-400 shadow-md">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{movie.averageRating ? movie.averageRating.toFixed(1) : 'NEW'}</span>
            <span className="text-[10px] text-slate-400 font-normal">({movie.numRatings || 0})</span>
          </div>
        </div>

        {/* Movie Meta Information */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
              {movie.industry && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-brand-950/80 text-brand-300 border border-brand-800/60">
                  {movie.industry}
                </span>
              )}
              {movie.contentType && movie.contentType !== 'Movie' && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
                  {movie.contentType}
                </span>
              )}
              {movie.language && movie.language !== 'English' && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                  {movie.language}
                </span>
              )}
            </div>

            <Link to={`/movies/${movie._id}`} className="block group-hover:text-brand-500 transition-colors">
              <h3 className="font-bold text-base text-slate-100 line-clamp-1 leading-snug">
                {movie.title}
              </h3>
            </Link>
            <p className="text-xs text-slate-400 mt-1 line-clamp-1">
              Dir: <span className="text-slate-300">{movie.director}</span>
            </p>
          </div>

          {/* AI Reason Badge with button to inspect */}
          {matchReason && (
            <div
              onClick={handleOpenXAI}
              className="text-[11px] text-indigo-300 bg-indigo-950/40 border border-indigo-900/60 hover:border-indigo-700/80 p-2 rounded-xl line-clamp-2 cursor-pointer transition-colors"
              title="Click to view why AI recommended this"
            >
              <span className="font-bold text-indigo-400">{matchType || 'AI Reason'}: </span>
              {matchReason}
            </div>
          )}

          {/* Genre Tags */}
          <div className="flex flex-wrap gap-1 pt-1">
            {(movie.genres || []).slice(0, 3).map((g) => (
              <span
                key={g}
                className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700/50"
              >
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Explainable AI Modal */}
      <ExplainabilityModal
        isOpen={showXAIModal}
        onClose={() => setShowXAIModal(false)}
        movie={movie}
        matchScore={matchScore}
        matchReason={matchReason}
        matchType={matchType}
      />
    </>
  );
}
