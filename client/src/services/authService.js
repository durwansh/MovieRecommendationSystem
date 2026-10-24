import API from './api';

export const login = async (email, password) => {
  const response = await API.post('/auth/login', { email, password });
  if (response.data.user) {
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const register = async (name, email, password, preferredGenres) => {
  const response = await API.post('/auth/register', { name, email, password, preferredGenres });
  if (response.data.user) {
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const getMe = async () => {
  const response = await API.get('/auth/me');
  return response.data;
};

export const updatePreferences = async (preferredGenres) => {
  const response = await API.put('/auth/preferences', { preferredGenres });
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const updatedUser = { ...currentUser, ...response.data.user };
  localStorage.setItem('user', JSON.stringify(updatedUser));
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('user');
};
