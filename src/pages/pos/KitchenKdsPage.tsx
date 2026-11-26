import React, { useState, useEffect } from 'react';
import {
  Flame,
  Clock,
  CheckCircle2,
  Volume2,
  ArrowRight,
} from 'lucide-react';
import { usePos } from '../../hooks/usePos';
import { audioAlert } from '../../utils/audioAlert';
import { DietaryDot } from './PosTerminalPage';
import type { KitchenStation } from '../../types/pos';

// Helper to compute elapsed time in MM:SS
function formatElapsed(createdAt: string): { text: string; totalMinutes: number } {
  const diffMs = Math.max(0, Date.now() - new Date(createdAt).getTime());
  const totalSeconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return {
    text: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
    totalMinutes: minutes,
  };
}

export const KitchenKdsPage: React.FC = () => {
  const { kots, updateKotStatus } = usePos();

  const [activeStation, setActiveStation] = useState<KitchenStation | 'ALL'>('ALL');
  const [, setTick] = useState(0);

  // Live timer tick every second for real-time prep countdowns
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter KOTs by Station & active status (exclude DISPATCHED from main live view)
  const activeKots = kots.filter(kot => {
    if (kot.status === 'DISPATCHED') return false;
    if (activeStation !== 'ALL' && kot.station !== activeStation) return false;
    return true;
  });

  const newOrders = activeKots.filter(k => k.status === 'NEW');
  const inProgressOrders = activeKots.filter(k => k.status === 'IN_PROGRESS');
  const readyOrders = activeKots.filter(k => k.status === 'READY');

  const handleTestChime = () => {
    audioAlert.playNewOrderChime();
  };

  return (
    <div className="space-y-6 text-left pb-12 select-none">
      {/* ─── KDS HEADER (CLEAN & ALIGNED WITH HRM THEME) ────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
              Kitchen Display System (KDS)
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live KOTs
            </span>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Active Cook Station &bull; Real-time KOT tickets &amp; expediter workflow
          </p>
        </div>

        {/* Station Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-[var(--muted)] p-1 rounded-xl border border-[var(--border)] text-xs">
          {(['ALL', 'KITCHEN', 'BAR', 'PANTRY', 'BAKERY'] as const).map(st => (
            <button
              key={st}
              type="button"
              onClick={() => setActiveStation(st)}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                activeStation === st
                  ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              {st === 'ALL' ? 'All Stations' : st}
            </button>
          ))}
        </div>

        {/* Controls: Sound Chime + Stats */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleTestChime}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors shadow-xs cursor-pointer"
            title="Test Kitchen Bell Alert"
          >
            <Volume2 className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
            <span>Test Chime</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs shadow-xs">
            <span className="text-[var(--muted-foreground)] font-medium">Pending:</span>
            <span className="font-bold text-[var(--foreground)]">{activeKots.length}</span>
            <span className="text-[var(--border)]">|</span>
            <span className="text-[var(--muted-foreground)] font-medium">Ready:</span>
            <span className="font-bold text-[var(--primary)]">{readyOrders.length}</span>
          </div>
        </div>
      </div>

      {/* ─── KANBAN BOARD: 3 CLEAN THEMED STATUS LANES ─────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* COLUMN 1: NEW ORDERS */}
        <div className="flex flex-col bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-xs min-h-[520px]">
          <div className="p-3.5 bg-[var(--muted)]/40 border-b border-[var(--border)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                1. New KOT Orders ({newOrders.length})
              </h2>
            </div>
            <span className="text-[10px] text-[var(--muted-foreground)] font-semibold uppercase">Needs Cook Ack</span>
          </div>

          <div className="flex-1 p-3.5 space-y-3.5 overflow-y-auto">
            {newOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[var(--muted-foreground)] space-y-2">
                <CheckCircle2 className="w-9 h-9 opacity-30 text-[var(--muted-foreground)]" />
                <p className="text-xs font-bold text-[var(--foreground)]">Queue is clear</p>
                <p className="text-[11px]">New orders will chime &amp; appear here immediately.</p>
              </div>
            ) : (
              newOrders.map(kot => {
                const { text: elapsedText } = formatElapsed(kot.createdAt);
                return (
                  <div
                    key={kot.id}
                    className="bg-[var(--background)] rounded-xl border border-[var(--border)] hover:border-[var(--primary)]/50 p-4 space-y-3 shadow-xs transition-colors"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between pb-2 border-b border-[var(--border)]/70">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold text-[var(--foreground)] tracking-tight">{kot.kotNumber}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-[var(--muted)] text-[var(--foreground)] border border-[var(--border)] uppercase">
                            {kot.orderChannel === 'ROOM_SERVICE' ? `Room ${kot.roomNumber}` : kot.tableNumber || 'Takeaway'}
                          </span>
                        </div>
                        {kot.guestName && (
                          <p className="text-xs text-[var(--muted-foreground)] font-medium mt-1">
                            Guest: <span className="text-[var(--foreground)] font-semibold">{kot.guestName}</span>
                          </p>
                        )}
                      </div>

                      {/* Timer */}
                      <div className="flex items-center gap-1 text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)]">
                        <Clock className="w-3 h-3 opacity-70" />
                        <span>{elapsedText}</span>
                      </div>
                    </div>

                    {/* Guest Tags */}
                    {kot.guestTags && kot.guestTags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {kot.guestTags.map(tg => (
                          <span
                            key={tg}
                            className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)]"
                          >
                            {tg}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Items */}
                    <div className="space-y-2 py-1">
                      {kot.items.map((item, idx) => (
                        <div key={idx} className="flex items-start justify-between text-xs">
                          <div className="flex items-start gap-2">
                            <DietaryDot type={item.itemType} />
                            <div>
                              <span className="font-bold text-[var(--foreground)] text-xs">
                                {item.quantity}x {item.name}
                              </span>
                              {item.notes && (
                                <p className="text-[11px] text-[var(--primary)] font-semibold italic mt-0.5">
                                  Note: {item.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Special Instructions */}
                    {kot.notes && (
                      <div className="p-2.5 rounded-lg bg-[var(--muted)]/40 text-[11px] text-[var(--foreground)] italic border border-[var(--border)]">
                        Special: "{kot.notes}"
                      </div>
                    )}

                    {/* Button: Accept & Cook */}
                    <button
                      type="button"
                      onClick={() => updateKotStatus(kot.id, 'IN_PROGRESS')}
                      className="w-full py-2.5 rounded-xl text-xs font-bold bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <Flame className="w-4 h-4" />
                      <span>Accept &amp; Start Cooking</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMN 2: ON GRILL / PREPARING (YELLOW / AMBER THEMED) */}
        <div className="flex flex-col bg-[var(--card)] rounded-2xl border border-amber-500/30 overflow-hidden shadow-xs min-h-[520px]">
          <div className="p-3.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                2. Preparing / Cooking ({inProgressOrders.length})
              </h2>
            </div>
            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase">On Grill</span>
          </div>

          <div className="flex-1 p-3.5 space-y-3.5 overflow-y-auto">
            {inProgressOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[var(--muted-foreground)] space-y-2">
                <Flame className="w-9 h-9 opacity-30 text-amber-500" />
                <p className="text-xs font-bold text-[var(--foreground)]">No dishes on fire</p>
                <p className="text-[11px]">Accept orders from column 1 to start cooking.</p>
              </div>
            ) : (
              inProgressOrders.map(kot => {
                const { text: elapsedText, totalMinutes } = formatElapsed(kot.createdAt);
                const isOverdue = totalMinutes > 15;
                return (
                  <div
                    key={kot.id}
                    className={`bg-[var(--background)] rounded-xl border p-4 space-y-3 shadow-xs transition-all ${
                      isOverdue
                        ? 'border-rose-500/70 ring-1 ring-rose-500/30'
                        : 'border-amber-500/35 hover:border-amber-500/60'
                    }`}
                  >
                    <div className="flex items-start justify-between pb-2 border-b border-[var(--border)]/70">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold text-[var(--foreground)] tracking-tight">{kot.kotNumber}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/25 uppercase">
                            {kot.orderChannel === 'ROOM_SERVICE' ? `Room ${kot.roomNumber}` : kot.tableNumber || 'Takeaway'}
                          </span>
                        </div>
                        {kot.guestName && (
                          <p className="text-xs text-[var(--muted-foreground)] font-medium mt-1">
                            Guest: <span className="text-[var(--foreground)] font-semibold">{kot.guestName}</span>
                          </p>
                        )}
                      </div>

                      <div
                        className={`flex items-center gap-1 text-xs font-mono font-bold px-2 py-0.5 rounded-md border ${
                          isOverdue
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 animate-pulse'
                            : 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/25'
                        }`}
                      >
                        <Clock className="w-3 h-3 opacity-80" />
                        <span>{elapsedText}</span>
                      </div>
                    </div>

                    <div className="space-y-2 py-1">
                      {kot.items.map((item, idx) => (
                        <div key={idx} className="flex items-start justify-between text-xs">
                          <div className="flex items-start gap-2">
                            <DietaryDot type={item.itemType} />
                            <div>
                              <span className="font-bold text-[var(--foreground)] text-xs">
                                {item.quantity}x {item.name}
                              </span>
                              {item.notes && (
                                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold italic mt-0.5">
                                  Note: {item.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {kot.notes && (
                      <div className="p-2.5 rounded-lg bg-[var(--muted)]/40 text-[11px] text-[var(--foreground)] italic border border-[var(--border)]">
                        Special: "{kot.notes}"
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => updateKotStatus(kot.id, 'READY')}
                      className="w-full py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-neutral-950 shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <CheckCircle2 className="w-4 h-4 text-neutral-950" />
                      <span>Mark Dishes Ready &amp; Expedite</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMN 3: READY TO EXPEDITE (GREEN / EMERALD THEMED) */}
        <div className="flex flex-col bg-[var(--card)] rounded-2xl border border-emerald-500/30 overflow-hidden shadow-xs min-h-[520px]">
          <div className="p-3.5 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                3. Ready for Expedite ({readyOrders.length})
              </h2>
            </div>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase">Ready</span>
          </div>

          <div className="flex-1 p-3.5 space-y-3.5 overflow-y-auto">
            {readyOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[var(--muted-foreground)] space-y-2">
                <CheckCircle2 className="w-9 h-9 opacity-30 text-emerald-500" />
                <p className="text-xs font-bold text-[var(--foreground)]">No orders awaiting pickup</p>
                <p className="text-[11px]">Cooked dishes will wait here for food runners.</p>
              </div>
            ) : (
              readyOrders.map(kot => {
                const { text: elapsedText } = formatElapsed(kot.createdAt);
                return (
                  <div
                    key={kot.id}
                    className="bg-[var(--background)] rounded-xl border border-emerald-500/35 hover:border-emerald-500/60 p-4 space-y-3 shadow-xs transition-colors"
                  >
                    <div className="flex items-start justify-between pb-2 border-b border-[var(--border)]/70">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold text-[var(--foreground)] tracking-tight">{kot.kotNumber}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/25 uppercase">
                            {kot.orderChannel === 'ROOM_SERVICE' ? `Room ${kot.roomNumber}` : kot.tableNumber || 'Takeaway'}
                          </span>
                        </div>
                        {kot.guestName && (
                          <p className="text-xs text-[var(--muted-foreground)] font-medium mt-1">
                            Guest: <span className="text-[var(--foreground)] font-semibold">{kot.guestName}</span>
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/25">
                        <Clock className="w-3 h-3 opacity-80" />
                        <span>{elapsedText}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 py-1">
                      {kot.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="font-bold text-[var(--foreground)]">
                            {item.quantity}x {item.name}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => updateKotStatus(kot.id, 'DISPATCHED')}
                      className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <ArrowRight className="w-4 h-4" />
                      <span>Runner Picked Up &bull; Complete</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
