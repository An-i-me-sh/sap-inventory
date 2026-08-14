import client from './client';

export const getVendorsList = (params) => client.get('/vendors', { params });
export const getVendorDetail = (vendorId) => client.get(`/vendors/${vendorId}`);
export const exportVendorsCsvUrl = '/api/vendors/export/csv';
