import React, { useState, useEffect } from 'react';
import { getSapStatus, triggerSync } from '../api/sap';

export default function SapIntegrationPage() {
  const [sapStatus, setSapStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchStatus = () => {
    setLoading(true);
    getSapStatus()
      .then(res => setSapStatus(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSyncNow = () => {
    setSyncing(true);
    triggerSync()
      .then(() => fetchStatus())
      .finally(() => setSyncing(false));
  };

  if (loading || !sapStatus) {
    return <div className="p-8 text-center font-data-sm text-on-surface-variant">Querying SAP Integration Layer...</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background p-container-padding flex flex-col gap-6">
      <div className="bg-surface p-6 border border-outline-variant flex justify-between items-center">
        <div>
          <h1 className="font-display text-display text-on-surface">SAP Integration Architecture</h1>
          <p className="font-body-sm text-on-surface-variant">
            OData & REST interface status between SAP S/4HANA ABAP services and FastAPI backend engine.
          </p>
        </div>
        <button
          onClick={handleSyncNow}
          disabled={syncing}
          className="flex items-center gap-2 bg-primary hover:bg-primary-container text-on-primary font-label text-[11px] uppercase tracking-wider px-4 py-2.5 transition-colors disabled:opacity-50"
        >
          <span className={`material-symbols-outlined text-[18px] ${syncing ? 'animate-spin' : ''}`}>
            sync
          </span>
          <span>{syncing ? 'Synchronizing SAP...' : 'Sync Now'}</span>
        </button>
      </div>

      <div className="bg-surface border border-outline-variant grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-outline-variant">
        <div className="p-6">
          <div className="font-label text-label text-on-surface-variant uppercase mb-1">Integration Mode</div>
          <div className="font-display text-display font-mono text-primary uppercase">{sapStatus.sap_mode}</div>
        </div>
        <div className="p-6">
          <div className="font-label text-label text-on-surface-variant uppercase mb-1">SAP Client</div>
          <div className="font-display text-display font-mono text-on-surface">{sapStatus.sap_client}</div>
        </div>
        <div className="p-6">
          <div className="font-label text-label text-on-surface-variant uppercase mb-1">OData Latency</div>
          <div className="font-display text-display font-mono text-secondary">{sapStatus.average_latency_ms} ms</div>
        </div>
        <div className="p-6">
          <div className="font-label text-label text-on-surface-variant uppercase mb-1">Total Audit Logs</div>
          <div className="font-display text-display font-mono text-tertiary">{sapStatus.integration_logs_count}</div>
        </div>
      </div>

      <div className="bg-surface p-6 border border-outline-variant flex flex-col gap-4">
        <h2 className="font-headline text-headline text-on-surface font-bold">Configured SAP Endpoint Credentials</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-data-sm text-data-sm text-on-surface bg-surface-container p-4 border border-outline-variant">
          <div>SAP Base URL: <span className="font-mono text-primary">{sapStatus.sap_base_url}</span></div>
          <div>OData Gateway Service Path: <span className="font-mono text-secondary">{sapStatus.api_path}</span></div>
          <div>SAP OData Service: <span className="font-mono">ZINVENTORY_SRV</span></div>
          <div>ABAP Selection Program: <span className="font-mono text-tertiary">ZINVENTORY_EXPORT</span></div>
        </div>
      </div>
    </div>
  );
}
