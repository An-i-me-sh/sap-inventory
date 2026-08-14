import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const detail = error.response?.data?.detail || 'An unexpected communication error occurred with the server.';
    return Promise.reject(new Error(detail));
  }
);

export default client;
