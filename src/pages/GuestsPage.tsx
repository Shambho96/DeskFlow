import {
  ChevronRight,
  Grid,
  List,
  Plus,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PhoneNumberDisplay } from '../components/ui/PhoneNumberDisplay';
import { useModal } from '../context/ModalContext';
import { useGuestCRM } from '../hooks/useGuestCRM';
import { useLoyaltySettings } from '../hooks/useLoyaltySettings';
import { cn } from '../lib/utils';
import { GuestListSkeleton } from '../components/skeletons';
import { CreateGuestModal } from '../components/guests/CreateGuestModal';
import { GuestDetailView } from '../components/guests/GuestDetailView';
import { GuestGridView } from '../components/guests/GuestGridView';
import { GuestTableView } from '../components/guests/GuestTableView';

export const GuestsPage: React.FC = () => {
  const { openFolio, openNewReservation } = useModal();
  const { tiers } = useLoyaltySettings();

  const {
    guests,
    totalCount,
    search,
    setSearch,
    tierCode,
    setTierCode,
    selectedGuest,
    setSelectedGuestId,
    stays,
    isLoading,
    createGuest,
  } = useGuestCRM();

  const [viewMode, setViewMode] = useState<'split' | 'grid' | 'list'>('split');
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);

  return (
    <div className="space-y-4 sm:space-y-5 text-left select-none pb-8">
      {/* TOP HEADER & VIEW MODE CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--foreground)] flex items-center gap-2.5">
            Guest Profiles &amp; CRM Directory
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[var(--muted)] border border-[var(--border)] text-[var(--muted-foreground)]">
              {totalCount} Total Records
            </span>
          </h1>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Complete guest stay history, verified KYC documents, tier rewards, and lifetime spend analytics
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View Layout Toggles */}
          <div className="flex items-center gap-1 bg-[var(--muted)]/70 p-1 rounded-xl border border-[var(--border)] text-xs font-bold">
            <button
              onClick={() => setViewMode('split')}
              className={cn(
                'px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer',
                viewMode === 'split'
                  ? 'bg-[var(--card)] text-[var(--primary)] shadow-xs font-black'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              )}
              title="Split Master-Detail View"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Split CRM</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer',
                viewMode === 'grid'
                  ? 'bg-[var(--card)] text-[var(--primary)] shadow-xs font-black'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              )}
              title="Grid Card View"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer',
                viewMode === 'list'
                  ? 'bg-[var(--card)] text-[var(--primary)] shadow-xs font-black'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              )}
              title="Directory List View"
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          <Button
            size="sm"
            onClick={() => setShowAddGuestModal(true)}
            className="h-9 bg-[var(--primary)] text-white font-bold text-xs rounded-xl px-4 gap-1.5 shadow-md shadow-[var(--primary)]/25 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Guest Profile
          </Button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. MASTER-DETAIL SPLIT SCREEN LAYOUT                      */}
      {/* ========================================================= */}
      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
          {/* LEFT COLUMN: GUEST DIRECTORY LIST PANEL */}
          <div
            className={cn(
              'lg:col-span-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 flex flex-col space-y-4 shadow-sm',
              selectedGuest ? 'hidden lg:flex' : 'flex'
            )}
          >
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-[var(--foreground)] tracking-tight">Guests</h2>
                  <p className="text-xs text-[var(--muted-foreground)] font-mono">{totalCount} total</p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-[var(--muted-foreground)] absolute left-3.5 top-3" />
                <Input
                  placeholder="Search by name or number..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="h-10 pl-9 pr-3 rounded-xl bg-[var(--muted)]/50 border-[var(--border)] text-xs text-[var(--foreground)]"
                />
              </div>

              {/* Tier Pill Filters (loaded dynamically from Settings) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setTierCode('ALL')}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
                    tierCode === 'ALL'
                      ? 'bg-[var(--primary)] text-white shadow-sm'
                      : 'bg-[var(--muted)]/60 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]'
                  )}
                >
                  All
                </button>
                {tiers.map(pill => (
                  <button
                    key={pill.tierCode}
                    onClick={() => setTierCode(pill.tierCode)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
                      tierCode === pill.tierCode
                        ? 'bg-[var(--primary)] text-white shadow-sm'
                        : 'bg-[var(--muted)]/60 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]'
                    )}
                  >
                    {pill.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Guest List */}
            <div className="overflow-y-auto space-y-2 pr-1 max-h-[340px] sm:max-h-[480px] lg:max-h-[600px]">
              {isLoading ? (
                <GuestListSkeleton count={6} />
              ) : guests.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--muted-foreground)]">
                  No guest profiles found matching query.
                </div>
              ) : (
                guests.map(g => {
                  const isSelected = selectedGuest?.id === g.id;
                  return (
                    <div
                      key={g.id}
                      onClick={() => setSelectedGuestId(g.id)}
                      className={cn(
                        'p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group',
                        isSelected
                          ? 'bg-[var(--muted)]/80 border-[var(--primary)]/50 shadow-md ring-1 ring-[var(--primary)]/30'
                          : 'bg-[var(--background)]/60 border-[var(--border)] hover:bg-[var(--muted)]/40'
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(g.fullName)}`}
                          alt={g.fullName}
                          className="w-10 h-10 rounded-full bg-[var(--muted)] border border-[var(--border)] shrink-0 object-cover"
                        />
                        <div className="min-w-0 leading-tight">
                          <p className="font-extrabold text-sm text-[var(--foreground)] truncate">
                            {g.fullName}
                          </p>
                          <p className="text-[11px] text-[var(--muted-foreground)] font-mono mt-0.5 truncate">
                            <PhoneNumberDisplay value={g.phone} />
                          </p>
                        </div>
                      </div>

                      <ChevronRight
                        className={cn(
                          'w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5',
                          isSelected ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'
                        )}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: GUEST DETAIL VIEW DASHBOARD */}
          <GuestDetailView
            selectedGuest={selectedGuest}
            stays={stays}
            isLoading={isLoading}
            onClose={() => setSelectedGuestId(null)}
            onNewBooking={openNewReservation}
            onOpenFolio={openFolio}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. GRID VIEW MODE                                         */}
      {/* ========================================================= */}
      {viewMode === 'grid' && (
        <GuestGridView
          guests={guests}
          isLoading={isLoading}
          onSelectGuest={id => {
            setSelectedGuestId(id);
            setViewMode('split');
          }}
          onNewBooking={openNewReservation}
        />
      )}

      {/* ========================================================= */}
      {/* 3. TABLE LIST VIEW MODE                                   */}
      {/* ========================================================= */}
      {viewMode === 'list' && (
        <GuestTableView
          guests={guests}
          isLoading={isLoading}
          onSelectGuest={id => {
            setSelectedGuestId(id);
            setViewMode('split');
          }}
          onNewBooking={openNewReservation}
        />
      )}

      {/* NEW GUEST PROFILE MODAL */}
      <CreateGuestModal
        isOpen={showAddGuestModal}
        onClose={() => setShowAddGuestModal(false)}
        onSubmit={createGuest}
      />
    </div>
  );
};
