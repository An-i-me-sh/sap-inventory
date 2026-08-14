import React, { useState, useEffect } from 'react';
import { getAlerts, resolveAlert, unresolveAlert, exportAlertsCsvUrl } from '../api/analytics';
import StatusBadge from '../components/StatusBadge';

export default function StockAlertsPage() {
  const [data, setData] = useState({ items: [], page: 1, page_size: 25, total: 0 });
  const [loading, setLoading] = useState(true);
  const [severity, setSeverity] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const fetchAlertsData = () => {
    setLoading(true);
    getAlerts({
      page,
      page_size: 25,
      severity: severity || undefined,
      status: status || undefined
    })
      .then(res => setData(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAlertsData();
  }, [severity, status, page]);

  const handleResolve = (id) => {
    resolveAlert(id).then(() => fetchAlertsData());
  };

  const handleUnresolve = (id) => {
    unresolveAlert(id).then(() => fetchAlertsData());
  };

  const totalPages = Math.ceil(data.total / data.page_size) || 1;

  return (
    <div className="flex-1 overflow-y-auto bg-background p-container-padding flex flex-col gap-4">
      <div className="flex justify-between items-center bg-surface p-4 border border-outline-variant">
        <div>
          <h1 className="font-display text-display text-on-surface">Operational Stock Alerts</h1>
          <p className="font-body-sm text-on-surface-variant">
            Automated alerts for critical stockouts, low inventory levels, demand anomalies, and SAP sync notifications.
          </p>
        </div>
        <a
          href={exportAlertsCsvUrl}
          download="stock_alerts.csv"
          className="flex items-center gap-2 bg-surface-container hover:bg-surface-container-highest text-primary font-label text-[11px] uppercase tracking-wider px-3 py-2 border border-outline-variant transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">download</span>
          Export CSV
        </a>
      </div>

      <div className="bg-surface p-4 border border-outline-variant grid grid-cols-1 sm:grid-cols-2 gap-3">
        <select
          value={severity}
          onChange={(e) => { setSeverity(e.target.value); setPage(1); }}
          className="bg-surface-container border border-outline-variant text-on-surface font-data-sm text-data-sm px-3 py-1.5 focus:outline-none"
        >
          <option value="">All Severity Tiers</option>
          <option value="HIGH">HIGH Severity</option>
          <option value="MEDIUM">MEDIUM Severity</option>
          <option value="LOW">LOW Severity</option>
        </select>

        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="bg-surface-container border border-outline-variant text-on-surface font-data-sm text-data-sm px-3 py-1.5 focus:outline-none"
        >
          <option value="">All Resolution States</option>
          <option value="UNRESOLVED">UNRESOLVED Alerts</option>
          <option value="RESOLVED">RESOLVED Alerts</option>
        </select>
      </div>

      <div className="bg-surface border border-outline-variant overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-surface-container font-label text-label text-on-surface-variant uppercase tracking-widest">
              <th className="p-table-cell-padding font-normal border-b border-outline-variant">Alert ID</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant">Alert Type</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant">Ref SKU</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant">Message</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant text-center">Severity</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant">Timestamp</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant text-center">Status</th>
              <th className="p-table-cell-padding font-normal border-b border-outline-variant text-center">Action</th>
            </tr>
          </thead>
          <tbody className="font-data-sm text-data-sm text-on-surface">
            {loading ? (
              <tr><td colSpan="8" className="p-8 text-center text-on-surface-variant">Loading system alerts...</td></tr>
            ) : data.items.map((a) => (
              <tr key={a.alert_id} className="hover:bg-surface-container-highest transition-colors border-b border-outline-variant/30">
                <td className="p-table-cell-padding border-b border-outline-variant font-mono">#{a.alert_id}</td>
                <td className="p-table-cell-padding border-b border-outline-variant font-mono text-secondary">{a.alert_type}</td>
                <td className="p-table-cell-padding border-b border-outline-variant font-mono text-primary">{a.material_id || 'SYSTEM'}</td>
                <td className="p-table-cell-padding border-b border-outline-variant font-body-sm max-w-xs truncate">{a.message}</td>
                <td className="p-table-cell-padding border-b border-outline-variant text-center">
                  <span className={`px-2 py-0.5 border font-label text-[10px] uppercase ${
                    a.severity === 'HIGH' ? 'text-error border-error/40 bg-error-container/20' : 'text-secondary border-secondary/40'
                  }`}>
                    {a.severity}
                  </span>
                </td>
                <td className="p-table-cell-padding border-b border-outline-variant font-mono">{new Date(a.created_at).toLocaleString()}</td>
                <td className="p-table-cell-padding border-b border-outline-variant text-center">
                  <span className={`px-2 py-0.5 border font-label text-[10px] uppercase ${
                    a.status === 'RESOLVED' ? 'text-primary border-primary/40' : 'text-error border-error/40'
                  }`}>
                    {a.status}
                  </span>
                </td>
                <td className="p-table-cell-padding border-b border-outline-variant text-center">
                  {a.status === 'UNRESOLVED' ? (
                    <button
                      onClick={() => handleResolve(a.alert_id)}
                      className="font-label text-[10px] uppercase tracking-wider text-primary border border-primary/40 px-2 py-0.5 hover:bg-primary-container/20 transition-colors"
                    >
                      Resolve
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUnresolve(a.alert_id)}
                      className="font-label text-[10px] uppercase tracking-wider text-secondary border border-secondary/40 px-2 py-0.5 hover:bg-secondary-container/20 transition-colors"
                    >
                      Unresolve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-surface p-4 border border-outline-variant flex justify-between items-center font-data-sm text-data-sm text-on-surface-variant">
        <div>Showing page {data.page} of {totalPages} ({data.total} alerts)</div>
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
