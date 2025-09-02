import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
});

// Global loading state
let isLoading = false;
let isColdStarting = false;
let coldStartTimer = null;
let loadingMessage = '';
let loadingCallbacks = []; // Callbacks to notify App.jsx

export const subscribeToLoading = (callback) => {
  loadingCallbacks.push(callback);
  return () => {
    loadingCallbacks = loadingCallbacks.filter(cb => cb !== callback);
  };
};

const notifyLoadingChange = () => {
  loadingCallbacks.forEach(callback => callback({ isLoading, isColdStarting, loadingMessage }));
};

api.interceptors.request.use(
  (config) => {
    isLoading = true;
    loadingMessage = ''; // Clear previous message
    notifyLoadingChange();

    // Set a timer to detect cold start
    coldStartTimer = setTimeout(() => {
      isColdStarting = true;
      loadingMessage = '서버 시작 중입니다. 잠시만 기다려 주세요... (예상 소요 시간: 약 10~30초)';
      notifyLoadingChange();
    }, 5000); // 5 seconds threshold for cold start message

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    isLoading = false;
    isColdStarting = false;
    loadingMessage = '';
    clearTimeout(coldStartTimer);
    notifyLoadingChange();
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    isLoading = false;
    isColdStarting = false;
    loadingMessage = '';
    clearTimeout(coldStartTimer);
    notifyLoadingChange();
    return response;
  },
  (error) => {
    isLoading = false;
    isColdStarting = false;
    loadingMessage = '';
    clearTimeout(coldStartTimer);
    notifyLoadingChange();
    return Promise.reject(error);
  }
);

export default api;