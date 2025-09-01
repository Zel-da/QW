import api from '../api';

const qualityApi = {
  // GET all quality improvement items
  getQualityImprovements: async () => {
    try {
      const response = await api.get('/quality-improvements');
      return response.data;
    } catch (error) {
      console.error("Failed to fetch quality improvements:", error);
      throw new Error(error.response?.data?.message || '품질 개선 항목을 불러오는 데 실패했습니다.');
    }
  },

  // GET a single quality improvement item by ID
  getQualityImprovementById: async (id) => {
    try {
      const response = await api.get(`/quality-improvements/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch quality improvement item ${id}:`, error);
      throw new Error(error.response?.data?.message || '상세 정보를 불러오는 데 실패했습니다.');
    }
  },

  // POST a new quality improvement item
  addQualityItem: async (itemData) => {
    try {
      const response = await api.post('/quality-improvements', itemData);
      return response.data;
    } catch (error) {
      console.error("Failed to add quality improvement item:", error);
      throw new Error(error.response?.data?.message || '항목 추가에 실패했습니다.');
    }
  },

  // PUT (update) an existing quality improvement item
  updateQualityImprovement: async (id, itemData) => {
    try {
      const response = await api.put(`/quality-improvements/${id}`, itemData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update quality improvement item ${id}:`, error);
      throw new Error(error.response?.data?.message || '항목 수정에 실패했습니다.');
    }
  },

  // DELETE a quality improvement item
  deleteQualityImprovement: async (id) => {
    try {
      const response = await api.delete(`/api/quality-improvements/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete quality improvement item ${id}:`, error);
      throw new Error(error.response?.data?.message || '항목 삭제에 실패했습니다.');
    }
  },

  // GET all quality improvement items for the current user
  getMyQualityImprovements: async () => {
    try {
      const response = await api.get('/my-quality-improvements');
      return response.data;
    } catch (error) {
      console.error("Failed to fetch my quality improvements:", error);
      throw new Error(error.response?.data?.message || '내 작성 내역을 불러오는 데 실패했습니다.');
    }
  }
};

export default qualityApi;