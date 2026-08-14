import React, { useState, useEffect } from 'react';
import { getAnalyticsData } from '../api/analytics';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalyticsData()
      .then(res => setData(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="p-8 text-center font-data-sm text-on-surface-variant">
        Computing inventory valuation & turnover metrics...
      </div>
    );
  }

  const { category_valuation, plant_distribution, abc_breakdown, turnover_ratio, average_holding_days } = data;

  return (
    <div className="flex-1 overflow-y-auto bg-background p-container-padding flex flex-col gap-6">
      <div className="bg-surface p-6 border border-outline-variant">
        <h1 className="font-display text-display text-on-surface">Inventory Valuation & Analytics</h1>
        <p className="font-body-sm text-on-surface-variant">
          Comprehensive inventory portfolio breakdown across SAP plant locations, material categories, and ABC valuation tiers.
        </p>
      </div>

      {/* SUMMARY KPI ROW */}
      <div className="bg-surface border border-outline-variant grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-outline-variant">
        <div className="p-6">
          <div className="font-label text-label text-on-surface-variant uppercase mb-1">Inventory Turnover Ratio</div>
          <div className="font-display text-display font-mono text-primary">{turnover_ratio}x</div>
          <p className="font-body-sm text-[12px] text-on-surface-variant mt-1">Annualized sales velocity vs holding stock value.</p>
        </div>
        <div className="p-6">
          <div className="font-label text-label text-on-surface-variant uppercase mb-1">Average Days on Hand</div>
          <div className="font-display text-display font-mono text-secondary">{average_holding_days} Days</div>
          <p className="font-body-sm text-[12px] text-on-surface-variant mt-1">Average lead holding period per SKU.</p>
        </div>
      </div>

      {/* CATEGORY & PLANT TABLES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-element-gap">
        {/* Category Valuation Table */}
        <div className="bg-surface border border-outline-variant p-6 flex flex-col gap-4">
          <h2 className="font-label text-label text-on-surface uppercase tracking-widest border-b border-outline-variant pb-2">
            Valuation by Category
          </h2>
          <table className="w-full text-left border-collapse whitespace-nowrap font-data-sm text-data-sm">
            <thead>
              <tr className="bg-surface-container font-label text-on-surface-variant uppercase">
                <th className="p-2 border-b border-outline-variant">Category</th>
                <th className="p-2 border-b border-outline-variant text-right">SKU Count</th>
                <th className="p-2 border-b border-outline-variant text-right">Valuation (₹)</th>
              </tr>
            </thead>
            <tbody>
              {category_valuation.map((item) => (
                <tr key={item.category} className="hover:bg-surface-container-highest border-b border-outline-variant/30">
                  <td className="p-2 font-body-sm text-on-surface">{item.category}</td>
                  <td className="p-2 text-right font-mono">{item.count}</td>
                  <td className="p-2 text-right font-mono text-primary">₹{item.valuation?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Plant Distribution Table */}
        <div className="bg-surface border border-outline-variant p-6 flex flex-col gap-4">
          <h2 className="font-label text-label text-on-surface uppercase tracking-widest border-b border-outline-variant pb-2">
            Distribution by SAP Plant
          </h2>
          <table className="w-full text-left border-collapse whitespace-nowrap font-data-sm text-data-sm">
            <thead>
              <tr className="bg-surface-container font-label text-on-surface-variant uppercase">
                <th className="p-2 border-b border-outline-variant">Plant Code</th>
                <th className="p-2 border-b border-outline-variant text-right">Total Units</th>
                <th className="p-2 border-b border-outline-variant text-right">Total Value (₹)</th>
              </tr>
            </thead>
            <tbody>
              {plant_distribution.map((p) => (
                <tr key={p.plant} className="hover:bg-surface-container-highest border-b border-outline-variant/30">
                  <td className="p-2 font-mono font-bold text-secondary">{p.plant}</td>
                  <td className="p-2 text-right font-mono">{p.units?.toLocaleString()}</td>
                  <td className="p-2 text-right font-mono text-primary">₹{p.valuation?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
