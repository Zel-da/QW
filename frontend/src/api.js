import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Vite proxy will handle redirecting this to the backend
});

// Add a request interceptor to automatically include the token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Add a response interceptor to handle 401 Unauthorized errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // For example, token expired or is invalid
      localStorage.removeItem('token');
      // Redirect to login page, but avoid circular dependencies
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
