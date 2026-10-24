import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, Film, RotateCcw, ChevronLeft, ChevronRight, Globe, Tv, Layers } from 'lucide-react';
import MovieGrid from '../components/MovieGrid';
import { getMovies, getGenres } from '../services/movieService';

export default function Movies() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';
  const urlIndustry = searchParams.get('industry') || 'All';
  const urlContentType = searchParams.get('type') || 'All';

  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [industries, setIndustries] = useState(['All', 'Hollywood', 'Bollywood', 'Korean', 'Japanese', 'European']);
  const [contentTypes, setContentTypes] = useState(['All', 'Movie', 'Web Series', 'Drama']);
  const [languages, setLanguages] = useState(['All', 'English', 'Hindi', 'Korean', 'Japanese', 'French', 'Spanish', 'German', 'Italian']);

  const [search, setSearch] = useState(urlSearch);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedIndustry, setSelectedIndustry] = useState(urlIndustry);
  const [selectedContentType, setSelectedContentType] = useState(urlContentType);
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [sortBy, setSortBy] = useState('rating');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [totalMovies, setTotalMovies] = useState(0);

  useEffect(() => {
    setSearch(urlSearch);
    setPage(1);
  }, [urlSearch]);

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchMoviesList();
  }, [search, selectedGenre, selectedIndustry, selectedContentType, selectedLanguage, sortBy, page]);

  const fetchMetadata = async () => {
    try {
      const data = await getGenres();
      if (data.genres) setGenres(['All', ...data.genres]);
      if (data.industries && data.industries.length > 0) {
        setIndustries(['All', ...data.industries]);
      }
      if (data.languages && data.languages.length > 0) {
        setLanguages(['All', ...data.languages]);
      }
      if (data.contentTypes && data.contentTypes.length > 0) {
        setContentTypes(['All', ...data.contentTypes]);
      }
    } catch (err) {
      console.error('Failed to load filter metadata', err);
    }
  };

  const fetchMoviesList = async () => {
    try {
      setLoading(true);
      const data = await getMovies({
        search,
        genre: selectedGenre,
        industry: selectedIndustry,
        contentType: selectedContentType,
        language: selectedLanguage,
        sort: sortBy,
        page,
        limit: 24
      });
      setMovies(data.movies || []);
      setTotalMovies(data.total || 0);
      setTotalPages(data.pages || 1);
    } catch (err) {
      console.error('Failed to load movies', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedGenre('All');
    setSelectedIndustry('All');
    setSelectedContentType('All');
    setSelectedLanguage('All');
    setSortBy('rating');
    setPage(1);
    setSearchParams({});
  };

  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (val.trim()) {
      newParams.set('search', val);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams, { replace: true });
  };

  const hasActiveFilters = search || selectedGenre !== 'All' || selectedIndustry !== 'All' || selectedContentType !== 'All' || selectedLanguage !== 'All' || sortBy !== 'rating';

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-white flex items-center gap-3">
            <Film className="w-8 h-8 text-brand-500" />
            Cinema Catalog & Discoveries
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Filter by Hollywood, Bollywood, Korean, Japanese, Web Series, Dramas, and Languages.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-bold text-slate-300 bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-800 shadow-md">
            {totalMovies.toLocaleString()} Results Found
          </span>
        </div>
      </div>

      {/* Primary Category Quick Switcher (Industry / Origin) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-slate-800/80">
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mr-2">
          <Globe className="w-4 h-4 text-brand-500" /> Origin:
        </span>
        {['All', 'Hollywood', 'Bollywood', 'Korean', 'Japanese', 'European'].map((ind) => {
          const isSelected = selectedIndustry === ind;
          return (
            <button
              key={ind}
              onClick={() => {
                setSelectedIndustry(ind);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
                isSelected
                  ? 'bg-brand-600 text-white border-brand-500 shadow-md shadow-brand-600/30'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border-slate-800 hover:bg-slate-800'
              }`}
            >
              {ind === 'All' ? '🌍 All Regions' : ind}
            </button>
          );
        })}
      </div>

      {/* Content Format Switcher (Movies, Web Series, Dramas) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mr-2">
          <Tv className="w-4 h-4 text-indigo-400" /> Format:
        </span>
        {['All', 'Movie', 'Web Series', 'Drama'].map((type) => {
          const isSelected = selectedContentType === type;
          return (
            <button
              key={type}
              onClick={() => {
                setSelectedContentType(type);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900/70 text-slate-300 hover:text-white border-slate-800 hover:bg-slate-800'
              }`}
            >
              {type === 'All' ? '🎬 All Types' : type === 'Web Series' ? '📺 Web Series' : type === 'Drama' ? '🎭 Dramas' : '🎥 Movies'}
            </button>
          );
        })}
      </div>

      {/* Search and Secondary Filter Bar */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        
        <div className="flex flex-col md:flex-row items-center gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by title, actor, director, genre..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 shadow-inner"
            />
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          </div>

          {/* Language Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedLanguage}
              onChange={(e) => {
                setSelectedLanguage(e.target.value);
                setPage(1);
              }}
              className="w-full md:w-auto bg-slate-900 border border-slate-700/80 rounded-xl py-2.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="All">🗣️ All Languages</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Korean">Korean</option>
              <option value="Japanese">Japanese</option>
              <option value="French">French</option>
              <option value="Spanish">Spanish</option>
              <option value="German">German</option>
              <option value="Italian">Italian</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="w-full md:w-auto bg-slate-900 border border-slate-700/80 rounded-xl py-2.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="rating">Sort: Highest Rating</option>
              <option value="year">Sort: Release Year (Newest)</option>
              <option value="title">Sort: Title (A - Z)</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="p-2.5 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl transition-colors"
                title="Reset All Filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

        {/* Genre Pill Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {genres.map((g) => {
            const isSelected = selectedGenre === g;
            return (
              <button
                key={g}
                onClick={() => {
                  setSelectedGenre(g);
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
                  isSelected
                    ? 'bg-slate-100 text-slate-950 border-white shadow-md'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border-slate-800 hover:bg-slate-800'
                }`}
              >
                {g}
              </button>
            );
          })}
        </div>

      </div>

      {/* Movies Grid */}
      <MovieGrid movies={movies} loading={loading} />

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6 border-t border-slate-800">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 text-slate-200 font-bold text-xs rounded-xl border border-slate-800 flex items-center gap-1.5 transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <span className="text-xs text-slate-400 px-3">
            Page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong>
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 text-slate-200 font-bold text-xs rounded-xl border border-slate-800 flex items-center gap-1.5 transition-all"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}
