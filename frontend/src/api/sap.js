import client from './client';

export const getSapStatus = () => client.get('/sap/status');
export const triggerSync = () => client.post('/sync');
export const getSyncJobs = (params) => client.get('/sync/jobs', { params });
export const getIntegrationLogs = (params) => client.get('/integration-logs', { params });
export const getHealth = () => client.get('/health');
export const getDashboardData = () => client.get('/dashboard');
