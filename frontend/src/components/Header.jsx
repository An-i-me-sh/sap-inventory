import React, { useState, useEffect } from 'react';
import { getSapStatus } from '../api/sap';

export default function Header({ onOpenSearch, onOpenNotifications }) {
  const [sapStatus, setSapStatus] = useState({
    sap_status: 'Mock SAP Environment',
    sap_mode: 'mock'
  });
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    getSapStatus()
      .then(res => setSapStatus(res))
      .catch(() => {});
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <header className="flex justify-between items-center h-header-height px-container-padding w-full z-50 bg-surface dark:bg-surface border-b border-outline-variant dark:border-outline-variant sticky top-0">
      <div className="flex items-center gap-4">
        <div className="font-headline text-headline font-bold text-primary dark:text-primary tracking-tight">
          SAP INTEGRATE
        </div>

        {/* SAP Connection Status Indicator (Honesty Rule) */}
        <div className={`hidden sm:flex items-center gap-2 font-data-sm text-data-sm px-3 py-1 rounded-sm border ${
          sapStatus.sap_mode === 'real'
            ? 'bg-primary-container/20 text-primary border-primary/40'
            : 'bg-secondary-container/20 text-secondary border-secondary/40'
        }`}>
          <span className="material-symbols-outlined text-[14px]">
            {sapStatus.sap_mode === 'real' ? 'cloud_done' : 'cloud_sync'}
          </span>
          <span>{sapStatus.sap_status}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Global Search Shortcut Trigger */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 bg-surface-container hover:bg-surface-container-highest px-3 py-1.5 border border-outline-variant rounded-sm text-on-surface-variant text-body-sm transition-colors"
          title="Search materials, POs, vendors..."
        >
          <span className="material-symbols-outlined text-[18px]">search</span>
          <span className="hidden sm:inline font-data-sm text-data-sm">Search (Ctrl+K)</span>
        </button>

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="text-on-surface-variant hover:text-primary hover:bg-surface-container-highest p-1.5 rounded-sm transition-colors relative"
          title="Notifications & Alerts"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
        </button>

        {/* Dark / Light Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="text-on-surface-variant hover:text-primary hover:bg-surface-container-highest p-1.5 rounded-sm transition-colors"
          title="Toggle Dark/Light Mode"
        >
          <span className="material-symbols-outlined text-[20px]">
            {isDark ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
      </div>
    </header>
  );
}
