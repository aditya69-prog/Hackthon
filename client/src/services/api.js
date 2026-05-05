import axios from 'axios';

// Determine API base URL based on environment
const getAPIBaseURL = () => {
  // Production: Use env variable or absolute URL
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Development: Use relative path (proxied by vite)
  return '/api';
};

const API = axios.create({
  baseURL: getAPIBaseURL(),
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('rnsconnect_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle auth errors globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('rnsconnect_token');
      localStorage.removeItem('rnsconnect_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default API;
