import client from './client';

export const getPurchaseOrders = (params) => client.get('/purchase-orders', { params });
export const getPurchaseOrderDetail = (poNumber) => client.get(`/purchase-orders/${poNumber}`);
export const exportPurchaseOrdersCsvUrl = '/api/purchase-orders/export/csv';
