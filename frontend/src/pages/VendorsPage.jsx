import React, { useState, useEffect } from 'react';
import { getVendorsList, exportVendorsCsvUrl } from '../api/vendors';

export default function VendorsPage() {
  const [data, setData] = useState({ items: [], page: 1, page_size: 25, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    getVendorsList({
      page,
      page_size: 25,
      search: search || undefined,
      country: country || undefined
    })
      .then(res => setData(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [search, country, page]);

  const totalPages = Math.ceil(data.total / data.page_size) || 1;

  return (
    <div className="flex-1 overflow-y-auto bg-background p-container-padding flex flex-col gap-4">
      <div className="flex justify-between items-center bg-surface p-4 border border-outline-variant">
        <div>
          <h1 className="font-display text-display text-on-surface">SAP Vendors & Performance Metrics</h1>
          <p className="font-body-sm text-on-surface-variant">
            Supplier evaluations, on-time delivery percentages, average delays, and calculated vendor risk scores.
          </p>
        </div>
        <a
          href={exportVendorsCsvUrl}
          download="vendors.csv"
          className="flex items-center gap-2 bg-surface-container hover:bg-surface-container-highest text-primary font-label text-[11px] uppercase tracking-wider px-3 py-2 border border-outline-variant transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">download</span>
          Export CSV
        </a>
      </div>

      <div className="bg-surface p-4 border border-outline-variant grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex items-center bg-surface-container border border-outline-variant px-3 py-1.5">
          <span className="material-symbols-outlined text-outline text-[18px] mr-2">search</span>
          <input
            type="text"
            placeholder="Search vendor name, ID, or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="bg-transparent text-on-surface font-data-sm text-data-sm w-full focus:outline-none"
          />
        </div>

        <select
          value={country}
          onChange={(e) => { setCountry(e.target.value); setPage(1); }}
          className="bg-surface-container border border-outline-variant text-on-surface font-data-sm text-data-sm px-3 py-1.5 focus:outline-none"
        >
          <option value="">All Vendor Countries</option>
          <option value="US">US - United States</option>
          <option value="DE">DE - Germany</option>
          <option value="IN">IN - India</option>
          <option value="JP">JP - Japan</option>
          <option value="GB">GB - United Kingdom</option>
        </select>
      </div>

      <div className="bg-surface border border-outline-variant overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-surface-container font-label text-label text-on-surface-variant uppercase tracking-widest">
              <th className="p-table-cell-padding font-normal border-b border-outline-variant">Vendor ID</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant">Vendor Name</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant">Country</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant text-center">Rating</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant text-right">On-Time %</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant text-right">Avg Delay</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant text-right">Total Purchase (₹)</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant text-right">Risk Score</th>
            </tr>
          </thead>
          <tbody className="font-data-sm text-data-sm text-on-surface">
            {loading ? (
              <tr><td colSpan="8" className="p-8 text-center text-on-surface-variant">Loading vendors...</td></tr>
            ) : data.items.map((v) => (
              <tr key={v.vendor_id} className="hover:bg-surface-container-highest transition-colors border-b border-outline-variant/30">
                <td className="p-table-cell-padding border-b border-outline-variant text-tertiary font-mono font-bold">
                  {v.vendor_id}
                </td>
                <td className="p-table-cell-padding border-b border-outline-variant font-body-sm text-on-surface">
                  {v.name}
                  <div className="text-[11px] text-on-surface-variant">{v.contact_email}</div>
                </td>
                <td className="p-table-cell-padding border-b border-outline-variant font-mono">{v.country}</td>
                <td className="p-table-cell-padding border-b border-outline-variant text-center font-mono text-primary">
                  {v.rating}★
                </td>
                <td className="p-table-cell-padding border-b border-outline-variant text-right font-mono font-bold text-primary">
                  {v.on_time_delivery_pct}%
                </td>
                <td className="p-table-cell-padding border-b border-outline-variant text-right font-mono text-outline">
                  {v.avg_delay_days}d
                </td>
                <td className="p-table-cell-padding border-b border-outline-variant text-right font-mono">
                  ₹{v.total_purchase_val?.toLocaleString()}
                </td>
                <td className="p-table-cell-padding border-b border-outline-variant text-right font-mono">
                  <span className={`px-2 py-0.5 border ${
                    v.risk_score > 30 ? 'text-error border-error/40 bg-error-container/20' : 'text-primary border-primary/40'
                  }`}>
                    {v.risk_score}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-surface p-4 border border-outline-variant flex justify-between items-center font-data-sm text-data-sm text-on-surface-variant">
        <div>Showing page {data.page} of {totalPages} ({data.total} vendors)</div>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1 bg-surface-container border border-outline-variant disabled:opacity-40 hover:bg-surface-container-highest">
            ← Prev
          </button>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1 bg-surface-container border border-outline-variant disabled:opacity-40 hover:bg-surface-container-highest">
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
