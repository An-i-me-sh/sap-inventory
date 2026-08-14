import React, { useState, useEffect } from 'react';
import { getSyncJobs } from '../api/sap';

export default function SyncMonitorPage() {
  const [data, setData] = useState({ items: [], page: 1, page_size: 25, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    getSyncJobs({ page, page_size: 25 })
      .then(res => setData(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [page]);

  const totalPages = Math.ceil(data.total / data.page_size) || 1;

  return (
    <div className="flex-1 overflow-y-auto bg-background p-container-padding flex flex-col gap-4">
      <div className="bg-surface p-4 border border-outline-variant">
        <h1 className="font-display text-display text-on-surface">SAP Synchronization Monitor</h1>
        <p className="font-body-sm text-on-surface-variant">
          Audit history of ETL batch runs, record extraction throughput, duration metrics, and job statuses.
        </p>
      </div>

      <div className="bg-surface border border-outline-variant overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-surface-container font-label text-label text-on-surface-variant uppercase tracking-widest">
              <th className="p-table-cell-padding font-normal border-b border-outline-variant">Job ID</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant">Source</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant">Started At</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant text-right">Fetched</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant text-right">Processed</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant text-right">Failed</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant text-right">Duration</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant text-center">Status</th>
            </tr>
          </thead>
          <tbody className="font-data-sm text-data-sm text-on-surface">
            {loading ? (
              <tr><td colSpan="8" className="p-8 text-center text-on-surface-variant">Loading sync jobs...</td></tr>
            ) : data.items.map((job) => (
              <tr key={job.job_id} className="hover:bg-surface-container-highest transition-colors border-b border-outline-variant/30">
                <td className="p-table-cell-padding border-b border-outline-variant font-mono font-bold text-primary">{job.job_id}</td>
                <td className="p-table-cell-padding border-b border-outline-variant font-mono">{job.source}</td>
                <td className="p-table-cell-padding border-b border-outline-variant font-mono">{new Date(job.started_at).toLocaleString()}</td>
                <td className="p-table-cell-padding border-b border-outline-variant text-right font-mono">{job.records_fetched}</td>
                <td className="p-table-cell-padding border-b border-outline-variant text-right font-mono text-primary">{job.records_processed}</td>
                <td className="p-table-cell-padding border-b border-outline-variant text-right font-mono text-error">{job.records_failed}</td>
                <td className="p-table-cell-padding border-b border-outline-variant text-right font-mono">{job.duration_seconds}s</td>
                <td className="p-table-cell-padding border-b border-outline-variant text-center">
                  <span className={`px-2 py-0.5 border font-label text-[10px] uppercase ${
                    job.status === 'COMPLETED' ? 'text-primary border-primary/40' : 'text-error border-error/40'
                  }`}>
                    {job.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-surface p-4 border border-outline-variant flex justify-between items-center font-data-sm text-data-sm text-on-surface-variant">
        <div>Showing page {data.page} of {totalPages} ({data.total} sync jobs)</div>
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
