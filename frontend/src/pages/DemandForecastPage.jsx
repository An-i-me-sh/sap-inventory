import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getForecast } from '../api/forecast';
import { getMaterialsList } from '../api/materials';

export default function DemandForecastPage() {
  const [materials, setMaterials] = useState([]);
  const [selectedMat, setSelectedMat] = useState('MAT-1001');
  const [horizon, setHorizon] = useState(30);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getMaterialsList({ page_size: 20 })
      .then(res => {
        setMaterials(res.items || []);
        if (res.items && res.items.length > 0) {
          setSelectedMat(res.items[0].material_id);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedMat) return;
    setLoading(true);
    getForecast(selectedMat, horizon)
      .then(res => setForecast(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedMat, horizon]);

  return (
    <div className="flex-1 overflow-y-auto bg-background p-container-padding flex flex-col gap-6">
      <div className="bg-surface p-6 border border-outline-variant">
        <h1 className="font-display text-display text-on-surface">Machine Learning Demand Forecasting</h1>
        <p className="font-body-sm text-on-surface-variant">
          Predictive demand analysis using scikit-learn RandomForestRegressor trained on historical SAP sales billing data.
        </p>
      </div>

      {/* CONTROLS BAR */}
      <div className="bg-surface p-4 border border-outline-variant grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="font-label text-label text-on-surface-variant uppercase tracking-wider block mb-1">
            Select Material SKU
          </label>
          <select
            value={selectedMat}
            onChange={(e) => setSelectedMat(e.target.value)}
            className="w-full bg-surface-container border border-outline-variant text-on-surface font-data-sm p-2 focus:outline-none"
          >
            {materials.map((m) => (
              <option key={m.material_id} value={m.material_id}>
                {m.material_id} - {m.description}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-label text-label text-on-surface-variant uppercase tracking-wider block mb-1">
            Forecast Horizon (Days)
          </label>
          <div className="flex gap-2">
            {[7, 30, 60, 90].map((h) => (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className={`flex-1 py-2 font-label text-[11px] uppercase tracking-wider border transition-colors ${
                  horizon === h
                    ? 'bg-primary-container text-on-primary-container font-bold border-primary'
                    : 'bg-surface-container text-on-surface border-outline-variant hover:bg-surface-container-highest'
                }`}
              >
                {h} Days
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FORECAST RESULTS & ACCURACY CARD */}
      {loading ? (
        <div className="p-12 text-center font-data-sm text-on-surface-variant">
          Training RandomForest model & calculating predictions...
        </div>
      ) : forecast ? (
        <div className="flex flex-col gap-6">
          <div className="bg-surface border border-outline-variant grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-outline-variant">
            <div className="p-6">
              <div className="font-label text-label text-on-surface-variant uppercase mb-1">Predicted Demand ({horizon}D)</div>
              <div className="font-display text-display font-mono text-tertiary">{forecast.predicted_demand}</div>
            </div>
            <div className="p-6">
              <div className="font-label text-label text-on-surface-variant uppercase mb-1">Mean Absolute Error (MAE)</div>
              <div className="font-display text-display font-mono text-on-surface">{forecast.mae}</div>
            </div>
            <div className="p-6">
              <div className="font-label text-label text-on-surface-variant uppercase mb-1">Root Mean Sq. Error (RMSE)</div>
              <div className="font-display text-display font-mono text-on-surface">{forecast.rmse}</div>
            </div>
            <div className="p-6">
              <div className="font-label text-label text-on-surface-variant uppercase mb-1">Mean Abs % Error (MAPE)</div>
              <div className="font-display text-display font-mono text-primary">{forecast.mape}%</div>
            </div>
          </div>

          <div className="bg-surface p-6 border border-outline-variant flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-outline-variant pb-3">
              <h2 className="font-label text-label text-on-surface uppercase tracking-widest">
                Demand Projection & Confidence Band
              </h2>
              <span className="font-data-sm text-data-sm text-outline border border-outline/30 px-2 py-0.5 font-mono">
                {forecast.model_version}
              </span>
            </div>

            <div className="h-64 relative w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecast.daily_predictions || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={11} tickMargin={10} fontFamily="IBM Plex Mono" />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} fontFamily="IBM Plex Mono" width={40} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1c2023', borderColor: 'rgba(255,255,255,0.1)', fontFamily: 'IBM Plex Mono', fontSize: '12px' }}
                    itemStyle={{ color: '#cfc1de' }}
                  />
                  <Area type="monotone" dataKey="predicted" stroke="#cfc1de" fill="#cfc1de" fillOpacity={0.15} strokeWidth={2} />
                  <Area type="monotone" dataKey="lower_bound" stroke="none" fill="#7dd6cd" fillOpacity={0.05} />
                  <Area type="monotone" dataKey="upper_bound" stroke="none" fill="#7dd6cd" fillOpacity={0.05} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
