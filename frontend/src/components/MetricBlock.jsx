import React from 'react';

export default function MetricBlock({ label, value, unit, isAlert = false, isHighlight = false }) {
  return (
    <div className={`flex-1 p-6 border-b md:border-b-0 md:border-r border-outline-variant flex flex-col justify-center relative overflow-hidden ${
      isAlert ? 'bg-error-container/5' : isHighlight ? 'bg-primary-container/5' : ''
    }`}>
      {isAlert && <div className="absolute left-0 top-0 bottom-0 w-1 bg-error"></div>}
      <div className={`font-label text-label uppercase tracking-widest mb-2 ${isAlert ? 'text-error' : 'text-on-surface-variant'}`}>
        {label}
      </div>
      <div className={`font-display text-display font-mono tracking-tight ${isAlert ? 'text-error' : 'text-on-surface'}`}>
        {value} {unit && <span className="font-data-sm text-data-sm text-on-surface-variant ml-1">{unit}</span>}
      </div>
    </div>
  );
}
