import api from '../api';

export const getInspections = async () => {
    const response = await api.get('/inspections');
    return response.data;
};

export const addInspection = async (inspectionData) => {
    const response = await api.post('/inspections', inspectionData);
    return response.data;
};

export const updateInspection = async (id, inspectionData) => {
    const response = await api.put(`/inspections/${id}`, inspectionData);
    return response.data;
};

export const deleteInspection = async (id) => {
    const response = await api.delete(`/inspections/${id}`);
    return response.data;
};
