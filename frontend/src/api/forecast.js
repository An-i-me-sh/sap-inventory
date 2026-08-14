import client from './client';

export const getForecast = (materialId, horizonDays = 30) => client.get(`/forecasts/${materialId}`, { params: { horizon_days: horizonDays } });
export const generateRecommendation = (materialId) => client.post(`/forecasts/${materialId}/recommend`);
