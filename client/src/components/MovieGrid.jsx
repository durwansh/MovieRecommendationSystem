import React from 'react';
import MovieCard from './MovieCard';
import { MovieGridSkeleton } from './LoadingSkeleton';
import { Film } from 'lucide-react';

export default function MovieGrid({ movies, loading, isRecommendations = false }) {
  if (loading) {
    return <MovieGridSkeleton count={10} />;
  }

  if (!movies || movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center glass-panel rounded-2xl border border-slate-800">
        <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center text-slate-500 mb-4">
          <Film className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-200">No Movies Found</h3>
        <p className="text-sm text-slate-400 max-w-sm mt-1">
          Try adjusting your search criteria or genre filters to discover more titles.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
      {movies.map((item) => {
        // If items are recommendation objects { movie, matchScore, matchReason, matchType }
        const movie = item.movie || item;
        return (
          <MovieCard
            key={movie._id}
            movie={movie}
            matchScore={item.matchScore}
            matchReason={item.matchReason}
            matchType={item.matchType}
          />
        );
      })}
    </div>
  );
}
