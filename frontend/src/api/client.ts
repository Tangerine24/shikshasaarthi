import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('ss_access_token');
  if (token) {
    config.headers.Authorization = 'Bearer ' + token;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('ss_access_token');
      localStorage.removeItem('ss_refresh_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
