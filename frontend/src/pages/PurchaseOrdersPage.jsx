import React, { useState, useEffect } from 'react';
import { getPurchaseOrders, exportPurchaseOrdersCsvUrl } from '../api/purchaseOrders';

export default function PurchaseOrdersPage() {
  const [data, setData] = useState({ items: [], page: 1, page_size: 25, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [delivStatus, setDelivStatus] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    getPurchaseOrders({
      page,
      page_size: 25,
      search: search || undefined,
      status: status || undefined,
      delivery_status: delivStatus || undefined
    })
      .then(res => setData(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [search, status, delivStatus, page]);

  const totalPages = Math.ceil(data.total / data.page_size) || 1;

  return (
    <div className="flex-1 overflow-y-auto bg-background p-container-padding flex flex-col gap-4">
      <div className="flex justify-between items-center bg-surface p-4 border border-outline-variant">
        <div>
          <h1 className="font-display text-display text-on-surface">SAP Purchase Orders (Procurement)</h1>
          <p className="font-body-sm text-on-surface-variant">
            Procurement open orders, expected delivery dates, vendor allocations, and delay tracking.
          </p>
        </div>
        <a
          href={exportPurchaseOrdersCsvUrl}
          download="purchase_orders.csv"
          className="flex items-center gap-2 bg-surface-container hover:bg-surface-container-highest text-primary font-label text-[11px] uppercase tracking-wider px-3 py-2 border border-outline-variant transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">download</span>
          Export CSV
        </a>
      </div>

      <div className="bg-surface p-4 border border-outline-variant grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex items-center bg-surface-container border border-outline-variant px-3 py-1.5">
          <span className="material-symbols-outlined text-outline text-[18px] mr-2">search</span>
          <input
            type="text"
            placeholder="Search PO #, Material, or Vendor..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="bg-transparent text-on-surface font-data-sm text-data-sm w-full focus:outline-none"
          />
        </div>

        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="bg-surface-container border border-outline-variant text-on-surface font-data-sm text-data-sm px-3 py-1.5 focus:outline-none"
        >
          <option value="">All PO Statuses</option>
          <option value="OPEN">OPEN</option>
          <option value="IN_TRANSIT">IN TRANSIT</option>
          <option value="DELIVERED">DELIVERED</option>
        </select>

        <select
          value={delivStatus}
          onChange={(e) => { setDelivStatus(e.target.value); setPage(1); }}
          className="bg-surface-container border border-outline-variant text-on-surface font-data-sm text-data-sm px-3 py-1.5 focus:outline-none"
        >
          <option value="">All Delivery Schedule States</option>
          <option value="ON_TIME">ON TIME</option>
          <option value="DELAYED">DELAYED</option>
        </select>
      </div>

      <div className="bg-surface border border-outline-variant overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-surface-container font-label text-label text-on-surface-variant uppercase tracking-widest">
              <th className="p-table-cell-padding font-normal border-b border-outline-variant">PO Number</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant">Material</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant">Vendor</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant">Order Date</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant">Expected Delivery</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant text-right">Quantity</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant text-right">Total Value (₹)</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant text-center">Status</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant text-center">Schedule</th>
            </tr>
          </thead>
          <tbody className="font-data-sm text-data-sm text-on-surface">
            {loading ? (
              <tr><td colSpan="9" className="p-8 text-center text-on-surface-variant">Loading PO records...</td></tr>
            ) : data.items.map((po) => (
              <tr key={po.po_number} className="hover:bg-surface-container-highest transition-colors border-b border-outline-variant/30">
                <td className="p-table-cell-padding border-b border-outline-variant text-secondary font-mono font-bold">
                  {po.po_number}
                </td>
                <td className="p-table-cell-padding border-b border-outline-variant">
                  <div className="font-mono text-primary">{po.material_id}</div>
                  <div className="text-[11px] text-on-surface-variant">{po.material_description}</div>
                </td>
                <td className="p-table-cell-padding border-b border-outline-variant">
                  <div className="font-mono text-tertiary">{po.vendor_id}</div>
                  <div className="text-[11px] text-on-surface-variant">{po.vendor_name}</div>
                </td>
                <td className="p-table-cell-padding border-b border-outline-variant font-mono">
                  {new Date(po.order_date).toLocaleDateString()}
                </td>
                <td className="p-table-cell-padding border-b border-outline-variant font-mono">
                  {new Date(po.expected_delivery).toLocaleDateString()}
                </td>
                <td className="p-table-cell-padding border-b border-outline-variant text-right font-mono font-bold">
                  {po.quantity?.toLocaleString()}
                </td>
                <td className="p-table-cell-padding border-b border-outline-variant text-right font-mono">
                  ₹{po.total_value?.toLocaleString()}
                </td>
                <td className="p-table-cell-padding border-b border-outline-variant text-center">
                  <span className="font-label text-[10px] uppercase border border-outline px-1.5 py-0.5">
                    {po.status}
                  </span>
                </td>
                <td className="p-table-cell-padding border-b border-outline-variant text-center">
                  <span className={`font-label text-[10px] uppercase border px-1.5 py-0.5 ${
                    po.delivery_status === 'DELAYED' ? 'text-error border-error/40 bg-error-container/20' : 'text-primary border-primary/40 bg-primary-container/20'
                  }`}>
                    {po.delivery_status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-surface p-4 border border-outline-variant flex justify-between items-center font-data-sm text-data-sm text-on-surface-variant">
        <div>Showing page {data.page} of {totalPages} ({data.total} purchase orders)</div>
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
