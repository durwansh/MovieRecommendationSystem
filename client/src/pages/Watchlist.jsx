import React, { useContext } from 'react';
import { Bookmark, Film } from 'lucide-react';
import MovieGrid from '../components/MovieGrid';
import { WatchlistContext } from '../context/WatchlistContext';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Watchlist() {
  const { watchlist, loading } = useContext(WatchlistContext);
  const { isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) {
    return (
      <div className="py-20 text-center glass-panel p-8 rounded-3xl border border-slate-800 space-y-4 max-w-md mx-auto my-10">
        <Bookmark className="w-12 h-12 text-slate-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-100">Access Your Saved Watchlist</h2>
        <p className="text-xs text-slate-400">
          Sign in to save movies to your personal watchlist and sync them across all your devices.
        </p>
        <Link
          to="/login"
          className="inline-block px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-lg"
        >
          Log In Now
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <Bookmark className="w-7 h-7 text-brand-500" />
            My Personal Watchlist
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Movies you saved to watch later.
          </p>
        </div>

        <span className="text-xs font-bold text-slate-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
          {watchlist.length} Saved {watchlist.length === 1 ? 'Film' : 'Films'}
        </span>
      </div>

      <MovieGrid movies={watchlist} loading={loading} />

    </div>
  );
}
