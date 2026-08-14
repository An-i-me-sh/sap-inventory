import client from './client';

export const getMaterialsList = (params) => client.get('/materials', { params });
export const getMaterialDetail = (id) => client.get(`/materials/${id}`);
