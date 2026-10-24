import React from 'react';

export function MovieCardSkeleton() {
  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3 space-y-3 animate-pulse">
      <div className="aspect-[2/3] w-full bg-slate-800 rounded-lg" />
      <div className="h-4 bg-slate-800 rounded w-3/4" />
      <div className="h-3 bg-slate-800 rounded w-1/2" />
      <div className="flex gap-1">
        <div className="h-4 bg-slate-800 rounded w-12" />
        <div className="h-4 bg-slate-800 rounded w-12" />
      </div>
    </div>
  );
}

export function MovieGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  );
}
