import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { HotelProvider } from './context/HotelContext';
import { ModalProvider } from './context/ModalContext';

import { LoginPage } from './pages/LoginPage';
import { PublicBookingPage } from './pages/PublicBookingPage';
import { AppShell } from './layouts/AppShell';

import { DashboardPage } from './pages/DashboardPage';
import { OperationsPage } from './pages/OperationsPage';
import { RoomsPage } from './pages/RoomsPage';
import { GuestsPage } from './pages/GuestsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ReportingPage } from './pages/ReportingPage';
import { PosTerminalPage } from './pages/pos/PosTerminalPage';
import { KitchenKdsPage } from './pages/pos/KitchenKdsPage';
import { TablesManagementPage } from './pages/pos/TablesManagementPage';
import { MenuManagementPage } from './pages/pos/MenuManagementPage';
import { GuestSelfOrderPage } from './pages/pos/GuestSelfOrderPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <HotelProvider>
        <ModalProvider>
          <BrowserRouter>
            <Routes>
              {/* Root redirects directly to dashboard (which redirects to /login if unauthenticated) */}
              <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/book" element={<PublicBookingPage />} />
              <Route path="/book/:hotelId" element={<PublicBookingPage />} />

              {/* Guest Self-Ordering via In-Room QR or WhatsApp Link */}
              <Route path="/order" element={<GuestSelfOrderPage />} />
              <Route path="/order/:outletId" element={<GuestSelfOrderPage />} />

              {/* Protected App Shell */}
              <Route path="/app" element={<AppShell />}>
                <Route index element={<Navigate to="/app/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="operations" element={<OperationsPage />} />
                <Route path="rooms" element={<RoomsPage />} />
                <Route path="guests" element={<GuestsPage />} />
                <Route path="pos" element={<PosTerminalPage />} />
                <Route path="kds" element={<KitchenKdsPage />} />
                <Route path="pos/tables" element={<TablesManagementPage />} />
                <Route path="pos/menu" element={<MenuManagementPage />} />
                <Route path="reports" element={<ReportingPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </ModalProvider>
      </HotelProvider>
    </ThemeProvider>
  );
};

export default App;
