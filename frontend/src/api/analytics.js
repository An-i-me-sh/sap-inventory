import client from './client';

export const getAnalyticsData = () => client.get('/analytics');
export const queryAi = (question) => client.post('/ai/query', { question });
export const getAiInsights = () => client.get('/ai/insights');
export const getAlerts = (params) => client.get('/alerts', { params });
export const resolveAlert = (id) => client.post(`/alerts/${id}/resolve`);
export const unresolveAlert = (id) => client.post(`/alerts/${id}/unresolve`);
export const exportAlertsCsvUrl = '/api/alerts/export/csv';
export const getDataQualityReport = () => client.get('/data-quality');
