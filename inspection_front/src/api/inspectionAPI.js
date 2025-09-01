import api from '../api';

/**
 * Adds a new inspection.
 * @param {Object} inspectionData The data for the new inspection.
 * @returns {Promise<Object>} A promise that resolves to the response data from the server.
 */
export const addInspection = async (inspectionData) => {
  try {
    const response = await api.post('/inspections', inspectionData);
    return response.data;
  } catch (error) {
    console.error("Failed to add inspection:", error);
    throw new Error(error.response?.data?.message || '검수 항목 추가에 실패했습니다.');
  }
};

/**
 * Fetches all inspections.
 * @returns {Promise<Array>} A promise that resolves to an array of all inspections.
 */
export const getInspections = async () => {
  try {
    const response = await api.get('/inspections');
    return response.data;
  } catch (error) {
    console.error("Failed to fetch all inspections:", error);
    throw new Error(error.response?.data?.message || '전체 검수 내역을 불러오는 데 실패했습니다.');
  }
};

/**
 * Fetches inspections created by the currently logged-in user.
 * @returns {Promise<Array>} A promise that resolves to an array of inspections.
 */
export const getMyInspections = async () => {
  try {
    const response = await api.get('/my-inspections');
    return response.data;
  } catch (error) {
    console.error("Failed to fetch my inspections:", error);
    throw new Error(error.response?.data?.message || '작성 내역을 불러오는 데 실패했습니다.');
  }
};

/**
 * Fetches a single inspection by its ID.
 * @param {number} id The ID of the inspection to fetch.
 * @returns {Promise<Object>} A promise that resolves to the inspection object.
 */
export const getInspectionById = async (id) => {
  try {
    const response = await api.get(`/inspections/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch inspection ${id}:`, error);
    throw new Error(error.response?.data?.message || '상세 정보를 불러오는 데 실패했습니다.');
  }
};

/**
 * Deletes a specific inspection by its ID.
 * @param {number} id The ID of the inspection to delete.
 * @returns {Promise<Object>} A promise that resolves to the response data from the server.
 */
export const deleteInspection = async (id) => {
  try {
    const response = await api.delete(`/inspections/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete inspection ${id}:`, error);
    throw new Error(error.response?.data?.message || '삭제에 실패했습니다.');
  }
};
