import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getDashboardData, triggerSync } from '../api/sap';
import MetricBlock from '../components/MetricBlock';
import StatusBadge from '../components/StatusBadge';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const navigate = useNavigate();

  const fetchDashboard = () => {
    setLoading(true);
    getDashboardData()
      .then(res => setData(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleManualSync = () => {
    setSyncing(true);
    triggerSync()
      .then(() => fetchDashboard())
      .finally(() => setSyncing(false));
  };

  if (loading || !data) {
    return (
      <div className="p-8 text-center font-data-sm text-on-surface-variant">
        Loading SAP Inventory Platform Dashboard...
      </div>
    );
  }

  const { metrics, sap_status, last_sync_time, action_required, fast_moving_materials, inventory_health_trend, demand_forecast_trend } = data;

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      {/* HEADER SECTION */}
      <div className="px-container-padding py-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-surface border-b border-outline-variant">
        <div>
          <h1 className="font-display text-display text-on-surface mb-1">Inventory Overview</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Current inventory position, stock health, and operational demand alerts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-primary font-data-sm text-data-sm bg-primary-container/10 px-3 py-1.5 rounded-sm border border-primary/20">
            <span className="material-symbols-outlined text-[14px]">cloud_sync</span>
            <span>{sap_status} | Last sync {last_sync_time}</span>
          </div>
          <button
            onClick={handleManualSync}
            disabled={syncing}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-container text-on-primary font-label text-[11px] uppercase tracking-wider px-3 py-1.5 transition-colors disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[16px] ${syncing ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        </div>
      </div>

      {/* METRICS ROW (Utilitarian Blocks) */}
      <div className="bg-surface border-b border-outline-variant flex flex-col md:flex-row w-full">
        <MetricBlock
          label="Current Inventory"
          value={metrics.current_inventory_units?.toLocaleString()}
          unit="units"
        />
        <MetricBlock
          label="Total Value"
          value={`₹${(metrics.total_inventory_value / 10000000).toFixed(2)}`}
          unit="Cr"
        />
        <MetricBlock
          label="Low Stock Alerts"
          value={metrics.low_stock_alerts_count}
          isAlert={metrics.low_stock_alerts_count > 0}
        />
        <MetricBlock
          label="Est. Replenishment"
          value={`₹${(metrics.estimated_replenishment_cost / 10000000).toFixed(2)}`}
          unit="Cr"
        />
      </div>

      {/* COMPACT GRID LAYOUT */}
      <div className="p-container-padding grid grid-cols-1 md:grid-cols-12 gap-element-gap">
        {/* INVENTORY HEALTH CHART */}
        <div className="col-span-1 md:col-span-8 border border-outline-variant bg-surface flex flex-col">
          <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container">
            <h2 className="font-label text-label text-on-surface uppercase tracking-widest">
              Inventory Health (30D)
            </h2>
            <span className="material-symbols-outlined text-outline text-[16px]">show_chart</span>
          </div>
          <div className="p-4 flex-1 min-h-[220px] relative w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={inventory_health_trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={11} tickMargin={10} fontFamily="IBM Plex Mono" />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} fontFamily="IBM Plex Mono" width={40} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1c2023', borderColor: 'rgba(255,255,255,0.1)', fontFamily: 'IBM Plex Mono', fontSize: '12px' }}
                  itemStyle={{ color: '#7dd6cd' }}
                />
                <Line type="monotone" dataKey="value" stroke="#7dd6cd" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* STOCK ALERTS LIST */}
        <div className="col-span-1 md:col-span-4 border border-outline-variant bg-surface flex flex-col">
          <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container">
            <h2 className="font-label text-label text-on-surface uppercase tracking-widest">
              Action Required
            </h2>
            <span className="font-data-sm text-data-sm text-on-surface-variant">
              {action_required.length} Items
            </span>
          </div>
          <div className="flex flex-col flex-1">
            {action_required.length === 0 ? (
              <div className="p-4 text-center font-data-sm text-on-surface-variant">
                No immediate critical inventory actions required.
              </div>
            ) : (
              action_required.map((item) => (
                <div
                  key={item.alert_id}
                  onClick={() => navigate(item.material_id !== 'SYSTEM' ? `/materials/${item.material_id}` : '/alerts')}
                  className="px-4 py-3 border-b border-outline-variant flex justify-between items-center bg-error/5 hover:bg-error/10 transition-colors cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="font-data-lg text-data-lg text-on-surface font-mono">{item.material_id}</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant truncate max-w-[180px]">
                      {item.description}
                    </span>
                  </div>
                  <span className="font-label text-label text-error uppercase border border-error/30 px-2 py-0.5 rounded-sm">
                    {item.severity}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* DEMAND FORECAST AREA CHART */}
        <div className="col-span-1 md:col-span-12 border border-outline-variant bg-surface flex flex-col mt-4">
          <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container">
            <h2 className="font-label text-label text-on-surface uppercase tracking-widest">
              Demand Forecast (90D Area)
            </h2>
            <span className="font-data-sm text-data-sm text-outline border border-outline/30 px-2 py-0.5">
              Confidence Range: ±8%
            </span>
          </div>
          <div className="p-4 h-56 relative w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={demand_forecast_trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={11} tickMargin={10} fontFamily="IBM Plex Mono" />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} fontFamily="IBM Plex Mono" width={40} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1c2023', borderColor: 'rgba(255,255,255,0.1)', fontFamily: 'IBM Plex Mono', fontSize: '12px' }}
                  itemStyle={{ color: '#cfc1de' }}
                />
                <Area type="monotone" dataKey="predicted" stroke="#cfc1de" fill="#cfc1de" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* FAST MOVING MATERIALS TABLE */}
        <div className="col-span-1 md:col-span-12 border border-outline-variant bg-surface mt-4 overflow-x-auto">
          <div className="p-4 border-b border-outline-variant bg-surface-container flex justify-between items-center">
            <h2 className="font-label text-label text-on-surface uppercase tracking-widest">
              Fast Moving Materials
            </h2>
            <button
              onClick={() => navigate('/materials')}
              className="font-label text-[11px] uppercase tracking-wider text-primary hover:underline"
            >
              View Full Master Catalog →
            </button>
          </div>
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-surface-container font-label text-label text-on-surface-variant uppercase tracking-widest">
                <th className="p-table-cell-padding font-normal border-b border-outline-variant w-1/4">Material ID</th>
                <th className="p-table-cell-padding font-normal border-b border-outline-variant w-1/4">Description</th>
                <th className="p-table-cell-padding font-normal border-b border-outline-variant text-right w-1/6">30D Sales Vol.</th>
                <th className="p-table-cell-padding font-normal border-b border-outline-variant text-right w-1/6">Current Stock</th>
                <th className="p-table-cell-padding font-normal border-b border-outline-variant text-right w-1/6">Coverage</th>
              </tr>
            </thead>
            <tbody className="font-data-sm text-data-sm text-on-surface">
              {fast_moving_materials.map((mat) => (
                <tr
                  key={mat.material_id}
                  onClick={() => navigate(`/materials/${mat.material_id}`)}
                  className="hover:bg-surface-container-highest transition-colors cursor-pointer group"
                >
                  <td className="p-table-cell-padding border-b border-outline-variant text-primary font-mono group-hover:underline">
                    {mat.material_id}
                  </td>
                  <td className="p-table-cell-padding border-b border-outline-variant text-on-surface-variant">
                    {mat.description}
                  </td>
                  <td className="p-table-cell-padding border-b border-outline-variant text-right font-mono">
                    {mat.sales_30d?.toLocaleString()}
                  </td>
                  <td className="p-table-cell-padding border-b border-outline-variant text-right font-mono text-secondary">
                    {mat.current_stock?.toLocaleString()}
                  </td>
                  <td className="p-table-cell-padding border-b border-outline-variant text-right font-mono text-outline">
                    {mat.coverage_days} Days
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
