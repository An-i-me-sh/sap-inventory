import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMaterialsList } from '../api/materials';

export default function MaterialMasterPage() {
  const [data, setData] = useState({ items: [], page: 1, page_size: 25, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [abc, setAbc] = useState('');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getMaterialsList({
      page,
      page_size: 25,
      search: search || undefined,
      category: category || undefined,
      abc_classification: abc || undefined
    })
      .then(res => setData(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [search, category, abc, page]);

  const totalPages = Math.ceil(data.total / data.page_size) || 1;

  return (
    <div className="flex-1 overflow-y-auto bg-background p-container-padding flex flex-col gap-4">
      <div className="bg-surface p-4 border border-outline-variant">
        <h1 className="font-display text-display text-on-surface">Material Master Catalog</h1>
        <p className="font-body-sm text-on-surface-variant">
          SAP S/4HANA Material Master data records, pricing valuation, ABC classifications, and reorder points.
        </p>
      </div>

      <div className="bg-surface p-4 border border-outline-variant grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex items-center bg-surface-container border border-outline-variant px-3 py-1.5">
          <span className="material-symbols-outlined text-outline text-[18px] mr-2">search</span>
          <input
            type="text"
            placeholder="Search material SKU or name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="bg-transparent text-on-surface font-data-sm text-data-sm w-full focus:outline-none"
          />
        </div>

        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="bg-surface-container border border-outline-variant text-on-surface font-data-sm text-data-sm px-3 py-1.5 focus:outline-none"
        >
          <option value="">All Categories</option>
          <option value="Engine Components">Engine Components</option>
          <option value="Electrical Systems">Electrical Systems</option>
          <option value="Hydraulics">Hydraulics</option>
          <option value="Fasteners & Seals">Fasteners & Seals</option>
          <option value="Lubricants & Fluids">Lubricants & Fluids</option>
          <option value="Transmission">Transmission</option>
        </select>

        <select
          value={abc}
          onChange={(e) => { setAbc(e.target.value); setPage(1); }}
          className="bg-surface-container border border-outline-variant text-on-surface font-data-sm text-data-sm px-3 py-1.5 focus:outline-none"
        >
          <option value="">All ABC Classes</option>
          <option value="A">Class A (High Value)</option>
          <option value="B">Class B (Medium Value)</option>
          <option value="C">Class C (Low Value)</option>
        </select>
      </div>

      <div className="bg-surface border border-outline-variant overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-surface-container font-label text-label text-on-surface-variant uppercase tracking-widest">
              <th className="p-table-cell-padding font-normal border-b border-outline-variant">Material ID</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant">Description</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant">Plant</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant">Category</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant text-center">ABC</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant text-right">Lead Time</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant text-right">Unit Price (₹)</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant text-right">Min Stock</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant text-right">Max Stock</th>
            </tr>
          </thead>
          <tbody className="font-data-sm text-data-sm text-on-surface">
            {loading ? (
              <tr>
                <td colSpan="9" className="p-8 text-center text-on-surface-variant">Loading materials...</td>
              </tr>
            ) : data.items.map((m) => (
              <tr
                key={m.material_id}
                onClick={() => navigate(`/materials/${m.material_id}`)}
                className="hover:bg-surface-container-highest transition-colors cursor-pointer group"
              >
                <td className="p-table-cell-padding border-b border-outline-variant text-primary font-mono group-hover:underline">
                  {m.material_id}
                </td>
                <td className="p-table-cell-padding border-b border-outline-variant text-on-surface-variant">
                  {m.description}
                </td>
                <td className="p-table-cell-padding border-b border-outline-variant font-mono">{m.plant}</td>
                <td className="p-table-cell-padding border-b border-outline-variant">{m.category}</td>
                <td className="p-table-cell-padding border-b border-outline-variant text-center font-mono font-bold text-tertiary">
                  {m.abc_classification}
                </td>
                <td className="p-table-cell-padding border-b border-outline-variant text-right font-mono">{m.lead_time_days}d</td>
                <td className="p-table-cell-padding border-b border-outline-variant text-right font-mono">₹{m.unit_price?.toFixed(2)}</td>
                <td className="p-table-cell-padding border-b border-outline-variant text-right font-mono">{m.min_stock}</td>
                <td className="p-table-cell-padding border-b border-outline-variant text-right font-mono">{m.max_stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-surface p-4 border border-outline-variant flex justify-between items-center font-data-sm text-data-sm text-on-surface-variant">
        <div>Showing page {data.page} of {totalPages} ({data.total} materials)</div>
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
