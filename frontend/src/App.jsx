import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SearchModal from './components/SearchModal';
import NotificationDrawer from './components/NotificationDrawer';

import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';
import MaterialDetailsPage from './pages/MaterialDetailsPage';
import MaterialMasterPage from './pages/MaterialMasterPage';
import DemandForecastPage from './pages/DemandForecastPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AiInsightsPage from './pages/AiInsightsPage';
import PurchaseOrdersPage from './pages/PurchaseOrdersPage';
import VendorsPage from './pages/VendorsPage';
import StockAlertsPage from './pages/StockAlertsPage';
import SapIntegrationPage from './pages/SapIntegrationPage';
import SyncMonitorPage from './pages/SyncMonitorPage';
import IntegrationLogsPage from './pages/IntegrationLogsPage';
import DataQualityPage from './pages/DataQualityPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden antialiased bg-background text-on-background font-body-sm">
      {/* SIDEBAR NAVIGATION */}
      <Sidebar />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-sidebar-width pb-16 md:pb-0">
        <Header
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
        />

        <main className="flex-1 overflow-y-auto flex flex-col">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/materials" element={<MaterialMasterPage />} />
            <Route path="/materials/:id" element={<MaterialDetailsPage />} />
            <Route path="/forecast" element={<DemandForecastPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/ai-insights" element={<AiInsightsPage />} />
            <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
            <Route path="/vendors" element={<VendorsPage />} />
            <Route path="/alerts" element={<StockAlertsPage />} />
            <Route path="/sap-integration" element={<SapIntegrationPage />} />
            <Route path="/sync-monitor" element={<SyncMonitorPage />} />
            <Route path="/integration-logs" element={<IntegrationLogsPage />} />
            <Route path="/data-quality" element={<DataQualityPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>

      {/* OVERLAY MODALS */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <NotificationDrawer isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
    </div>
  );
}
