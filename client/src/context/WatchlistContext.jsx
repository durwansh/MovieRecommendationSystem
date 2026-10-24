import React, { createContext, useState, useEffect, useContext } from 'react';
import { getWatchlist, addToWatchlist, removeFromWatchlist } from '../services/watchlistService';
import { AuthContext } from './AuthContext';

export const WatchlistContext = createContext();

export const WatchlistProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchWatchlist();
    } else {
      setWatchlist([]);
    }
  }, [user]);

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const data = await getWatchlist();
      setWatchlist(data.watchlist || []);
    } catch (error) {
      console.error('Failed to fetch watchlist', error);
    } finally {
      setLoading(false);
    }
  };

  const addMovie = async (movieId) => {
    try {
      await addToWatchlist(movieId);
      await fetchWatchlist();
      return true;
    } catch (error) {
      console.error('Failed to add to watchlist', error);
      return false;
    }
  };

  const removeMovie = async (movieId) => {
    try {
      await removeFromWatchlist(movieId);
      setWatchlist(prev => prev.filter(m => m._id !== movieId));
      return true;
    } catch (error) {
      console.error('Failed to remove from watchlist', error);
      return false;
    }
  };

  const isInWatchlist = (movieId) => {
    return watchlist.some(m => m._id === movieId);
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        loading,
        addMovie,
        removeMovie,
        isInWatchlist,
        refreshWatchlist: fetchWatchlist
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};
