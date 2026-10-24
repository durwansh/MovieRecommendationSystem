import API from './api';

export const addMovie = async (movieData) => {
  const response = await API.post('/admin/movies', movieData);
  return response.data;
};

export const updateMovie = async (id, movieData) => {
  const response = await API.put(`/admin/movies/${id}`, movieData);
  return response.data;
};

export const deleteMovie = async (id) => {
  const response = await API.delete(`/admin/movies/${id}`);
  return response.data;
};

export const getUsers = async () => {
  const response = await API.get('/admin/users');
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await API.delete(`/admin/users/${id}`);
  return response.data;
};

export const getSystemStats = async () => {
  const response = await API.get('/admin/stats');
  return response.data;
};
