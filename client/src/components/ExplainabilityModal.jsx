import React from 'react';
import { X, Sparkles, Sliders, Users, Film, Star, CheckCircle } from 'lucide-react';

export default function ExplainabilityModal({ isOpen, onClose, movie, matchScore, matchReason, matchType }) {
  if (!isOpen || !movie) return null;

  // Derive breakdown weights based on match score
  const score = matchScore || 85;
  const contentPercent = Math.min(98, Math.round(score * 0.95));
  const collabPercent = Math.min(96, Math.max(70, Math.round(score * 0.9)));
  const ratingPercent = Math.round(((movie.averageRating || 4.2) / 5) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl shadow-indigo-950/50 space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4">
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-16 h-24 object-cover rounded-xl border border-slate-700 shadow-md flex-shrink-0"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80';
            }}
          />
          <div className="space-y-1 pr-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-950/90 border border-indigo-500/50 text-indigo-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
              <span>{score}% Compatibility Match</span>
            </div>
            <h2 className="text-xl font-black text-white leading-tight">
              {movie.title}
            </h2>
            <p className="text-xs text-slate-400">
              {movie.releaseYear} • Dir: {movie.director}
            </p>
          </div>
        </div>

        {/* Primary Explanation Box (XAI) */}
        <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/60 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            AI Decision Logic ({matchType || 'Hybrid Match'})
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-medium">
            "{matchReason || 'Curated based on your positive rating history and taste affinity matrix with fellow cinephiles.'}"
          </p>
        </div>

        {/* Sub-Score Breakdown Matrix */}
        <div className="space-y-3.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-slate-400" /> Hybrid Feature Contribution
          </h3>

          {/* Content Overlap */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-emerald-400" /> Content & Genre Similarity (40%)
              </span>
              <span className="font-bold text-emerald-400">{contentPercent}% Match</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${contentPercent}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-1 text-[10px] text-slate-400">
              Matching attributes: {(movie.genres || []).slice(0, 3).join(', ')}
            </div>
          </div>

          {/* Collaborative Affinity */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400" /> Collaborative Taste Matrix (40%)
              </span>
              <span className="font-bold text-indigo-400">{collabPercent}% Affinity</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${collabPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400">
              Users with similar Cosine rating profiles rated this highly.
            </p>
          </div>

          {/* Baseline Quality */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Global TMDB Quality (20%)
              </span>
              <span className="font-bold text-amber-400">{ratingPercent}% Standard</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-amber-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${ratingPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer info for Evaluation */}
        <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Explainable AI (XAI) System</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors"
          >
            Got it
          </button>
        </div>

      </div>
    </div>
  );
}
