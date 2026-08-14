import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInventoryList, exportInventoryCsvUrl } from '../api/inventory';
import StatusBadge from '../components/StatusBadge';

export default function InventoryPage() {
  const [data, setData] = useState({ items: [], page: 1, page_size: 25, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [plant, setPlant] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const fetchInventory = () => {
    setLoading(true);
    getInventoryList({
      page,
      page_size: 25,
      search: search || undefined,
      plant: plant || undefined,
      category: category || undefined,
      status: status || undefined
    })
      .then(res => setData(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInventory();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, plant, category, status, page]);

  const totalPages = Math.ceil(data.total / data.page_size) || 1;

  return (
    <div className="flex-1 overflow-y-auto bg-background p-container-padding flex flex-col gap-4">
      {/* HEADER ROW */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface p-4 border border-outline-variant">
        <div>
          <h1 className="font-display text-display text-on-surface">Technical Inventory Ledger</h1>
          <p className="font-body-sm text-on-surface-variant">
            Full inventory ledger records with stock status rules and coverage projections.
          </p>
        </div>
        <a
          href={exportInventoryCsvUrl}
          download="inventory_ledger.csv"
          className="flex items-center gap-2 bg-surface-container hover:bg-surface-container-highest text-primary font-label text-[11px] uppercase tracking-wider px-3 py-2 border border-outline-variant transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">download</span>
          Export CSV
        </a>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="bg-surface p-4 border border-outline-variant grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Search */}
        <div className="flex items-center bg-surface-container border border-outline-variant px-3 py-1.5">
          <span className="material-symbols-outlined text-outline text-[18px] mr-2">search</span>
          <input
            type="text"
            placeholder="Filter by SKU or description..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="bg-transparent text-on-surface font-data-sm text-data-sm w-full focus:outline-none"
          />
        </div>

        {/* Plant Filter */}
        <select
          value={plant}
          onChange={(e) => { setPlant(e.target.value); setPage(1); }}
          className="bg-surface-container border border-outline-variant text-on-surface font-data-sm text-data-sm px-3 py-1.5 focus:outline-none"
        >
          <option value="">All Plants (PL01, PL02, PL03)</option>
          <option value="PL01">PL01 - Main Assembly</option>
          <option value="PL02">PL02 - Component Hub</option>
          <option value="PL03">PL03 - Logistics Depot</option>
        </select>

        {/* Category Filter */}
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

        {/* Status Filter */}
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="bg-surface-container border border-outline-variant text-on-surface font-data-sm text-data-sm px-3 py-1.5 focus:outline-none"
        >
          <option value="">All Stock Statuses</option>
          <option value="CRITICAL">Critical (&lt; 50% Min)</option>
          <option value="LOW">Low (&lt; Min Stock)</option>
          <option value="HEALTHY">Healthy (Within Target)</option>
          <option value="OVERSTOCK">Overstock (&gt; Max Stock)</option>
        </select>
      </div>

      {/* HIGH DENSITY INVENTORY TABLE */}
      <div className="bg-surface border border-outline-variant overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-surface-container font-label text-label text-on-surface-variant uppercase tracking-widest">
              <th className="p-table-cell-padding font-normal border-b border-outline-variant">Material SKU</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant">Description</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant">Plant</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant text-right">Current Stock</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant text-right">Reserved</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant text-right">Incoming</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant text-center">Status</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant text-right">Coverage</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant text-right">Value (₹)</th>
            </tr>
          </thead>
          <tbody className="font-data-sm text-data-sm text-on-surface">
            {loading ? (
              <tr>
                <td colSpan="9" className="p-8 text-center text-on-surface-variant">
                  Loading inventory ledger items...
                </td>
              </tr>
            ) : data.items.length === 0 ? (
              <tr>
                <td colSpan="9" className="p-8 text-center text-on-surface-variant">
                  No materials match the active search and filter constraints.
                </td>
              </tr>
            ) : (
              data.items.map((inv) => (
                <tr
                  key={inv.inventory_id}
                  onClick={() => navigate(`/materials/${inv.material_id}`)}
                  className="hover:bg-surface-container-highest transition-colors cursor-pointer group"
                >
                  <td className="p-table-cell-padding border-b border-outline-variant text-primary font-mono group-hover:underline">
                    {inv.material_id}
                  </td>
                  <td className="p-table-cell-padding border-b border-outline-variant text-on-surface-variant">
                    {inv.material?.description || 'N/A'}
                  </td>
                  <td className="p-table-cell-padding border-b border-outline-variant font-mono">
                    {inv.plant} / {inv.storage_location}
                  </td>
                  <td className="p-table-cell-padding border-b border-outline-variant text-right font-mono font-bold">
                    {inv.current_stock?.toLocaleString()}
                  </td>
                  <td className="p-table-cell-padding border-b border-outline-variant text-right font-mono text-outline">
                    {inv.reserved_stock?.toLocaleString()}
                  </td>
                  <td className="p-table-cell-padding border-b border-outline-variant text-right font-mono text-secondary">
                    {inv.incoming_stock?.toLocaleString()}
                  </td>
                  <td className="p-table-cell-padding border-b border-outline-variant text-center">
                    <StatusBadge status={inv.stock_status} />
                  </td>
                  <td className="p-table-cell-padding border-b border-outline-variant text-right font-mono">
                    {inv.stock_coverage_days}d
                  </td>
                  <td className="p-table-cell-padding border-b border-outline-variant text-right font-mono">
                    ₹{inv.inventory_value?.toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION CONTROLS */}
      <div className="bg-surface p-4 border border-outline-variant flex justify-between items-center font-data-sm text-data-sm text-on-surface-variant">
        <div>
          Showing page {data.page} of {totalPages} ({data.total} total inventory records)
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 bg-surface-container border border-outline-variant text-on-surface disabled:opacity-40 hover:bg-surface-container-highest transition-colors"
          >
            ← Previous
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 bg-surface-container border border-outline-variant text-on-surface disabled:opacity-40 hover:bg-surface-container-highest transition-colors"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
