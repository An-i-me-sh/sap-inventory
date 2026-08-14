import React, { useState, useEffect } from 'react';
import { getIntegrationLogs } from '../api/sap';

export default function IntegrationLogsPage() {
  const [data, setData] = useState({ items: [], page: 1, page_size: 25, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    getIntegrationLogs({ page, page_size: 25 })
      .then(res => setData(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [page]);

  const totalPages = Math.ceil(data.total / data.page_size) || 1;

  return (
    <div className="flex-1 overflow-y-auto bg-background p-container-padding flex flex-col gap-4">
      <div className="bg-surface p-4 border border-outline-variant">
        <h1 className="font-display text-display text-on-surface">SAP Integration Audit Logs</h1>
        <p className="font-body-sm text-on-surface-variant">
          Complete security-sanitized request audit trail for all OData & REST calls between SAP and FastAPI.
        </p>
      </div>

      <div className="bg-surface border border-outline-variant overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-surface-container font-label text-label text-on-surface-variant uppercase tracking-widest">
              <th className="p-table-cell-padding font-normal border-b border-outline-variant">Timestamp</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant">Service</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant">Method</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant">Endpoint</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant text-center">Status Code</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant text-right">Latency</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant text-center">Outcome</th>
            </tr>
          </thead>
          <tbody className="font-data-sm text-data-sm text-on-surface">
            {loading ? (
              <tr><td colSpan="7" className="p-8 text-center text-on-surface-variant">Loading integration logs...</td></tr>
            ) : data.items.map((log) => (
              <tr key={log.log_id} className="hover:bg-surface-container-highest transition-colors border-b border-outline-variant/30">
                <td className="p-table-cell-padding border-b border-outline-variant font-mono">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="p-table-cell-padding border-b border-outline-variant font-mono text-secondary">{log.service}</td>
                <td className="p-table-cell-padding border-b border-outline-variant font-mono text-tertiary">{log.http_method}</td>
                <td className="p-table-cell-padding border-b border-outline-variant font-mono text-primary">{log.endpoint}</td>
                <td className="p-table-cell-padding border-b border-outline-variant text-center font-mono font-bold">
                  <span className={log.status_code === 200 ? 'text-primary' : 'text-error'}>{log.status_code}</span>
                </td>
                <td className="p-table-cell-padding border-b border-outline-variant text-right font-mono">{log.latency_ms} ms</td>
                <td className="p-table-cell-padding border-b border-outline-variant text-center">
                  <span className={`px-2 py-0.5 border font-label text-[10px] uppercase ${
                    log.success ? 'text-primary border-primary/40 bg-primary-container/20' : 'text-error border-error/40 bg-error-container/20'
                  }`}>
                    {log.success ? 'Success' : 'Failed'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-surface p-4 border border-outline-variant flex justify-between items-center font-data-sm text-data-sm text-on-surface-variant">
        <div>Showing page {data.page} of {totalPages} ({data.total} audit records)</div>
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
