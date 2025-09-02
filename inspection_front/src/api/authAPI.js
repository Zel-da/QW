import api from '../api';
import { jwtDecode } from 'jwt-decode';

export const login = async (username, password) => {
  try {
    const response = await api.post('/api/login', { username, password });
    if (response.data.token) {
      const token = response.data.token;
      localStorage.setItem('token', token);
      // Decode token to get user info
      const decodedUser = jwtDecode(token);
      // The backend puts username in 'username' and id in 'user_id' inside the token
      return { name: decodedUser.username, id: decodedUser.user_id };
    }
  } catch (error) {
    console.error("Login failed:", error);
    // Throw a more specific error message
    throw new Error(error.response?.data?.message || '로그인에 실패했습니다.');
  }
};

export const logout = () => {
  localStorage.removeItem('token');
};

export const changePassword = async (passwordData) => {
  try {
    const response = await api.post('/api/change-password', passwordData);
    return response.data;
  } catch (error) {
    console.error("Password change failed:", error);
    throw new Error(error.response?.data?.message || '비밀번호 변경에 실패했습니다.');
  }
};