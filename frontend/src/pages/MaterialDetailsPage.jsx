import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getMaterialDetail } from '../api/materials';
import { generateRecommendation, getForecast } from '../api/forecast';
import StatusBadge from '../components/StatusBadge';
import MetricBlock from '../components/MetricBlock';

export default function MaterialDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recState, setRecState] = useState(null);
  const [generatingRec, setGeneratingRec] = useState(false);
  const [refreshingForecast, setRefreshingForecast] = useState(false);

  const fetchDetail = () => {
    setLoading(true);
    getMaterialDetail(id)
      .then(res => {
        setData(res);
        if (res.latest_recommendation) {
          setRecState({
            recommendation: res.latest_recommendation,
            ai_explanation: res.latest_recommendation.reasoning
          });
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleGenerateRecommendation = () => {
    setGeneratingRec(true);
    generateRecommendation(id)
      .then(res => setRecState(res))
      .finally(() => { setGeneratingRec(false); fetchDetail(); });
  };

  const handleRefreshForecast = () => {
    setRefreshingForecast(true);
    getForecast(id, 30)
      .then(() => fetchDetail())
      .finally(() => setRefreshingForecast(false));
  };

  if (loading || !data) {
    return (
      <div className="p-8 text-center font-data-sm text-on-surface-variant">
        Retrieving material master & analytics for {id}...
      </div>
    );
  }

  const { material, inventory, sales_history, latest_forecast, alerts } = data;

  return (
    <div className="flex-1 overflow-y-auto bg-background p-container-padding flex flex-col gap-6">
      {/* BREADCRUMB & HEADER */}
      <div className="bg-surface p-6 border border-outline-variant flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <button
            onClick={() => navigate('/inventory')}
            className="font-label text-[11px] uppercase tracking-wider text-primary hover:underline mb-2 block"
          >
            ← Back to Inventory Ledger
          </button>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-display text-on-surface font-mono">{material.material_id}</h1>
            <span className="font-label text-label text-outline border border-outline/30 px-2 py-0.5 uppercase">
              {material.category}
            </span>
            <span className="font-label text-label text-tertiary border border-tertiary/30 px-2 py-0.5 uppercase">
              Class {material.abc_classification}
            </span>
          </div>
          <p className="font-body-sm text-on-surface-variant mt-1">{material.description}</p>
        </div>

        <button
          onClick={handleGenerateRecommendation}
          disabled={generatingRec}
          className="flex items-center gap-2 bg-primary hover:bg-primary-container text-on-primary font-label text-[11px] uppercase tracking-wider px-4 py-2.5 transition-colors disabled:opacity-50"
        >
          <span className={`material-symbols-outlined text-[18px] ${generatingRec ? 'animate-spin' : ''}`}>
            calculate
          </span>
          <span>{generatingRec ? 'Calculating Engine...' : 'Create Purchase Recommendation'}</span>
        </button>
      </div>

      {/* METRICS ROW */}
      <div className="bg-surface border border-outline-variant flex flex-col md:flex-row w-full">
        <MetricBlock label="Current Stock" value={inventory?.current_stock?.toLocaleString() || 0} unit={material.unit} />
        <MetricBlock label="Min Target" value={material.min_stock?.toLocaleString()} unit={material.unit} />
        <MetricBlock label="Max Target" value={material.max_stock?.toLocaleString()} unit={material.unit} />
        <MetricBlock label="Unit Valuation" value={`₹${material.unit_price?.toFixed(2)}`} />
        <MetricBlock label="Lead Time" value={material.lead_time_days} unit="Days" />
      </div>

      {/* REPLENISHMENT ENGINE & AI EXPLANATION BOX */}
      {recState && (
        <div className="bg-surface p-6 border-2 border-primary/40 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-outline-variant pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">auto_awesome</span>
              <h2 className="font-headline text-headline text-on-surface">
                Deterministic Replenishment Recommendation
              </h2>
            </div>
            <span className="font-data-sm text-data-sm text-primary font-mono font-bold border border-primary/30 px-2 py-0.5">
              Recommended Order: {recState.recommendation?.recommended_order_qty} {material.unit}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-data-sm text-data-sm text-on-surface bg-surface-container p-4 border border-outline-variant">
            <div>Available Stock: <span className="font-bold text-primary">{recState.recommendation?.available_stock}</span></div>
            <div>Required Stock: <span className="font-bold text-secondary">{recState.recommendation?.required_stock}</span></div>
            <div>Predicted 30D Demand: <span className="font-bold text-tertiary">{recState.recommendation?.predicted_demand}</span></div>
            <div>Safety Stock Target: <span className="font-bold text-on-surface">{recState.recommendation?.safety_stock}</span></div>
          </div>

          <div className="bg-primary-container/10 p-4 border border-primary/20 text-body-sm text-on-surface font-body-sm">
            <div className="font-label text-label text-primary uppercase tracking-widest mb-1">
              Engine Audit Trail & AI Explanation
            </div>
            <p className="leading-relaxed">{recState.ai_explanation || recState.recommendation?.reasoning}</p>
          </div>
        </div>
      )}

      {/* FORECAST & SALES HISTORY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-element-gap">
        {/* Demand Forecast Chart Card */}
        <div className="col-span-1 md:col-span-7 border border-outline-variant bg-surface p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-outline-variant pb-3">
            <h3 className="font-label text-label text-on-surface uppercase tracking-widest">
              ML Demand Projections (30D)
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefreshForecast}
                disabled={refreshingForecast}
                title="Re-run ML forecast"
                className="flex items-center gap-1 border border-outline/30 px-2 py-0.5 text-outline hover:text-on-surface hover:border-outline transition-colors disabled:opacity-40"
              >
                <span className={`material-symbols-outlined text-[14px] ${refreshingForecast ? 'animate-spin' : ''}`}>refresh</span>
                <span className="font-label text-[10px] uppercase tracking-wider">{refreshingForecast ? 'Running...' : 'Refresh'}</span>
              </button>
              <span className="font-data-sm text-data-sm text-outline border border-outline/30 px-2 py-0.5 font-mono">
                Model: {latest_forecast?.model_version || 'RandomForestRegressor-v1.0'}
              </span>
            </div>
          </div>
          <div className="font-data-sm text-data-sm flex justify-between text-on-surface-variant bg-surface-container p-3 border border-outline-variant">
            <div>Predicted Demand: <span className="text-primary font-bold">
              {latest_forecast?.predicted_demand !== undefined && latest_forecast?.predicted_demand !== null
                ? `${latest_forecast.predicted_demand} units`
                : 'Calculating...'}
            </span></div>
            <div>Confidence Range: <span className="font-mono">
              {latest_forecast?.confidence_lower != null && latest_forecast?.confidence_upper != null
                ? `${latest_forecast.confidence_lower} – ${latest_forecast.confidence_upper}`
                : '—'}
            </span></div>
          </div>
          {latest_forecast?.model_version === 'NoData-Baseline' && (
            <div className="flex items-center gap-2 px-3 py-2 bg-surface-container border border-outline-variant/50 text-outline font-data-sm text-[11px]">
              <span className="material-symbols-outlined text-[14px]">info</span>
              No sales history found for this material. Forecast shows zero baseline — add sales records to enable ML predictions.
            </div>
          )}
          <div className="h-44 relative border border-outline-variant/30 p-2 w-full mt-2">
            {latest_forecast?.daily_predictions && latest_forecast.daily_predictions.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={latest_forecast.daily_predictions} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={10} tickMargin={5} fontFamily="IBM Plex Mono" />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} fontFamily="IBM Plex Mono" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1c2023', borderColor: 'rgba(255,255,255,0.1)', fontFamily: 'IBM Plex Mono', fontSize: '11px' }}
                    itemStyle={{ color: '#cfc1de' }}
                  />
                  <Area type="monotone" dataKey="predicted" stroke="#cfc1de" fill="#cfc1de" fillOpacity={0.2} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-[32px] text-outline">query_stats</span>
                <span className="font-label text-label uppercase tracking-widest">No projection data</span>
                <span className="font-data-sm text-data-sm text-center text-outline">
                  {latest_forecast
                    ? 'Daily predictions unavailable. Re-generate to rebuild forecast.'
                    : 'No forecast found. Click "Create Purchase Recommendation" to trigger ML engine.'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Recent Sales History Table */}
        <div className="col-span-1 md:col-span-5 border border-outline-variant bg-surface p-6 flex flex-col gap-4 overflow-x-auto">
          <div className="flex justify-between items-center border-b border-outline-variant pb-3">
            <h3 className="font-label text-label text-on-surface uppercase tracking-widest">
              Recent Sales Orders
            </h3>
            <span className="font-data-sm text-data-sm text-on-surface-variant">
              {sales_history.length} Transactions
            </span>
          </div>
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-surface-container font-label text-label text-on-surface-variant uppercase tracking-widest">
                <th className="p-2 border-b border-outline-variant">Date</th>
                <th className="p-2 border-b border-outline-variant text-right">Qty</th>
                <th className="p-2 border-b border-outline-variant text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="font-data-sm text-data-sm text-on-surface">
              {sales_history.slice(0, 7).map((s) => (
                <tr key={s.sale_id} className="hover:bg-surface-container-highest border-b border-outline-variant/30">
                  <td className="p-2 font-mono">{new Date(s.sale_date).toLocaleDateString()}</td>
                  <td className="p-2 text-right font-mono font-bold text-primary">{s.quantity}</td>
                  <td className="p-2 text-right font-mono">₹{s.total_amount?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
