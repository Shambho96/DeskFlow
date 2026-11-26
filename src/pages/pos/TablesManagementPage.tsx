import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Receipt,
  CheckCircle2,
  Plus,
  UtensilsCrossed,
} from 'lucide-react';
import { usePos } from '../../hooks/usePos';

export const TablesManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { tables, updateTableStatus, setSelectedTableNumber, setOrderChannel } = usePos();

  const [activeSection, setActiveSection] = useState<string>('ALL');

  // Distinct sections
  const sections = useMemo(() => {
    const list = Array.from(new Set(tables.map(t => t.sectionName)));
    return ['ALL', ...list];
  }, [tables]);

  const filteredTables = useMemo(() => {
    if (activeSection === 'ALL') return tables;
    return tables.filter(t => t.sectionName === activeSection);
  }, [tables, activeSection]);

  // Statistics
  const totalTables = tables.length;
  const occupiedCount = tables.filter(t => t.status === 'OCCUPIED' || t.status === 'BILLING').length;
  const occupancyPct = totalTables > 0 ? Math.round((occupiedCount / totalTables) * 100) : 0;
  const totalActiveRevenue = tables.reduce((sum, t) => sum + (t.activeTotal || 0), 0);
  const totalSeatedGuests = tables.reduce((sum, t) => sum + (t.seatedGuests || 0), 0);

  const handleOpenPosForTable = (tableNumber: string) => {
    setSelectedTableNumber(tableNumber);
    setOrderChannel('DINE_IN');
    navigate('/app/pos');
  };

  return (
    <div className="space-y-6 text-left pb-12">
      {/* ─── PAGE HEADER & STATS ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
              Tables &amp; Floor Plan
            </h1>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Real-time table occupancy, cover tracking &amp; dining section manager
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/app/pos')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[var(--primary)] text-white shadow-md hover:opacity-90 transition-opacity cursor-pointer self-start sm:self-auto"
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>Open POS Terminal</span>
        </button>
      </div>

      {/* ─── KPI STATS STRIP ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-1">
          <span className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
            Total Capacity
          </span>
          <p className="text-xl font-black text-[var(--foreground)]">
            {totalTables} Tables
          </p>
          <p className="text-[10px] text-[var(--muted-foreground)]">Across {sections.length - 1} sections</p>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-1">
          <span className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
            Occupancy Rate
          </span>
          <p className="text-xl font-black text-blue-600 dark:text-blue-400">
            {occupancyPct}%
          </p>
          <p className="text-[10px] text-blue-500">{occupiedCount} tables currently seated</p>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-1">
          <span className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
            Active Seated Guests
          </span>
          <p className="text-xl font-black text-purple-600 dark:text-purple-400">
            {totalSeatedGuests} Covers
          </p>
          <p className="text-[10px] text-purple-500">Dining in resort restaurants</p>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-1">
          <span className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
            Active Table Revenue
          </span>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
            ₹{totalActiveRevenue.toFixed(2)}
          </p>
          <p className="text-[10px] text-emerald-500">Unbilled running table charges</p>
        </div>
      </div>

      {/* ─── SECTION FILTER STRIP ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {sections.map(sec => (
          <button
            key={sec}
            type="button"
            onClick={() => setActiveSection(sec)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSection === sec
                ? 'bg-[var(--primary)] text-white shadow-xs'
                : 'bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            {sec === 'ALL' ? 'All Sections' : sec}
          </button>
        ))}
      </div>

      {/* ─── TABLES GRID ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredTables.map(tbl => {
          const isVacant = tbl.status === 'VACANT';
          const isOccupied = tbl.status === 'OCCUPIED';
          const isBilling = tbl.status === 'BILLING';
          const isCleaning = tbl.status === 'CLEANING';

          return (
            <div
              key={tbl.id}
              className={`p-5 rounded-2xl border transition-all duration-150 flex flex-col justify-between space-y-4 shadow-xs select-none ${
                isVacant
                  ? 'bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-500/60'
                  : isOccupied
                  ? 'bg-blue-500/5 border-blue-500/40 hover:border-blue-500/70 shadow-sm'
                  : isBilling
                  ? 'bg-amber-500/10 border-amber-500/50 hover:border-amber-500 animate-pulse'
                  : 'bg-purple-500/5 border-purple-500/30'
              }`}
            >
              <div>
                {/* Top: Table Number & Status Pill */}
                <div className="flex items-center justify-between">
                  <span className="text-base font-black text-[var(--foreground)] tracking-tight">
                    {tbl.tableNumber}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      isVacant
                        ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'
                        : isOccupied
                        ? 'bg-blue-500/15 text-blue-600 border-blue-500/30'
                        : isBilling
                        ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40'
                        : 'bg-purple-500/15 text-purple-600 border-purple-500/30'
                    }`}
                  >
                    {tbl.status}
                  </span>
                </div>

                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  {tbl.sectionName} &bull; {tbl.capacity} Seats
                </p>

                {/* Occupied Meta Details */}
                {isOccupied && (
                  <div className="mt-3 p-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs space-y-1">
                    <div className="flex justify-between text-[var(--muted-foreground)]">
                      <span>Order Ref:</span>
                      <span className="font-bold text-[var(--foreground)]">{tbl.currentOrderNumber}</span>
                    </div>
                    <div className="flex justify-between text-[var(--muted-foreground)]">
                      <span>Seated Covers:</span>
                      <span className="font-semibold text-[var(--foreground)]">{tbl.seatedGuests} Guests</span>
                    </div>
                    <div className="flex justify-between text-[var(--muted-foreground)]">
                      <span>Active Bill:</span>
                      <span className="font-black text-blue-600 dark:text-blue-400">
                        ₹{tbl.activeTotal?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>
                )}

                {isBilling && (
                  <div className="mt-3 p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200">
                    <p className="font-bold flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Bill Requested &bull; ₹{tbl.activeTotal?.toFixed(2)}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between gap-2">
                {isVacant && (
                  <button
                    type="button"
                    onClick={() => handleOpenPosForTable(tbl.tableNumber)}
                    className="w-full py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Seat &amp; Order</span>
                  </button>
                )}

                {isOccupied && (
                  <div className="w-full flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenPosForTable(tbl.tableNumber)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-all cursor-pointer"
                    >
                      + Add Dishes
                    </button>
                    <button
                      type="button"
                      onClick={() => updateTableStatus(tbl.id, 'BILLING')}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--muted)] hover:bg-[var(--muted)]/80 text-[var(--foreground)] transition-colors cursor-pointer"
                    >
                      Request Bill
                    </button>
                  </div>
                )}

                {isBilling && (
                  <button
                    type="button"
                    onClick={() => handleOpenPosForTable(tbl.tableNumber)}
                    className="w-full py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Settle &bull; ₹{tbl.activeTotal?.toFixed(2)}</span>
                  </button>
                )}

                {isCleaning && (
                  <button
                    type="button"
                    onClick={() => updateTableStatus(tbl.id, 'VACANT')}
                    className="w-full py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Clean &amp; Vacant</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
