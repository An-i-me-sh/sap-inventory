import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { name: 'Dashboard', path: '/', icon: 'dashboard' },
  { name: 'Inventory', path: '/inventory', icon: 'inventory_2' },
  { name: 'Material Master', path: '/materials', icon: 'category' },
  { name: 'Demand Forecast', path: '/forecast', icon: 'trending_up' },
  { name: 'Analytics', path: '/analytics', icon: 'analytics' },
  { name: 'AI Insights', path: '/ai-insights', icon: 'psychology' },
  { name: 'Procurement', path: '/purchase-orders', icon: 'shopping_cart' },
  { name: 'Vendors', path: '/vendors', icon: 'store' },
  { name: 'Stock Alerts', path: '/alerts', icon: 'warning' },
  { name: 'SAP Integration', path: '/sap-integration', icon: 'sync' },
  { name: 'Sync Monitor', path: '/sync-monitor', icon: 'monitor_heart' },
  { name: 'Integration Logs', path: '/integration-logs', icon: 'receipt_long' },
  { name: 'Data Quality', path: '/data-quality', icon: 'verified' },
  { name: 'Settings', path: '/settings', icon: 'settings' }
];

export default function Sidebar() {
  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <nav className="hidden md:flex flex-col fixed left-0 top-0 h-full w-sidebar-width bg-surface-container dark:bg-surface-container border-r border-outline-variant dark:border-outline-variant py-4 z-40 transition-all duration-200">
        <div className="px-container-padding mb-4 flex items-center h-header-height border-b border-outline-variant">
          <span className="font-headline text-headline text-primary dark:text-primary tracking-wide font-bold">
            SAP INVENTORY
          </span>
        </div>
        <div className="flex-1 overflow-y-auto px-3 flex flex-col gap-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2 rounded-sm transition-colors duration-150 group ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container font-bold border-l-2 border-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface'
                }`
              }
            >
              <span className="material-symbols-outlined text-[18px] group-hover:text-primary">
                {item.icon}
              </span>
              <span className="font-label text-[11px] uppercase tracking-widest">
                {item.name}
              </span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full h-16 z-50 flex justify-around items-center px-2 bg-surface-container dark:bg-surface-container border-t border-outline-variant dark:border-outline-variant">
        {navItems.slice(0, 5).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center px-2 py-1 transition-transform duration-100 ${
                isActive
                  ? 'bg-primary-container text-on-primary-container rounded-sm font-bold scale-95'
                  : 'text-on-surface-variant hover:bg-surface-container-highest'
              }`
            }
          >
            <span className="material-symbols-outlined text-[20px]">
              {item.icon}
            </span>
            <span className="font-label text-[9px] mt-0.5 uppercase tracking-wider">
              {item.name}
            </span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
