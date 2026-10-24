import React, { useState, useEffect, useContext } from 'react';
import { Sparkles, Cpu, Users, Info, RefreshCw, Star } from 'lucide-react';
import MovieGrid from '../components/MovieGrid';
import { getRecommendations } from '../services/recommendationService';
import { AuthContext } from '../context/AuthContext';

export default function Recommendations() {
  const { isAuthenticated, user } = useContext(AuthContext);
  const [recommendations, setRecommendations] = useState([]);
  const [strategy, setStrategy] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecs();
  }, [isAuthenticated]);

  const fetchRecs = async () => {
    try {
      setLoading(true);
      const data = await getRecommendations(15);
      setRecommendations(data.recommendations || []);
      setStrategy(data.strategy || '');
    } catch (err) {
      console.error('Failed to fetch recommendations', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-900/60 relative overflow-hidden bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950 border border-indigo-700/80 text-indigo-300 text-xs font-bold shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
              AI RecSys Engine Active
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {isAuthenticated ? `Personalized AI Movies for ${user.name}` : 'AI Recommended Cinema Discoveries'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Our hybrid AI recommendation engine blends your 5-star ratings, genre preferences, and collaborative matrices from cinephiles with similar taste to compute precision match scores.
            </p>
          </div>

          <button
            onClick={fetchRecs}
            disabled={loading}
            className="px-4 py-2.5 bg-indigo-900/80 hover:bg-indigo-800 border border-indigo-700/60 text-indigo-200 font-semibold text-xs rounded-xl flex items-center gap-2 self-start md:self-auto transition-all shadow-md"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Recs
          </button>
        </div>
      </div>

      {/* Algorithm Strategy Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-slate-300">Active Strategy:</span>
          <span className="font-bold text-indigo-300 bg-indigo-950/80 px-2.5 py-0.5 rounded-md border border-indigo-800">
            {strategy || 'Hybrid AI Engine'}
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            Content Match (40%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
            Collaborative Pick (40%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            Baseline Rating (20%)
          </span>
        </div>
      </div>

      {/* Recommendations Grid */}
      <MovieGrid movies={recommendations} loading={loading} isRecommendations={true} />

    </div>
  );
}
