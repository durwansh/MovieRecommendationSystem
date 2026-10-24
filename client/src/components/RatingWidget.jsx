import React, { useState } from 'react';
import { Star, Send, Check } from 'lucide-react';
import { addOrUpdateRating } from '../services/ratingService';

export default function RatingWidget({ movieId, initialRating = 0, onRatingSubmitted }) {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleRate = async (score) => {
    setRating(score);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setErrorMessage('Please select a star rating between 1 and 5');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');
      const data = await addOrUpdateRating(movieId, rating, reviewText);
      setSuccessMessage('Rating & review saved successfully!');
      if (onRatingSubmitted) {
        onRatingSubmitted(data);
      }
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  const starLabels = ['Rate', 'Poor', 'Fair', 'Good', 'Very Good', 'Masterpiece'];

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
      <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
        <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
        Rate & Review Movie
      </h3>

      {successMessage && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-semibold rounded-lg flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs font-semibold rounded-lg">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating Interactive Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = (hoverRating || rating) >= star;
              return (
                <button
                  type="button"
                  key={star}
                  onClick={() => handleRate(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-slate-600 hover:scale-125 transition-transform duration-150 focus:outline-none"
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      active ? 'fill-amber-400 text-amber-400' : 'text-slate-600 hover:text-amber-300'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <span className="text-xs font-semibold text-amber-400 bg-amber-950/40 border border-amber-900/60 px-2.5 py-1 rounded-full">
            {starLabels[hoverRating || rating]} {rating > 0 && `(${rating}/5)`}
          </span>
        </div>

        {/* Review Feedback Input */}
        <div>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share your thoughts about the movie plot, acting, directing, or cinematography (optional)..."
            rows={3}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-brand-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
        >
          <Send className="w-4 h-4" />
          {isSubmitting ? 'Saving...' : 'Submit Rating & Feedback'}
        </button>
      </form>
    </div>
  );
}
