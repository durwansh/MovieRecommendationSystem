import React from 'react';
import { Star, MessageSquare, User } from 'lucide-react';

export default function ReviewSection({ reviews = [] }) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-center text-slate-400 text-sm">
        <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p>No community reviews yet. Be the first cinephile to leave a review!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-indigo-400" />
        Community Feedback & Reviews ({reviews.length})
      </h3>

      <div className="space-y-3">
        {reviews.map((rev) => (
          <div
            key={rev._id}
            className="glass-panel p-4 rounded-xl border border-slate-800/80 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-300 font-bold text-xs">
                  {rev.user?.name ? rev.user.name[0].toUpperCase() : 'U'}
                </div>
                <span className="text-xs font-semibold text-slate-200">
                  {rev.user?.name || 'Anonymous Cinephile'}
                </span>
              </div>

              <div className="flex items-center gap-1 bg-amber-950/40 border border-amber-900/60 px-2 py-0.5 rounded-full text-xs font-bold text-amber-400">
                <Star className="w-3 h-3 fill-amber-400" />
                <span>{rev.score}/5</span>
              </div>
            </div>

            {rev.reviewText ? (
              <p className="text-xs text-slate-300 leading-relaxed pl-9">
                "{rev.reviewText}"
              </p>
            ) : (
              <p className="text-[11px] text-slate-500 italic pl-9">Rated without written feedback</p>
            )}

            <div className="text-[10px] text-slate-500 text-right">
              {new Date(rev.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
