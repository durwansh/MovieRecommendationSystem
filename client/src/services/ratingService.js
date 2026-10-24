import API from './api';

export const addOrUpdateRating = async (movieId, score, reviewText = '') => {
  const response = await API.post('/ratings', { movieId, score, reviewText });
  return response.data;
};

export const getUserRatings = async () => {
  const response = await API.get('/ratings/my-ratings');
  return response.data;
};

export const deleteRating = async (ratingId) => {
  const response = await API.delete(`/ratings/${ratingId}`);
  return response.data;
};
