import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { TopBar } from '../components/topbar/TopBar';
import { Sidebar } from '../components/sidebar/Sidebar';
import { NewReservationModal } from '../components/modals/NewReservationModal';
import { FolioModal } from '../components/modals/FolioModal';
import { FastSearchModal } from '../components/modals/FastSearchModal';
import { ShiftCloseModal } from '../components/modals/ShiftCloseModal';

export const AppShell: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    // Outer bg = sidebar color — sidebar blends into it seamlessly
    <div className="h-screen w-screen flex bg-[var(--sidebar)] overflow-hidden">

      {/* SIDEBAR — flush with screen edges, zero margin, corner radius on right top & bottom (rounded-r-2xl) */}
      <Sidebar isCollapsed={isCollapsed} />

      {/* RIGHT CONTENT PANEL — floating rounded panel with margins */}
      <div className="flex-1 flex flex-col min-w-0 my-2 mr-2 rounded-xl overflow-hidden bg-[var(--background)] shadow-sm">
        <TopBar
          isCollapsed={isCollapsed}
          toggleSidebar={() => setIsCollapsed(prev => !prev)}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="w-full p-6 space-y-5">
            <Outlet />
          </div>
        </main>
      </div>

      {/* GLOBAL MODALS */}
      <NewReservationModal />
      <FolioModal />
      <FastSearchModal />
      <ShiftCloseModal />
    </div>
  );
};
