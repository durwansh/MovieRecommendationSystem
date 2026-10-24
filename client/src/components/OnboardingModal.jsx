import React, { useState } from 'react';
import { Sparkles, Check, ArrowRight, Heart } from 'lucide-react';

const POPULAR_GENRES = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
  'Drama', 'Family', 'Fantasy', 'Horror', 'Mystery',
  'Romance', 'Sci-Fi', 'Thriller', 'Western'
];

export default function OnboardingModal({ isOpen, onClose, onSavePreferences }) {
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const toggleGenre = (genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else {
      if (selectedGenres.length < 5) {
        setSelectedGenres([...selectedGenres, genre]);
      }
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      await onSavePreferences(selectedGenres);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700/80 p-6 sm:p-8 shadow-2xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-brand-600/20 border border-brand-500/40 text-brand-400 mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white">Welcome to CineAI!</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Help our AI Cold-Start algorithm calibrate your recommendations. Pick up to 5 genres you enjoy most.
          </p>
        </div>

        {/* Genre Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
          {POPULAR_GENRES.map((g) => {
            const isSelected = selectedGenres.includes(g);
            return (
              <button
                key={g}
                type="button"
                onClick={() => toggleGenre(g)}
                className={`p-3 rounded-xl text-xs font-bold flex items-center justify-between border transition-all ${
                  isSelected
                    ? 'bg-brand-600/30 border-brand-500 text-white shadow-lg shadow-brand-500/20'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:border-slate-500 hover:text-white'
                }`}
              >
                <span>{g}</span>
                {isSelected ? (
                  <Check className="w-3.5 h-3.5 text-brand-400" />
                ) : (
                  <Heart className="w-3.5 h-3.5 text-slate-500 opacity-40" />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Counter & Save */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <span className="text-xs text-slate-400">
            Selected: <span className="text-white font-bold">{selectedGenres.length}</span> / 5
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Skip
            </button>
            <button
              onClick={handleFinish}
              disabled={selectedGenres.length === 0 || saving}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-brand-600/30 transition-all hover:scale-105"
            >
              <span>{saving ? 'Calibrating...' : 'Start Exploring'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
