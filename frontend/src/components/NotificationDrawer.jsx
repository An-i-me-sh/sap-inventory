import React, { useState, useEffect } from 'react';
import { getAlerts, resolveAlert } from '../api/analytics';

export default function NotificationDrawer({ isOpen, onClose }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAlertsData = () => {
    setLoading(true);
    getAlerts({ page_size: 15, status: 'UNRESOLVED' })
      .then((res) => setAlerts(res.items || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen) {
      fetchAlertsData();
    }
  }, [isOpen]);

  const handleResolve = (alertId) => {
    resolveAlert(alertId).then(() => fetchAlertsData());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-background/50 backdrop-blur-xs">
      <div className="bg-surface border-l border-outline-variant w-full max-w-md h-full flex flex-col shadow-2xl">
        <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">notifications</span>
            <h2 className="font-headline text-headline font-bold text-on-surface">System Alerts</h2>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-primary">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {loading && (
            <div className="text-center font-data-sm text-on-surface-variant py-8">
              Loading active alerts...
            </div>
          )}

          {!loading && alerts.length === 0 && (
            <div className="text-center font-data-sm text-on-surface-variant py-8 border border-dashed border-outline-variant p-4">
              All inventory stock levels & SAP sync services operating within healthy thresholds.
            </div>
          )}

          {alerts.map((a) => (
            <div
              key={a.alert_id}
              className={`p-3.5 border flex flex-col gap-2 transition-colors ${
                a.severity === 'HIGH'
                  ? 'bg-error-container/10 border-error/40'
                  : 'bg-secondary-container/10 border-secondary/40'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className={`font-label text-[10px] uppercase tracking-widest px-2 py-0.5 border ${
                  a.severity === 'HIGH' ? 'text-error border-error/40' : 'text-secondary border-secondary/40'
                }`}>
                  {a.alert_type}
                </span>
                <span className="font-data-sm text-[11px] text-on-surface-variant">
                  {new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface">{a.message}</p>
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => handleResolve(a.alert_id)}
                  className="font-label text-[11px] uppercase tracking-wider text-primary border border-primary/40 px-2 py-1 hover:bg-primary-container/20 transition-colors"
                >
                  Acknowledge & Resolve
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
