import axios from 'axios';

const getBaseUrl = () => {
  // 1. Explicit environment variable takes highest priority
  if (import.meta.env.VITE_API_URL) {
    const rawUrl = import.meta.env.VITE_API_URL.trim().replace(/\/$/, '');
    return rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;
  }

  // 2. In production build on Vercel, default to the deployed Render backend
  if (import.meta.env.PROD) {
    return 'https://perssonal-finance-management-system.onrender.com/api';
  }

  // 3. In local development (npm run dev), use Vite dev server proxy
  return '/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 unauthenticated
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired/invalid
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
