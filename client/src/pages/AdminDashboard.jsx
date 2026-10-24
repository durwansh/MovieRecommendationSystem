import React, { useState, useEffect, useContext } from 'react';
import { Shield, Plus, Trash2, Edit3, Film, Users, Star, MessageSquare, AlertCircle, X, Check, Activity } from 'lucide-react';
import { getSystemStats, addMovie, updateMovie, deleteMovie, getUsers, deleteUser } from '../services/adminService';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('movies'); // 'movies' | 'users' | 'stats'
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [recentRatings, setRecentRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Movie Modal state
  const [showMovieModal, setShowMovieModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    releaseYear: 2024,
    genres: 'Sci-Fi, Action',
    director: '',
    cast: '',
    duration: 120,
    posterUrl: '',
    bannerUrl: ''
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [isAdmin]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData] = await Promise.all([
        getSystemStats(),
        getUsers()
      ]);
      setStats(statsData.stats || {});
      setRecentRatings(statsData.recentRatings || []);
      setUsersList(usersData.users || []);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingMovie(null);
    setFormData({
      title: '',
      description: '',
      releaseYear: 2024,
      genres: 'Sci-Fi, Action',
      director: '',
      cast: '',
      duration: 120,
      posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80'
    });
    setFormError('');
    setFormSuccess('');
    setShowMovieModal(true);
  };

  const handleOpenEditModal = (movie) => {
    setEditingMovie(movie);
    setFormData({
      title: movie.title,
      description: movie.description,
      releaseYear: movie.releaseYear,
      genres: (movie.genres || []).join(', '),
      director: movie.director,
      cast: (movie.cast || []).join(', '),
      duration: movie.duration || 120,
      posterUrl: movie.posterUrl,
      bannerUrl: movie.bannerUrl || movie.posterUrl
    });
    setFormError('');
    setFormSuccess('');
    setShowMovieModal(true);
  };

  const handleSaveMovie = async (e) => {
    e.preventDefault();
    try {
      setFormError('');
      setFormSuccess('');

      if (editingMovie) {
        await updateMovie(editingMovie._id, formData);
        setFormSuccess('Movie updated successfully!');
      } else {
        await addMovie(formData);
        setFormSuccess('Movie added successfully!');
      }

      await fetchDashboardData();
      setTimeout(() => {
        setShowMovieModal(false);
      }, 1000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save movie');
    }
  };

  const handleDeleteMovie = async (movieId, movieTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${movieTitle}"?`)) return;
    try {
      await deleteMovie(movieId);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete movie');
    }
  };

  const handleDeleteUserAccount = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user account "${userName}"?`)) return;
    try {
      await deleteUser(userId);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Admin Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-600/30">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Administrator Dashboard</h1>
            <p className="text-xs text-slate-400">Manage catalog records, user accounts, and system analytics</p>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-gradient-to-r from-brand-600 to-red-700 hover:from-brand-500 hover:to-red-600 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add New Movie
        </button>
      </div>

      {/* Analytics KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Movies</span>
            <Film className="w-4 h-4 text-brand-500" />
          </div>
          <p className="text-2xl font-extrabold text-white">{stats?.totalMovies || 0}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Registered Users</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{stats?.totalUsers || 0}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Ratings</span>
            <Star className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{stats?.totalRatings || 0}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Avg System Rating</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{stats?.systemAvgRating || 0} / 5.0</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('movies')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'movies'
              ? 'bg-brand-600 text-white'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          Manage Users ({usersList.length})
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'stats'
              ? 'bg-brand-600 text-white'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          Recent Activity & Feedback
        </button>
      </div>

      {/* Tab 1: User Management Table */}
      {activeTab === 'movies' && (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800 font-bold text-sm text-slate-200">
            Registered User Accounts ({usersList.length})
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">User Name</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Preferred Genres</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {usersList.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-900/40">
                    <td className="p-3 font-semibold text-slate-100">{u.name}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'admin' ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">{(u.preferredGenres || []).join(', ') || 'None'}</td>
                    <td className="p-3 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUserAccount(u._id, u.name)}
                          className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-950/40"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Activity Log Feed */}
      {activeTab === 'stats' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            Recent Ratings & Feedback Feed
          </h3>

          <div className="space-y-3">
            {recentRatings.map((r) => (
              <div key={r._id} className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                    <span>{r.user?.name || 'User'}</span>
                    <span className="text-slate-500">rated</span>
                    <span className="text-brand-400">{r.movie?.title || 'Movie'}</span>
                  </div>
                  {r.reviewText && <p className="text-xs text-slate-400 mt-1">"{r.reviewText}"</p>}
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-900/60">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{r.score}/5</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Movie Modal */}
      {showMovieModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl glass-panel p-6 rounded-3xl border border-slate-700 max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-brand-500" />
                {editingMovie ? 'Edit Movie Entry' : 'Add New Movie to Catalog'}
              </h3>
              <button
                onClick={() => setShowMovieModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-950 border border-red-800 text-red-300 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" /> {formError}
              </div>
            )}

            {formSuccess && (
              <div className="p-3 bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" /> {formSuccess}
              </div>
            )}

            <form onSubmit={handleSaveMovie} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Movie Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g. Oppenheimer"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Description / Synopsis</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                  placeholder="Brief synopsis of the film..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Release Year</label>
                  <input
                    type="number"
                    value={formData.releaseYear}
                    onChange={(e) => setFormData({ ...formData, releaseYear: e.target.value })}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Genres (Comma separated)</label>
                <input
                  type="text"
                  value={formData.genres}
                  onChange={(e) => setFormData({ ...formData, genres: e.target.value })}
                  required
                  placeholder="Sci-Fi, Action, Drama"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Director</label>
                <input
                  type="text"
                  value={formData.director}
                  onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                  required
                  placeholder="Christopher Nolan"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Starring Cast (Comma separated)</label>
                <input
                  type="text"
                  value={formData.cast}
                  onChange={(e) => setFormData({ ...formData, cast: e.target.value })}
                  placeholder="Leonardo DiCaprio, Tom Hardy"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Poster Image URL</label>
                <input
                  type="url"
                  value={formData.posterUrl}
                  onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowMovieModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl shadow-md"
                >
                  Save Movie
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
