import API from './api';

export const getRecommendations = async (limit = 10) => {
  const response = await API.get('/recommendations', { params: { limit } });
  return response.data;
};
