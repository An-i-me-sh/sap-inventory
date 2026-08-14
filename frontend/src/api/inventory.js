import client from './client';

export const getInventoryList = (params) => client.get('/inventory', { params });
export const getInventoryDetail = (materialId) => client.get(`/inventory/${materialId}`);
export const exportInventoryCsvUrl = '/api/inventory/export/csv';
