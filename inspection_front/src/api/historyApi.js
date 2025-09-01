import api from '../api';

const historyApi = {
  getHistories: async (parentType, parentId) => {
    try {
      const response = await api.get(`/api/histories/${parentType}/${parentId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch histories for ${parentType} ${parentId}:`, error);
      throw new Error(error.response?.data?.message || '수정 내역을 불러오는 데 실패했습니다.');
    }
  },
};

export default historyApi;
