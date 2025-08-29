import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const api = axios.create({
  baseURL: '/api',
});

// Add a request interceptor to include the token in headers
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

// Add a response interceptor to handle 401 Unauthorized errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        // Instead of forcing a reload, we can just notify the user or use a state management solution
        // For simplicity now, we reload.
        window.location.reload();
        alert('세션이 만료되었습니다. 다시 로그인해주세요.');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
