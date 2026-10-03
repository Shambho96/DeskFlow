import React, { useState } from 'react';
import {
  Search,
  ShieldCheck,
  ShieldAlert,
  Users,
  Star,
  Phone,
  Mail,
  Grid,
  List,
  Plus,
  Sparkles,
  Award,
  CalendarDays,
  CreditCard,
  Clock,
  ChevronRight,
  Filter,
  X,
  SlidersHorizontal,
  TrendingUp
} from 'lucide-react';
import { useHotel } from '../context/HotelContext';
import { useModal } from '../context/ModalContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatCurrency, cn } from '../lib/utils';
import type { Reservation } from '../types/hotel';

export const GuestsPage: React.FC = () => {
  const { reservations } = useHotel();
  const { openFolio, openNewReservation } = useModal();

  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<'split' | 'grid' | 'list'>('split');
  const [tierFilter, setTierFilter] = useState<'ALL' | 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE'>('ALL');
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(reservations[0]?.id || null);

  // New guest modal state
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestPhone, setNewGuestPhone] = useState('');
  const [newGuestEmail, setNewGuestEmail] = useState('');
  const [newGuestIdType, setNewGuestIdType] = useState('Passport');
  const [newGuestIdNum, setNewGuestIdNum] = useState('');

  // Tier calculation helper
  const getGuestTier = (res: Reservation) => {
    const total = res.totalAmount || 0;
    if (total >= 50000) return { id: 'PLATINUM', name: 'Platinum', color: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30', badge: '💎 PLATINUM' };
    if (total >= 25000) return { id: 'GOLD', name: 'Gold', color: 'text-amber-400 bg-amber-500/15 border-amber-500/30', badge: '🥇 GOLD' };
    if (total >= 10000) return { id: 'SILVER', name: 'Silver', color: 'text-slate-300 bg-slate-500/15 border-slate-500/30', badge: '🥈 SILVER' };
    return { id: 'BRONZE', name: 'Bronze', color: 'text-orange-400 bg-orange-500/15 border-orange-500/30', badge: '🏅 BRONZE' };
  };

  // Filtered guest list
  const filteredGuests = reservations.filter(res => {
    const matchesSearch =
      res.guestName.toLowerCase().includes(query.toLowerCase()) ||
      res.phone.includes(query) ||
      res.email.toLowerCase().includes(query.toLowerCase()) ||
      res.roomNumber.includes(query) ||
      res.id.toLowerCase().includes(query.toLowerCase());

    if (!matchesSearch) return false;

    if (tierFilter !== 'ALL') {
      const tier = getGuestTier(res);
      if (tier.id !== tierFilter) return false;
    }

    return true;
  });

  // Selected Guest Object
  const selectedGuest = reservations.find(r => r.id === selectedGuestId) || filteredGuests[0] || null;

  // Guest specific stay history (mock/real)
  const guestHistory = selectedGuest
    ? reservations.filter(r => r.guestName.toLowerCase() === selectedGuest.guestName.toLowerCase() || r.phone === selectedGuest.phone)
    : [];

  // CRM Analytics Counters
  const totalGuestsCount = reservations.length;

  const handleCreateGuestProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName.trim()) return;
    alert(`🎉 Guest profile for "${newGuestName}" created successfully in DeskFlow CRM!`);
    setShowAddGuestModal(false);
    setNewGuestName('');
    setNewGuestPhone('');
    setNewGuestEmail('');
  };

  return (
    <div className="space-y-5 text-left select-none pb-8">
      {/* TOP HEADER & VIEW MODE CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--foreground)] flex items-center gap-2.5">
            Guest Profiles &amp; CRM Directory
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[var(--muted)] border border-[var(--border)] text-[var(--muted-foreground)]">
              {totalGuestsCount} Total Records
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
                viewMode === 'split' ? 'bg-[var(--card)] text-[var(--primary)] shadow-xs font-black' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
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
                viewMode === 'grid' ? 'bg-[var(--card)] text-[var(--primary)] shadow-xs font-black' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
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
                viewMode === 'list' ? 'bg-[var(--card)] text-[var(--primary)] shadow-xs font-black' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
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
      {/* 1. MASTER-DETAIL SPLIT SCREEN LAYOUT (EXACT MATCHING SCREENSHOT) */}
      {/* ========================================================= */}
      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[700px]">
          
          {/* LEFT COLUMN: GUEST DIRECTORY LIST PANEL (3.5 cols on wide screens) */}
          <div className="lg:col-span-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 flex flex-col justify-between space-y-4 shadow-sm">
            <div className="space-y-3.5">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-[var(--foreground)] tracking-tight">Guests</h2>
                  <p className="text-xs text-[var(--muted-foreground)] font-mono">{filteredGuests.length} total</p>
                </div>
                <button className="p-2 rounded-xl border border-[var(--border)] hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors">
                  <Filter className="w-4 h-4" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-[var(--muted-foreground)] absolute left-3.5 top-3" />
                <Input
                  placeholder="Search by name or number..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="h-10 pl-9 pr-3 rounded-xl bg-[var(--muted)]/50 border-[var(--border)] text-xs text-[var(--foreground)]"
                />
              </div>

              {/* Tier Pill Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'ALL', label: 'All' },
                  { id: 'PLATINUM', label: 'Platinum' },
                  { id: 'GOLD', label: 'Gold' },
                  { id: 'SILVER', label: 'Silver' },
                  { id: 'BRONZE', label: 'Bronze' },
                ].map(pill => (
                  <button
                    key={pill.id}
                    onClick={() => setTierFilter(pill.id as any)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
                      tierFilter === pill.id
                        ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm'
                        : 'bg-[var(--muted)]/60 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]'
                    )}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Guest List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[540px]">
              {filteredGuests.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--muted-foreground)]">
                  No guest profiles found matching query.
                </div>
              ) : (
                filteredGuests.map(res => {
                  const isSelected = selectedGuest?.id === res.id;
                  return (
                    <div
                      key={res.id}
                      onClick={() => setSelectedGuestId(res.id)}
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
                          src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(res.guestName)}`}
                          alt={res.guestName}
                          className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 shrink-0 object-cover"
                        />
                        <div className="min-w-0 leading-tight">
                          <p className="font-extrabold text-sm text-[var(--foreground)] truncate">
                            {res.guestName}
                          </p>
                          <p className="text-[11px] text-[var(--muted-foreground)] font-mono mt-0.5 truncate">
                            {res.phone}
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

          {/* RIGHT COLUMN: GUEST DETAIL VIEW DASHBOARD (8 cols on wide screens) */}
          <div className="lg:col-span-8 bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-sm">
            {selectedGuest ? (
              <>
                {/* TOP BANNER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
                  <div className="flex items-center gap-4">
                    {/* Big Avatar Card with Primary Theme Border */}
                    <div className="w-16 h-16 rounded-2xl p-0.5 bg-gradient-to-tr from-[var(--primary)] via-blue-500 to-indigo-600 shadow-md shrink-0">
                      <img
                        src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(selectedGuest.guestName)}`}
                        alt={selectedGuest.guestName}
                        className="w-full h-full rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 object-cover"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h2 className="text-2xl font-black text-[var(--foreground)] tracking-tight">
                          {selectedGuest.guestName}
                        </h2>
                        <span className={cn('px-2.5 py-0.5 rounded-full text-[10px] font-black border flex items-center gap-1', getGuestTier(selectedGuest).color)}>
                          <Award className="w-3 h-3" /> {getGuestTier(selectedGuest).name.toUpperCase()}
                        </span>
                      </div>

                      <p className="text-xs text-[var(--muted-foreground)] font-mono flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
                        <span className="font-semibold text-[var(--foreground)]">{selectedGuest.phone}</span>
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
                      <X className="w-4 h-4 text-emerald-500" />
                      <span>Close</span>
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => openNewReservation({ guestName: selectedGuest.guestName, phone: selectedGuest.phone })}
                      className="h-9 bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] font-extrabold text-xs rounded-xl px-4 gap-1.5 shadow-lg shadow-[var(--primary)]/25"
                    >
                      <Plus className="w-4 h-4" />
                      <span>New Booking</span>
                    </Button>
                  </div>
                </div>

                {/* 4 STAT CARDS ROW (EXACT MATCHING SCREENSHOT) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: TIER */}
                  <Card className="border-[var(--border)] bg-[var(--background)]/80 p-4 rounded-2xl space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-orange-500/15 text-orange-500 flex items-center justify-center">
                        <Award className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[var(--muted-foreground)] block">TIER</span>
                      <span className="text-lg font-black text-orange-500 block mt-0.5">{getGuestTier(selectedGuest).name}</span>
                      <span className="text-[10px] text-[var(--muted-foreground)] mt-1 block cursor-pointer hover:text-pink-500 font-semibold">
                        Click to configure tier →
                      </span>
                    </div>
                  </Card>

                  {/* Card 2: RESERVATIONS */}
                  <Card className="border-[var(--border)] bg-[var(--background)]/80 p-4 rounded-2xl space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center">
                        <CalendarDays className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[var(--muted-foreground)] block">RESERVATIONS</span>
                      <span className="text-xl font-mono font-black text-[var(--foreground)] block mt-0.5">
                        {guestHistory.length}
                      </span>
                    </div>
                  </Card>

                  {/* Card 3: LIFETIME SPEND */}
                  <Card className="border-[var(--border)] bg-[var(--background)]/80 p-4 rounded-2xl space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                        <CreditCard className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[var(--muted-foreground)] block">LIFETIME SPEND</span>
                      <span className="text-xl font-mono font-black text-emerald-500 block mt-0.5">
                        {formatCurrency(guestHistory.reduce((sum, h) => sum + (h.totalAmount || 0), 0))}
                      </span>
                    </div>
                  </Card>

                  {/* Card 4: LAST VISIT */}
                  <Card className="border-[var(--border)] bg-[var(--background)]/80 p-4 rounded-2xl space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center">
                        <Clock className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[var(--muted-foreground)] block">LAST VISIT</span>
                      <span className="text-sm font-mono font-bold text-[var(--foreground)] block mt-1 truncate">
                        {selectedGuest.checkIn ? selectedGuest.checkIn : '—'}
                      </span>
                    </div>
                  </Card>
                </div>

                {/* RESERVATION HISTORY PANEL */}
                <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-4 space-y-4 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[var(--primary)]" />
                      <h3 className="font-extrabold text-sm text-[var(--foreground)]">
                        Reservation History
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)]">
                        {guestHistory.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <select className="h-7 text-xs font-bold rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] px-2">
                        <option value="ALL">All Stays</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {/* History Item Rows */}
                  <div className="space-y-2.5">
                    {guestHistory.map(history => (
                      <div
                        key={history.id}
                        className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--card)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-pink-500/30 transition-all shadow-2xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-xs font-mono font-bold text-[var(--foreground)]">
                            <div>{history.checkIn}</div>
                            <div className="text-[10px] text-[var(--muted-foreground)]">13:00</div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[var(--muted-foreground)] flex items-center gap-1 font-mono bg-[var(--muted)]/60 px-2 py-1 rounded-lg">
                              <Users className="w-3 h-3 text-[var(--primary)]" /> 2
                            </span>
                            <span className="text-xs font-mono font-bold text-[var(--foreground)] bg-[var(--muted)]/60 px-2 py-1 rounded-lg">
                              Room {history.roomNumber}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 self-end sm:self-auto">
                          <span className="text-xs font-mono font-black text-emerald-500">
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
                        </div>
                      </div>
                    ))}
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
      {/* 2. GRID VIEW MODE */}
      {/* ========================================================= */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGuests.map(res => {
            const isVip = res.totalAmount > 15000 || (res.specialRequests && res.specialRequests.length > 1);
            return (
              <Card key={res.id} className="border-[var(--border)] bg-[var(--card)] rounded-2xl hover:border-[var(--primary)]/50 transition-all shadow-xs flex flex-col justify-between">
                <div>
                  <CardHeader className="p-4 border-b border-[var(--border)] flex flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(res.guestName)}`}
                        alt={res.guestName}
                        className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-200 shrink-0 object-cover"
                      />
                      <div className="min-w-0">
                        <CardTitle className="text-sm font-bold flex items-center gap-1.5 truncate text-[var(--foreground)]">
                          <span className="truncate">{res.guestName}</span>
                          {res.idVerified ? (
                            <span title="KYC ID Verified"><ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" /></span>
                          ) : (
                            <span title="Unverified Document"><ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" /></span>
                          )}
                        </CardTitle>
                        <p className="text-[10px] text-[var(--muted-foreground)] font-mono truncate">Source: {res.source} · #{res.id}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={res.status === 'CHECKED_IN' ? 'clean' : 'secondary'} className="text-[10px] px-2 py-0.5">
                        {res.status === 'CHECKED_IN' ? 'In-House' : res.status}
                      </Badge>
                      {isVip && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> VIP
                        </span>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-2 text-[var(--muted-foreground)] bg-[var(--muted)]/40 p-2.5 rounded-xl border border-[var(--border)]">
                      <div>
                        <span className="block text-[10px] font-bold text-[var(--muted-foreground)]">Phone Contact</span>
                        <span className="text-[var(--foreground)] font-mono font-bold flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-[var(--primary)]" /> {res.phone}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-[var(--muted-foreground)]">Active Room</span>
                        <span className="text-[var(--primary)] font-mono font-extrabold mt-0.5 block">
                          Room {res.roomNumber} ({res.roomType})
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. TABLE LIST VIEW MODE */}
      {/* ========================================================= */}
      {viewMode === 'list' && (
        <Card className="border-[var(--border)] rounded-2xl shadow-xs overflow-hidden">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--muted)]/60 text-[var(--muted-foreground)] font-bold text-[11px]">
                  <th className="py-3 px-4">Guest Profile</th>
                  <th className="py-3 px-4">Contact Details</th>
                  <th className="py-3 px-4 text-center">Room &amp; Dates</th>
                  <th className="py-3 px-4 text-center">KYC Document</th>
                  <th className="py-3 px-4 text-right">Lifetime Spend</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredGuests.map(res => {
                  const isVip = res.totalAmount > 15000 || (res.specialRequests && res.specialRequests.length > 1);
                  return (
                    <tr key={res.id} className="hover:bg-[var(--muted)]/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(res.guestName)}`}
                            alt={res.guestName}
                            className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 shrink-0 object-cover"
                          />
                          <div>
                            <div className="font-bold text-sm text-[var(--foreground)] flex items-center gap-1.5">
                              {res.guestName}
                              {isVip && <span title="VIP Guest"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /></span>}
                            </div>
                            <div className="text-[10px] text-[var(--muted-foreground)] font-mono">Ref: #{res.id} · {res.source}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <div className="font-mono text-xs text-[var(--foreground)] flex items-center gap-1">
                            <Phone className="w-3 h-3 text-[var(--primary)]" /> {res.phone}
                          </div>
                          <div className="text-[11px] text-[var(--muted-foreground)] flex items-center gap-1">
                            <Mail className="w-3 h-3 text-[var(--muted-foreground)]" /> {res.email}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="px-2.5 py-1 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] font-mono font-bold text-xs border border-[var(--primary)]/20">
                          Room {res.roomNumber}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center font-mono">
                        <div className="flex items-center justify-center gap-1 text-[11px] text-[var(--foreground)] font-semibold">
                          {res.idVerified ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> : <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />}
                          <span>{res.idType || 'Passport'}: {res.idNumber || 'N/A'}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                        {formatCurrency(res.totalAmount)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <Badge variant={res.status === 'CHECKED_IN' ? 'clean' : 'secondary'} className="text-[10px]">
                          {res.status === 'CHECKED_IN' ? 'In-House' : res.status}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button size="sm" variant="outline" className="h-7 text-[11px] font-bold rounded-lg border-[var(--border)]" onClick={() => openFolio(res)}>
                            Folio
                          </Button>
                          <Button size="sm" className="h-7 text-[11px] font-bold bg-[var(--primary)] text-white rounded-lg px-2.5" onClick={() => openNewReservation({ guestName: res.guestName, phone: res.phone })}>
                            Book
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* NEW GUEST PROFILE MODAL */}
      {showAddGuestModal && (
        <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-[var(--card)] border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden">
            <CardHeader className="p-4 border-b border-[var(--border)] flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--primary)]" /> Add New Guest CRM Profile
              </CardTitle>
              <button onClick={() => setShowAddGuestModal(false)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-bold">✕</button>
            </CardHeader>
            <CardContent className="p-5 space-y-3 text-xs">
              <form onSubmit={handleCreateGuestProfile} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1">Full Guest Name</label>
                  <Input placeholder="e.g. Marcus Vance" value={newGuestName} onChange={e => setNewGuestName(e.target.value)} required className="h-9 text-xs rounded-xl" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1">Phone Number</label>
                    <Input placeholder="+91 98765 43210" value={newGuestPhone} onChange={e => setNewGuestPhone(e.target.value)} required className="h-9 text-xs rounded-xl font-mono" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1">Email Address</label>
                    <Input placeholder="guest@example.com" type="email" value={newGuestEmail} onChange={e => setNewGuestEmail(e.target.value)} className="h-9 text-xs rounded-xl" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1">ID Document Type</label>
                    <select value={newGuestIdType} onChange={e => setNewGuestIdType(e.target.value)} className="w-full h-9 rounded-xl border border-[var(--border)] bg-[var(--background)] px-2.5 text-xs font-bold text-[var(--foreground)]">
                      <option value="Passport">Passport</option>
                      <option value="Aadhaar">Aadhaar Card</option>
                      <option value="Driver License">Driver License</option>
                      <option value="Voter ID">Voter ID</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1">ID Number</label>
                    <Input placeholder="P9481203" value={newGuestIdNum} onChange={e => setNewGuestIdNum(e.target.value)} className="h-9 text-xs rounded-xl font-mono" />
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--border)] flex items-center justify-end gap-2">
                  <Button type="button" variant="ghost" size="sm" className="h-9 text-xs font-bold rounded-xl" onClick={() => setShowAddGuestModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="h-9 text-xs font-bold rounded-xl bg-[var(--primary)] text-white px-4">
                    Save Profile
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
