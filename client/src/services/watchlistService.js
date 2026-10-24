import API from './api';

export const getWatchlist = async () => {
  const response = await API.get('/watchlist');
  return response.data;
};

export const addToWatchlist = async (movieId) => {
  const response = await API.post('/watchlist', { movieId });
  return response.data;
};

export const removeFromWatchlist = async (movieId) => {
  const response = await API.delete(`/watchlist/${movieId}`);
  return response.data;
};
