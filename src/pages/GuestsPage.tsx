import type { CountryCode } from 'libphonenumber-js';
import {
  Award,
  CalendarDays,
  ChevronRight,
  Clock,
  CreditCard,
  Filter,
  Grid,
  List,
  Mail,
  Phone,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  X
} from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { PhoneNumberDisplay } from '../components/ui/PhoneNumberDisplay';
import { PhoneNumberInput } from '../components/ui/PhoneNumberInput';
import { useModal } from '../context/ModalContext';
import { useGuestCRM } from '../hooks/useGuestCRM';
import { useLoyaltySettings } from '../hooks/useLoyaltySettings';
import { normalizePhoneNumber } from '../lib/phone';
import { cn, formatCurrency } from '../lib/utils';
import {
  GuestListSkeleton,
  GuestDetailSkeleton,
  GuestGridSkeleton,
  GuestTableSkeleton,
} from '../components/skeletons';
import type { CreateGuestInput, GuestCRMItem } from '../types/crm';

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

  // New guest modal state
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestPhone, setNewGuestPhone] = useState('');
  const [newGuestPhoneCountry, setNewGuestPhoneCountry] = useState<CountryCode>('IN');
  const [newGuestPhoneError, setNewGuestPhoneError] = useState('');
  const [newGuestEmail, setNewGuestEmail] = useState('');
  const [newGuestIdType, setNewGuestIdType] = useState('Passport');
  const [newGuestIdNum, setNewGuestIdNum] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic Tier style resolver from configured Settings
  const getGuestTierStyle = (guest: GuestCRMItem) => {
    const code = (guest.tierCode || 'BRONZE').toUpperCase();
    if (code === 'PLATINUM') {
      return {
        id: 'PLATINUM',
        name: guest.tierName || 'Platinum',
        color: 'text-[var(--primary)] bg-[var(--primary)]/15 border-[var(--primary)]/30',
        badge: '💎 PLATINUM',
      };
    }
    if (code === 'GOLD') {
      return {
        id: 'GOLD',
        name: guest.tierName || 'Gold',
        color: 'text-amber-600 dark:text-amber-400 bg-amber-500/15 border-amber-500/30',
        badge: '🥇 GOLD',
      };
    }
    if (code === 'SILVER') {
      return {
        id: 'SILVER',
        name: guest.tierName || 'Silver',
        color: 'text-[var(--foreground)] bg-[var(--muted)] border-[var(--border)]',
        badge: '🥈 SILVER',
      };
    }
    return {
      id: 'BRONZE',
      name: guest.tierName || 'Bronze',
      color: 'text-[var(--muted-foreground)] bg-[var(--muted)]/60 border-[var(--border)]',
      badge: '🏅 BRONZE',
    };
  };

  const handleCreateGuestProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName.trim()) return;

    const normalized = normalizePhoneNumber(newGuestPhone, newGuestPhoneCountry);
    if (!normalized) {
      setNewGuestPhoneError('Enter a valid phone number for the selected country.');
      return;
    }

    const parts = newGuestName.trim().split(' ');
    const firstName = parts[0] || 'Guest';
    const lastName = parts.slice(1).join(' ') || '-';

    const input: CreateGuestInput = {
      firstName,
      lastName,
      phone: normalized,
      email: newGuestEmail.trim() || undefined,
      idType: newGuestIdType.toUpperCase(),
      idNumber: newGuestIdNum.trim() || undefined,
      idVerified: Boolean(newGuestIdNum.trim()),
    };

    setIsSubmitting(true);
    try {
      await createGuest(input);
      setShowAddGuestModal(false);
      setNewGuestName('');
      setNewGuestPhone('');
      setNewGuestPhoneError('');
      setNewGuestEmail('');
      setNewGuestIdNum('');
    } catch (err: any) {
      alert(err.message || 'Failed to create guest profile');
    } finally {
      setIsSubmitting(false);
    }
  };

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
                'px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5',
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
                'px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5',
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
                'px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5',
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
            className="h-9 bg-[var(--primary)] text-white font-bold text-xs rounded-xl px-4 gap-1.5 shadow-md shadow-[var(--primary)]/25"
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
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-[var(--foreground)] tracking-tight">Guests</h2>
                  <p className="text-xs text-[var(--muted-foreground)] font-mono">{totalCount} total</p>
                </div>
                <button
                  onClick={() => setTierCode('ALL')}
                  className="p-2 rounded-xl border border-[var(--border)] hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors"
                  title="Clear Filters"
                >
                  <Filter className="w-4 h-4" />
                </button>
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
                        {/* Avatar */}
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
          <div
            className={cn(
              'lg:col-span-8 bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 sm:p-6 flex flex-col space-y-4 sm:space-y-6 shadow-sm',
              !selectedGuest && !isLoading ? 'hidden lg:flex' : 'flex'
            )}
          >
            {isLoading ? (
              <GuestDetailSkeleton />
            ) : selectedGuest ? (
              <>
                {/* TOP BANNER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
                  <div className="flex items-center gap-4">
                    {/* Big Avatar Card with Primary Theme Border */}
                    <div className="w-16 h-16 rounded-2xl p-0.5 border-2 border-[var(--primary)] shadow-md shrink-0">
                      <img
                        src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(selectedGuest.fullName)}`}
                        alt={selectedGuest.fullName}
                        className="w-full h-full rounded-2xl bg-[var(--muted)] object-cover"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h2 className="text-2xl font-black text-[var(--foreground)] tracking-tight">
                          {selectedGuest.fullName}
                        </h2>
                        <span
                          className={cn(
                            'px-2.5 py-0.5 rounded-full text-[10px] font-black border flex items-center gap-1',
                            getGuestTierStyle(selectedGuest).color
                          )}
                        >
                          <Award className="w-3 h-3" /> {getGuestTierStyle(selectedGuest).name.toUpperCase()}
                        </span>
                        {selectedGuest.tags &&
                          selectedGuest.tags.length > 0 &&
                          selectedGuest.tags.map(tag => (
                            <span
                              key={tag}
                              className={cn(
                                'px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border',
                                tag.toLowerCase() === 'vip'
                                  ? 'bg-[var(--primary)]/15 text-[var(--primary)] border-[var(--primary)]/30'
                                  : tag.toLowerCase() === 'returning'
                                  ? 'bg-[var(--secondary)] text-[var(--secondary-foreground)] border-[var(--border)]'
                                  : tag.toLowerCase() === 'late check-out'
                                  ? 'bg-[var(--muted)] text-[var(--foreground)] border-[var(--border)]'
                                  : tag.toLowerCase() === 'allergic'
                                  ? 'bg-[var(--destructive)]/15 text-[var(--destructive)] border-[var(--destructive)]/30'
                                  : 'bg-[var(--muted)] text-[var(--foreground)] border-[var(--border)]'
                              )}
                            >
                              {tag}
                            </span>
                          ))}
                      </div>

                      <p className="text-xs text-[var(--muted-foreground)] font-mono flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
                        <PhoneNumberDisplay
                          value={selectedGuest.phone}
                          className="font-semibold text-[var(--foreground)]"
                        />
                        <span>•</span>
                        <Mail className="w-3.5 h-3.5 text-[var(--muted-foreground)] shrink-0" />
                        <span>{selectedGuest.email || 'No email attached'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions Header Buttons */}
                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedGuestId(null)}
                      className="h-9 rounded-xl border-[var(--border)] text-xs font-bold gap-1 hover:bg-[var(--muted)]"
                    >
                      <X className="w-4 h-4 text-[var(--muted-foreground)]" />
                      <span className="hidden sm:inline">Close</span>
                    </Button>

                    <Button
                      size="sm"
                      onClick={() =>
                        openNewReservation({
                          guestName: selectedGuest.fullName,
                          phone: selectedGuest.phone,
                        })
                      }
                      className="h-9 bg-[var(--primary)] hover:opacity-90 text-white font-extrabold text-xs rounded-xl px-4 gap-1.5 shadow-lg shadow-[var(--primary)]/25"
                    >
                      <Plus className="w-4 h-4" />
                      <span>New Booking</span>
                    </Button>
                  </div>
                </div>

                {/* 4 STAT CARDS ROW */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {/* Card 1: TIER */}
                  <Card className="border-[var(--border)] bg-[var(--background)]/80 p-4 rounded-2xl space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center">
                        <Award className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[var(--muted-foreground)] block">
                        TIER
                      </span>
                      <span className="text-lg font-black text-[var(--primary)] block mt-0.5">
                        {getGuestTierStyle(selectedGuest).name}
                      </span>
                      <span className="text-[10px] text-[var(--muted-foreground)] mt-1 block font-semibold">
                        Configured tier
                      </span>
                    </div>
                  </Card>

                  {/* Card 2: RESERVATIONS */}
                  <Card className="border-[var(--border)] bg-[var(--background)]/80 p-4 rounded-2xl space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-[var(--muted)] text-[var(--foreground)] flex items-center justify-center">
                        <CalendarDays className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[var(--muted-foreground)] block">
                        RESERVATIONS
                      </span>
                      <span className="text-xl font-mono font-black text-[var(--foreground)] block mt-0.5">
                        {selectedGuest.totalStays}
                      </span>
                    </div>
                  </Card>

                  {/* Card 3: LIFETIME SPEND */}
                  <Card className="border-[var(--border)] bg-[var(--background)]/80 p-4 rounded-2xl space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center">
                        <CreditCard className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[var(--muted-foreground)] block">
                        LIFETIME SPEND
                      </span>
                      <span className="text-xl font-mono font-black text-[var(--foreground)] block mt-0.5">
                        {formatCurrency(selectedGuest.totalSpend)}
                      </span>
                    </div>
                  </Card>

                  {/* Card 4: LAST VISIT */}
                  <Card className="border-[var(--border)] bg-[var(--background)]/80 p-4 rounded-2xl space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-[var(--muted)] text-[var(--muted-foreground)] flex items-center justify-center">
                        <Clock className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[var(--muted-foreground)] block">
                        LAST VISIT
                      </span>
                      <span className="text-sm font-mono font-bold text-[var(--foreground)] block mt-1 truncate">
                        {selectedGuest.lastVisitDate ? new Date(selectedGuest.lastVisitDate).toLocaleDateString() : '—'}
                      </span>
                    </div>
                  </Card>
                </div>

                {/* RESERVATION HISTORY PANEL */}
                <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-4 space-y-4 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[var(--primary)]" />
                      <h3 className="font-extrabold text-sm text-[var(--foreground)]">Reservation History</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)]">
                        {stays.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {selectedGuest.idNumber && (
                        <span className="text-xs font-mono font-bold text-[var(--muted-foreground)] flex items-center gap-1">
                          {selectedGuest.idVerified ? (
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                          ) : (
                            <ShieldAlert className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                          )}
                          {selectedGuest.idType}: {selectedGuest.idNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* History Item Rows */}
                  <div className="space-y-2.5">
                    {stays.length === 0 ? (
                      <div className="p-6 text-center text-xs text-[var(--muted-foreground)]">
                        No reservation records at this outlet yet.
                      </div>
                    ) : (
                      stays.map(history => (
                        <div
                          key={history.reservationId}
                          className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--card)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[var(--primary)]/40 transition-all shadow-2xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-xs font-mono font-bold text-[var(--foreground)]">
                              <div>{history.checkInDate}</div>
                              <div className="text-[10px] text-[var(--muted-foreground)]">→ {history.checkOutDate}</div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[var(--muted-foreground)] flex items-center gap-1 font-mono bg-[var(--muted)]/60 px-2 py-1 rounded-lg">
                                <Users className="w-3 h-3 text-[var(--primary)]" /> {history.adultsCount}
                              </span>
                              <span className="text-xs font-mono font-bold text-[var(--foreground)] bg-[var(--muted)]/60 px-2 py-1 rounded-lg">
                                Room {history.roomNumber} ({history.categoryName})
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 self-end sm:self-auto">
                            <span className="text-xs font-mono font-black text-[var(--foreground)]">
                              {formatCurrency(history.totalAmount)}
                            </span>

                            <Badge
                              variant={
                                history.status === 'CHECKED_IN'
                                  ? 'clean'
                                  : history.status === 'CANCELLED'
                                  ? 'dirty'
                                  : 'secondary'
                              }
                              className="text-[10px] px-2.5 py-0.5 font-bold uppercase"
                            >
                              {history.status}
                            </Badge>

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openFolio({ id: history.reservationId })}
                              className="h-7 px-2 text-xs font-bold text-[var(--primary)] hover:bg-[var(--primary)]/10"
                            >
                              Folio
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
                <Users className="w-12 h-12 text-[var(--muted-foreground)] opacity-40 animate-pulse" />
                <h3 className="text-base font-extrabold text-[var(--foreground)]">No Guest Profile Selected</h3>
                <p className="text-xs text-[var(--muted-foreground)] max-w-sm">
                  Select any guest from the directory panel on the left to view their tier rewards, contact cards, and full stay history.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. GRID VIEW MODE                                         */}
      {/* ========================================================= */}
      {viewMode === 'grid' && (
        isLoading ? (
          <GuestGridSkeleton count={6} />
        ) : guests.length === 0 ? (
          <div className="p-12 text-center text-xs text-[var(--muted-foreground)] bg-[var(--card)] border border-[var(--border)] rounded-2xl">
            No guest profiles found matching query.
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {guests.map(res => {
            const isVip = res.totalSpend > 25000 || (res.tags && res.tags.length > 1);
            return (
              <Card
                key={res.id}
                className="border-[var(--border)] bg-[var(--card)] rounded-2xl hover:border-[var(--primary)]/50 transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <CardHeader className="p-4 border-b border-[var(--border)] flex flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(res.fullName)}`}
                        alt={res.fullName}
                        className="w-10 h-10 rounded-full bg-[var(--muted)] border border-[var(--border)] shrink-0 object-cover"
                      />
                      <div className="min-w-0">
                        <CardTitle className="text-sm font-bold flex items-center gap-1.5 truncate text-[var(--foreground)]">
                          <span className="truncate">{res.fullName}</span>
                          {res.idVerified ? (
                            <span title="KYC ID Verified">
                              <ShieldCheck className="w-4 h-4 text-[var(--primary)] shrink-0" />
                            </span>
                          ) : (
                            <span title="Unverified Document">
                              <ShieldAlert className="w-4 h-4 text-[var(--muted-foreground)] shrink-0" />
                            </span>
                          )}
                        </CardTitle>
                        <p className="text-[10px] text-[var(--muted-foreground)] font-mono truncate">
                          Tier: {res.tierName} · #{res.id}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded-full border', getGuestTierStyle(res).color)}>
                        {res.tierName}
                      </span>
                      {isVip && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/30 flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-[var(--primary)] text-[var(--primary)]" /> VIP
                        </span>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-2 text-[var(--muted-foreground)] bg-[var(--muted)]/40 p-2.5 rounded-xl border border-[var(--border)]">
                      <div>
                        <span className="block text-[10px] font-bold text-[var(--muted-foreground)]">Phone Contact</span>
                        <span className="text-[var(--foreground)] font-mono font-bold flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-[var(--primary)]" /> <PhoneNumberDisplay value={res.phone} />
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-[var(--muted-foreground)]">Visits / Spend</span>
                        <span className="text-[var(--primary)] font-mono font-extrabold mt-0.5 block">
                          {res.totalStays} Stays · {formatCurrency(res.totalSpend)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </div>

                <div className="p-4 pt-0 flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs font-bold rounded-xl flex-1 border-[var(--border)]"
                    onClick={() => {
                      setSelectedGuestId(res.id);
                      setViewMode('split');
                    }}
                  >
                    View Dossier
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 text-xs font-bold bg-[var(--primary)] text-white rounded-xl flex-1"
                    onClick={() => openNewReservation({ guestName: res.fullName, phone: res.phone })}
                  >
                    Book Room
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
        )
      )}

      {/* ========================================================= */}
      {/* 3. TABLE LIST VIEW MODE                                   */}
      {/* ========================================================= */}
      {viewMode === 'list' && (
        <Card className="border-[var(--border)] rounded-2xl shadow-xs overflow-hidden">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--muted)]/60 text-[var(--muted-foreground)] font-bold text-[11px]">
                  <th className="py-3 px-4">Guest Profile</th>
                  <th className="py-3 px-4">Contact Details</th>
                  <th className="py-3 px-4 text-center">Tier</th>
                  <th className="py-3 px-4 text-center">KYC Document</th>
                  <th className="py-3 px-4 text-right">Lifetime Spend</th>
                  <th className="py-3 px-4 text-center">Total Stays</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              {isLoading ? (
                <GuestTableSkeleton rows={6} />
              ) : (
                <tbody className="divide-y divide-[var(--border)]">
                  {guests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-xs text-[var(--muted-foreground)]">
                        No guest profiles found matching query.
                      </td>
                    </tr>
                  ) : (
                    guests.map(res => {
                  const isVip = res.totalSpend > 25000 || (res.tags && res.tags.length > 1);
                  return (
                    <tr key={res.id} className="hover:bg-[var(--muted)]/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(res.fullName)}`}
                            alt={res.fullName}
                            className="w-8 h-8 rounded-full bg-[var(--muted)] border border-[var(--border)] shrink-0 object-cover"
                          />
                          <div>
                            <div className="font-bold text-sm text-[var(--foreground)] flex items-center gap-1.5">
                              {res.fullName}
                              {isVip && (
                                <span title="VIP Guest">
                                  <Star className="w-3 h-3 fill-[var(--primary)] text-[var(--primary)]" />
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-[var(--muted-foreground)] font-mono">
                              Ref: #{res.id} · {res.tierName}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <div className="font-mono text-xs text-[var(--foreground)] flex items-center gap-1">
                            <Phone className="w-3 h-3 text-[var(--primary)]" /> <PhoneNumberDisplay value={res.phone} />
                          </div>
                          <div className="text-[11px] text-[var(--muted-foreground)] flex items-center gap-1">
                            <Mail className="w-3 h-3 text-[var(--muted-foreground)]" /> {res.email || '—'}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={cn('px-2.5 py-1 rounded-full text-xs font-bold border', getGuestTierStyle(res).color)}>
                          {res.tierName}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center font-mono">
                        <div className="flex items-center justify-center gap-1 text-[11px] text-[var(--foreground)] font-semibold">
                          {res.idVerified ? (
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                          ) : (
                            <ShieldAlert className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                          )}
                          <span>
                            {res.idType || 'Aadhaar'}: {res.idNumber || 'N/A'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-[var(--foreground)] text-xs">
                        {formatCurrency(res.totalSpend)}
                      </td>

                      <td className="py-3 px-4 text-center font-bold font-mono">
                        {res.totalStays}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[11px] font-bold rounded-lg border-[var(--border)]"
                            onClick={() => {
                              setSelectedGuestId(res.id);
                              setViewMode('split');
                            }}
                          >
                            Profile
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 text-[11px] font-bold bg-[var(--primary)] text-white rounded-lg px-2.5"
                            onClick={() => openNewReservation({ guestName: res.fullName, phone: res.phone })}
                          >
                            Book
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
                </tbody>
              )}
            </table>
          </CardContent>
        </Card>
      )}

      {/* NEW GUEST PROFILE MODAL */}
      {showAddGuestModal && (
        <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[calc(100dvh-2rem)] overflow-y-auto bg-[var(--card)] border-[var(--border)] rounded-2xl shadow-2xl">
            <CardHeader className="p-4 border-b border-[var(--border)] flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--primary)]" /> Add New Guest CRM Profile
              </CardTitle>
              <button
                onClick={() => setShowAddGuestModal(false)}
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-bold"
              >
                ✕
              </button>
            </CardHeader>
            <CardContent className="p-5 space-y-3 text-xs">
              <form onSubmit={handleCreateGuestProfile} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1">
                    Full Guest Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g. Marcus Vance"
                    value={newGuestName}
                    onChange={e => setNewGuestName(e.target.value)}
                    required
                    className="h-9 text-xs rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <PhoneNumberInput
                      value={newGuestPhone}
                      country={newGuestPhoneCountry}
                      onChange={(value, country) => {
                        setNewGuestPhone(value);
                        setNewGuestPhoneCountry(country);
                        setNewGuestPhoneError('');
                      }}
                      placeholder="98765 43210"
                      required
                      className="[&>div]:h-12 [&_button]:px-4 [&_input]:text-base"
                    />
                    {newGuestPhoneError && (
                      <p className="mt-1 text-[10px] font-semibold text-[var(--destructive)]">{newGuestPhoneError}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1">Email Address</label>
                    <Input
                      placeholder="guest@example.com"
                      type="email"
                      value={newGuestEmail}
                      onChange={e => setNewGuestEmail(e.target.value)}
                      className="h-9 text-xs rounded-xl"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1">ID Document Type</label>
                    <select
                      value={newGuestIdType}
                      onChange={e => setNewGuestIdType(e.target.value)}
                      className="w-full h-9 rounded-xl border border-[var(--border)] bg-[var(--background)] px-2.5 text-xs font-bold text-[var(--foreground)]"
                    >
                      <option value="Passport">Passport</option>
                      <option value="Aadhaar">Aadhaar Card</option>
                      <option value="Driver License">Driver License</option>
                      <option value="Voter ID">Voter ID</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1">ID Number</label>
                    <Input
                      placeholder="P9481203"
                      value={newGuestIdNum}
                      onChange={e => setNewGuestIdNum(e.target.value)}
                      className="h-9 text-xs rounded-xl font-mono"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--border)] flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 text-xs font-bold rounded-xl"
                    onClick={() => setShowAddGuestModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmitting}
                    className="h-9 text-xs font-bold rounded-xl bg-[var(--primary)] text-white px-4"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Profile'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
