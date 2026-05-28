// authService.js
import apiClient from '../utils/api';

export async function login(email, password) {
  const response = await apiClient.post('/auth/login', { email, password });

  if (!response.data?.token) {
    const message = response.data?.message || 'Login failed. Please check your email and password.';
    throw new Error(message);
  }

  localStorage.setItem('token', response.data.token);
  localStorage.setItem('user', JSON.stringify({
    email: response.data.email,
    role: response.data.role,
    userId: response.data.userId
  }));

  return response.data;
}

export async function register(name, email, password, role) {
  const response = await apiClient.post('/auth/register', {
    name,
    email,
    password,
    role
  });
  return response.data;
}

export async function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}
