import API from './api';

export const getMovies = async (params = {}) => {
  const response = await API.get('/movies', { params });
  return response.data;
};

export const getMovieById = async (id) => {
  const response = await API.get(`/movies/${id}`);
  return response.data;
};

export const getGenres = async () => {
  const response = await API.get('/movies/genres');
  return response.data;
};
