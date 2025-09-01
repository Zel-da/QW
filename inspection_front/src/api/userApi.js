import api from '../api';

// GET all users
export const getUsers = async () => {
  try {
    const response = await api.get('/api/users');
    return response.data;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    throw new Error(error.response?.data?.message || '사용자 목록을 불러오는 데 실패했습니다.');
  }
};

// POST a new user
export const createUser = async (userData) => {
  try {
    const response = await api.post('/api/users', userData);
    return response.data;
  } catch (error) {
    console.error("Failed to create user:", error);
    throw new Error(error.response?.data?.message || '사용자 생성에 실패했습니다.');
  }
};

// DELETE a user
export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/api/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete user ${id}:`, error);
    throw new Error(error.response?.data?.message || '사용자 삭제에 실패했습니다.');
  }
};
