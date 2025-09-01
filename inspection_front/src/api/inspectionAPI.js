import api from '../api';

export const getInspections = async () => {
  try {
    const response = await api.get('/inspections');
    return response.data;
  } catch (error) {
    console.error("Failed to fetch inspections:", error);
    throw new Error(error.response?.data?.message || '전체 검수 내역을 불러오는 데 실패했습니다.');
  }
};

export const getMyInspections = async () => {
  try {
    const response = await api.get('/api/my-inspections');
    return response.data;
  } catch (error) {
    console.error("Failed to fetch my inspections:", error);
    throw new Error(error.response?.data?.message || '작성 내역을 불러오는 데 실패했습니다.');
  }
};

export const getInspectionById = async (id) => {
  try {
    const response = await api.get(`/inspections/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch inspection ${id}:`, error);
    throw new Error(error.response?.data?.message || '상세 정보를 불러오는 데 실패했습니다.');
  }
};

export const addInspection = async (inspectionData) => {
  try {
    const response = await api.post('/inspections', inspectionData);
    return response.data;
  } catch (error) {
    console.error("Failed to add inspection:", error);
    throw new Error(error.response?.data?.message || '검수 항목 추가에 실패했습니다.');
  }
};

export const updateInspection = async (id, inspectionData) => {
  try {
    const response = await api.put(`/inspections/${id}`, inspectionData);
    return response.data;
  } catch (error) {
    console.error(`Failed to update inspection ${id}:`, error);
    throw new Error(error.response?.data?.message || '검수 항목 수정에 실패했습니다.');
  }
};

export const deleteInspection = async (id) => {
  try {
    const response = await api.delete(`/api/inspections/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete inspection ${id}:`, error);
    throw new Error(error.response?.data?.message || '삭제에 실패했습니다.');
  }
};