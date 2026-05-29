import api from './api';

export const login = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  const { token, username: user, email, role } = response.data;

  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify({ username: user, email, role }));

  return response.data;
};

export const register = async (username, email, password) => {
  const response = await api.post('/auth/register', { username, email, password });
  const { token, username: user, email: userEmail, role } = response.data;

  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify({ username: user, email: userEmail, role }));

  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getToken = () => localStorage.getItem('token');

export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => !!localStorage.getItem('token');

export default api;
