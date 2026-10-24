import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Film, Star, ArrowRight, ShieldCheck, Cpu, Users, Eye, Play, Flame, Award, HelpCircle } from 'lucide-react';
import MovieGrid from '../components/MovieGrid';
import { getMovies } from '../services/movieService';
import { getRecommendations } from '../services/recommendationService';
import { AuthContext } from '../context/AuthContext';

export default function Home() {
  const { isAuthenticated, user } = useContext(AuthContext);
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [moviesData, recsData] = await Promise.all([
        getMovies({ limit: 12, sort: 'rating' }),
        getRecommendations(6)
      ]);

      setTopRated(moviesData.movies || []);
      setRecommendations(recsData.recommendations || []);
      setFeaturedMovies(moviesData.movies?.slice(0, 4) || []);
    } catch (error) {
      console.error('Failed to fetch home page data', error);
    } finally {
      setLoading(false);
    }
  };

  const heroMovie = featuredMovies[0] || {
    _id: 'featured',
    title: 'Cinderella',
    description: 'Cinderella has faith her dreams of a better life will come true with help from her loyal mice friends and a wave of her Fairy Godmother wand.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/avz6S9HYWs4O8Oe4PenBFNX4uDi.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/rH0DPF7pB35jxLxKb3JRUgCrrnp.jpg',
    genres: ['Family', 'Fantasy', 'Animation'],
    averageRating: 4.8,
    releaseYear: 1950,
    numRatings: 6523
  };

  return (
    <div className="space-y-12 pb-10">
      
      {/* Immersive Cinema Hero Billboard */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 group">
        <div className="absolute inset-0 z-0">
          <img
            src={heroMovie.bannerUrl || heroMovie.posterUrl}
            alt={heroMovie.title}
            className="w-full h-full object-cover opacity-40 scale-105 group-hover:scale-100 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        </div>

        <div className="relative z-10 p-6 sm:p-12 lg:p-16 max-w-2xl space-y-5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-brand-600 text-white uppercase tracking-wider shadow-lg shadow-brand-600/30 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" /> TMDB Spotlight
            </span>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-slate-950/80 px-2.5 py-1 rounded-full border border-slate-800">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{heroMovie.averageRating ? heroMovie.averageRating.toFixed(1) : '4.8'}</span>
              <span className="text-[10px] text-slate-400 font-normal">({heroMovie.numRatings || 0})</span>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900/80 text-slate-300 border border-slate-800">
              {heroMovie.releaseYear}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {heroMovie.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 line-clamp-3 leading-relaxed font-normal">
            {heroMovie.description}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {heroMovie._id !== 'featured' ? (
              <Link
                to={`/movies/${heroMovie._id}`}
                className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-600/30 flex items-center gap-2 transition-all hover:scale-105"
              >
                <Eye className="w-4 h-4" />
                View Movie Details
              </Link>
            ) : (
              <Link
                to="/movies"
                className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-600/30 flex items-center gap-2 transition-all"
              >
                <Film className="w-4 h-4" />
                Browse Catalog
              </Link>
            )}

            <Link
              to="/recommendations"
              className="px-6 py-3 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 font-bold text-sm rounded-xl flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Personalized Recommendations
            </Link>
          </div>
        </div>
      </div>

      {/* Real-Time AI Recommendations Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-950 border border-indigo-800 text-indigo-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
                {isAuthenticated ? `Curated AI Picks for ${user?.name}` : 'AI Curated Discoveries'}
              </h2>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span>Powered by Content & Collaborative Hybrid Engine</span>
              <span className="hidden sm:inline">•</span>
              <span className="text-indigo-400">Click any '% Match' badge to view AI explanation</span>
            </p>
          </div>

          <Link
            to="/recommendations"
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 self-start sm:self-auto"
          >
            Explore AI Matrix <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <MovieGrid movies={recommendations} loading={loading} isRecommendations={true} />
      </section>

      {/* Top Rated TMDB Movies Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Top Rated Global Classics
            </h2>
            <p className="text-xs text-slate-400">
              Highest rated authentic TMDB movies across all genres
            </p>
          </div>

          <Link
            to="/movies"
            className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1"
          >
            Browse All (1,322 Films) <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <MovieGrid movies={topRated} loading={loading} />
      </section>

      {/* Commercial Perks & Experience Section */}
      <section className="pt-8 border-t border-slate-800/80">
        <div className="text-center space-y-1 mb-8">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-500">
            The Ultimate Cinema Hub
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-white">
            Why Movie Buffs Choose CineAI
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Smart recommendations, curated global collections, and personalized watchlists tailored to your unique taste.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-100 text-lg">Next-Gen AI Discovery</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Never waste 30 minutes looking for what to watch. Our recommendation engine instantly tailors suggestions to your mood and watch patterns.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Film className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-100 text-lg">Massive Movie Catalog</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explore classics, blockbusters, and award-winning titles with full cast info, director highlights, and verified ratings.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Star className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-100 text-lg">Personalized Watchlists</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Bookmark upcoming must-watches, leave ratings and reviews, and build your own private cinematic library in one place.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
