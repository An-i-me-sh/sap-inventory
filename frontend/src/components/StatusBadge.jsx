import React from 'react';

export default function StatusBadge({ status }) {
  const s = (status || 'HEALTHY').toUpperCase();

  if (s === 'CRITICAL') {
    return (
      <span className="font-label text-label text-error uppercase border border-error/40 bg-error-container/20 px-2 py-0.5 rounded-sm inline-block">
        Critical
      </span>
    );
  }

  if (s === 'LOW') {
    return (
      <span className="font-label text-label text-secondary uppercase border border-secondary/40 bg-secondary-container/20 px-2 py-0.5 rounded-sm inline-block">
        Low Stock
      </span>
    );
  }

  if (s === 'OVERSTOCK') {
    return (
      <span className="font-label text-label text-tertiary uppercase border border-tertiary/40 bg-tertiary-container/20 px-2 py-0.5 rounded-sm inline-block">
        Overstock
      </span>
    );
  }

  return (
    <span className="font-label text-label text-primary uppercase border border-primary/40 bg-primary-container/20 px-2 py-0.5 rounded-sm inline-block">
      Healthy
    </span>
  );
}
