import React, { useState, useEffect } from 'react';
import { getHealth } from '../api/sap';

export default function SettingsPage() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    getHealth()
      .then(res => setHealth(res))
      .catch(() => {});
  }, []);

  return (
    <div className="flex-1 overflow-y-auto bg-background p-container-padding flex flex-col gap-6">
      <div className="bg-surface p-6 border border-outline-variant">
        <h1 className="font-display text-display text-on-surface">Platform Settings & System Parameters</h1>
        <p className="font-body-sm text-on-surface-variant">
          Environment configuration parameters, business logic rules, and integration diagnostic status.
        </p>
      </div>

      {health && (
        <div className="bg-surface p-6 border border-outline-variant flex flex-col gap-4">
          <h2 className="font-headline text-headline text-on-surface font-bold border-b border-outline-variant pb-2">
            System Diagnostics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-data-sm text-data-sm">
            <div className="p-4 bg-surface-container border border-outline-variant">
              <div className="text-on-surface-variant uppercase font-label">Database Connection</div>
              <div className="text-primary font-bold text-lg font-mono uppercase">{health.database}</div>
            </div>
            <div className="p-4 bg-surface-container border border-outline-variant">
              <div className="text-on-surface-variant uppercase font-label">SAP Integration Mode</div>
              <div className="text-secondary font-bold text-lg font-mono uppercase">{health.sap_mode}</div>
            </div>
            <div className="p-4 bg-surface-container border border-outline-variant">
              <div className="text-on-surface-variant uppercase font-label">Groq AI Status</div>
              <div className="text-tertiary font-bold text-lg font-mono uppercase">{health.groq_status}</div>
            </div>
          </div>
        </div>
      )}

      {/* BUSINESS LOGIC RULES DISPLAY */}
      <div className="bg-surface p-6 border border-outline-variant flex flex-col gap-4">
        <h2 className="font-headline text-headline text-on-surface font-bold border-b border-outline-variant pb-2">
          Stock Classification Rules (Section 11)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-data-sm text-data-sm text-on-surface">
          <div className="p-3 bg-surface-container border border-outline-variant">
            <span className="text-error font-bold font-mono">CRITICAL:</span> Current Stock &lt; 50% of Minimum Stock
          </div>
          <div className="p-3 bg-surface-container border border-outline-variant">
            <span className="text-secondary font-bold font-mono">LOW:</span> Current Stock &lt; Minimum Stock
          </div>
          <div className="p-3 bg-surface-container border border-outline-variant">
            <span className="text-primary font-bold font-mono">HEALTHY:</span> Min Stock &le; Current Stock &le; Max Stock
          </div>
          <div className="p-3 bg-surface-container border border-outline-variant">
            <span className="text-tertiary font-bold font-mono">OVERSTOCK:</span> Current Stock &gt; Maximum Stock
          </div>
        </div>
      </div>
    </div>
  );
}
