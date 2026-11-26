import {
  AlertTriangle,
  BarChart3,
  Building,
  CalendarCheck,
  CalendarX,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  DollarSign,
  ExternalLink,
  Globe,
  PartyPopper,
  Phone,
  PieChart as PieChartIcon,
  Plus,
  RefreshCw,
  Share2,
  Sparkles,
  TrendingUp,
  Wrench
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { DatePicker } from '../components/ui/DatePicker';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/Dialog';
import { PhoneNumberDisplay } from '../components/ui/PhoneNumberDisplay';
import { useModal } from '../context/ModalContext';
import { useUser } from '../hooks/useUser';
import { useOutlets, outletLabel } from '../hooks/useOutlets';
import { useDashboardAnalytics } from '../hooks/useDashboardAnalytics';
import { DashboardPageSkeleton } from '../components/skeletons/DashboardSkeleton';
import {
  VisxComboTrendChart,
  VisxDonutChart,
  VisxBarChart,
  VisxHeatmapChart,
  KpiNumberTicker,
} from '../components/charts';
import {
  fetchLivePublicHolidays,
  getUpcomingEventsFromList,
  type HotelEvent
} from '../data/festivalData';
import { formatCurrency } from '../lib/utils';
import type { VIPArrivalGuest } from '../types/analytics';

export const DashboardPage: React.FC = () => {
  const { openNewReservation, openFolio } = useModal();
  const [chartType, setChartType] = useState<'combo' | 'bar' | 'area'>('combo');
  const [isTaggedDialogOpen, setIsTaggedDialogOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Initialize selected date to today (YYYY-MM-DD local)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  const TODAY = selectedDate;
  const selectedYear = new Date(selectedDate).getFullYear() || 2026;

  // Active User & Outlets for Dynamic Outlet Header Resolution
  const { user } = useUser();
  const { outlets } = useOutlets(Boolean(user));
  const activeOutlet = outlets.find(o => o.id === Number(user?.active_outlet_id));

  // Live Backend Dashboard Analytics Hook
  const { analytics, isLoading, isValidating, refreshAnalytics } = useDashboardAnalytics({
    targetDate: selectedDate,
    trendDays: 7,
  });

  const propertyName = activeOutlet ? outletLabel(activeOutlet) : (analytics?.outletName || 'DeskFloow Hotel');

  // Live Public Holiday API State
  const [liveEvents, setLiveEvents] = useState<HotelEvent[]>([]);
  const [selectedCountry] = useState<string>('IN');

  useEffect(() => {
    let isMounted = true;
    fetchLivePublicHolidays(selectedYear, selectedCountry)
      .then(data => {
        if (isMounted) setLiveEvents(data);
      })
      .catch(() => {
        if (isMounted) setLiveEvents([]);
      });
    return () => {
      isMounted = false;
    };
  }, [selectedCountry, selectedYear]);

  // Festival Engine computation evaluated dynamically against selectedDate
  const upcomingEvents = getUpcomingEventsFromList(liveEvents, selectedDate);
  const nextEvent = upcomingEvents[0];

  // Derived KPI metrics
  const kpis = analytics?.kpis || {
    occupancyPercentage: 0.0,
    occupiedRooms: 0,
    totalRooms: 0,
    salableRooms: 0,
    arrivalsExpected: 0,
    arrivalsCheckedIn: 0,
    arrivalsPending: 0,
    departuresDue: 0,
    departuresSettled: 0,
    departuresPending: 0,
    dailyRoomRevenue: 0.0,
    adr: 0.0,
    revpar: 0.0,
    trevpar: 0.0,
    alos: 1.0,
  };

  const vipArrivals = analytics?.vipArrivals || [];
  const weeklyTrend = analytics?.weeklyTrend || [];
  const channelMix = analytics?.channelMix || [];
  const totalActiveBookings = analytics?.totalActiveBookings ?? 0;
  const housekeeping = analytics?.housekeeping || {
    cleanCount: 0,
    cleaningCount: 0,
    dirtyCount: 0,
    oooCount: 0,
    rooms: [],
  };
  const categoryPerformance = analytics?.categoryPerformance || [];

  const heatmapData = React.useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const departments = ['Front Desk', 'Housekeeping', 'Maintenance', 'Room Service', 'Billing'];
    return days.map((day, dIdx) => ({
      column: day,
      bins: departments.map((dept, depIdx) => ({
        bin: dept,
        count: (dIdx * 2 + depIdx * 3 + (depIdx % 2)) % 6,
      })),
    }));
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6 text-left pb-8">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
              Front Desk Operations &amp; Analytics
            </h1>
            {isValidating && (
              <RefreshCw className="w-4 h-4 text-[var(--primary)] animate-spin" />
            )}
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">
            Real-time hotel performance metrics &amp; yield insights • Property: {propertyName}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <DatePicker value={selectedDate} onChange={setSelectedDate} />
          <Button
            size="sm"
            variant="outline"
            onClick={() => refreshAnalytics()}
            title="Refresh analytics data"
            className="border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)] text-[var(--foreground)] h-9 w-9 p-0 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 text-[var(--muted-foreground)] ${isValidating ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsShareModalOpen(true)}
            className="border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)] text-[var(--foreground)] font-semibold gap-1.5 cursor-pointer shadow-xs"
          >
            <Share2 className="w-4 h-4 text-[var(--primary)]" />
            <span>Share Booking Link</span>
          </Button>
          <Button
            size="sm"
            onClick={() => openNewReservation()}
            className="bg-[var(--primary)] text-white shadow-sm font-semibold gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Quick Walk-In
          </Button>
        </div>
      </div>

      {/* MAIN DASHBOARD CONTENT: SKELETON WHEN LOADING INITIAL DATA OR SWITCHING OUTLETS */}
      {isLoading || !analytics ? (
        <DashboardPageSkeleton />
      ) : (
        <>
          {/* FESTIVAL ALERT STRIP */}
      {nextEvent && nextEvent.daysUntil >= 0 && nextEvent.daysUntil <= 3 && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 flex items-center gap-2.5 shadow-xs">
          <PartyPopper className="w-4 h-4 text-[var(--primary)] shrink-0" />
          <span className="text-xs font-semibold text-[var(--foreground)]">
            {nextEvent.daysUntil === 0 ? "Today's Festival" : "Upcoming Festival"}: {nextEvent.name}
          </span>
          <span className="bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {nextEvent.statusText}
          </span>
        </div>
      )}

      {/* NOTED & VIP ARRIVALS ALERT STRIP */}
      {vipArrivals.length > 0 && (
        <div
          onClick={() => setIsTaggedDialogOpen(true)}
          className="bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)]/40 rounded-xl p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all cursor-pointer shadow-xs hover:shadow-md group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">
                  Today's VIP &amp; Noted Arrivals
                </span>
                <span className="bg-[var(--primary)] text-[var(--primary-foreground)] text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {vipArrivals.length} Guests
                </span>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                {vipArrivals.map(g => g.guestName).slice(0, 3).join(', ')}
                {vipArrivals.length > 3 ? ` and ${vipArrivals.length - 3} more` : ''} arriving today with special preferences.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] shrink-0 self-end sm:self-auto group-hover:translate-x-1 transition-transform">
            <span>View Tagged Guests</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* ─── TOP-LINE KPI METRICS (4 CARDS) ────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Occupancy Rate */}
        <Card className="border-[var(--border)] bg-[var(--card)] shadow-xs hover:border-[var(--primary)]/40 transition-colors">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--muted-foreground)]">Occupancy</span>
              <span className="p-2 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                <Building className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2.5">
              <div className="text-2xl font-bold tracking-tight text-[var(--foreground)] tabular-nums">
                <KpiNumberTicker
                  value={kpis.occupancyPercentage}
                  suffix="%"
                  format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
                />
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                {kpis.occupiedRooms} of {kpis.salableRooms} salable rooms occupied
              </p>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Today's Arrivals */}
        <Card className="border-[var(--border)] bg-[var(--card)] shadow-xs hover:border-[var(--primary)]/40 transition-colors">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--muted-foreground)]">Today's Arrivals</span>
              <span className="p-2 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                <CalendarCheck className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2.5">
              <div className="text-2xl font-bold tracking-tight text-[var(--foreground)] tabular-nums">
                <KpiNumberTicker value={kpis.arrivalsExpected} />
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                {kpis.arrivalsCheckedIn} checked in · {kpis.arrivalsPending} pending
              </p>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Today's Departures */}
        <Card className="border-[var(--border)] bg-[var(--card)] shadow-xs hover:border-[var(--primary)]/40 transition-colors">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--muted-foreground)]">Today's Departures</span>
              <span className="p-2 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                <CalendarX className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2.5">
              <div className="text-2xl font-bold tracking-tight text-[var(--foreground)] tabular-nums">
                <KpiNumberTicker value={kpis.departuresDue} />
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                {kpis.departuresSettled} settled · {kpis.departuresPending} pending
              </p>
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: Daily Room Revenue & RevPAR */}
        <Card className="border-[var(--border)] bg-[var(--card)] shadow-xs hover:border-[var(--primary)]/40 transition-colors">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--muted-foreground)]">Daily Room Revenue</span>
              <span className="p-2 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                <DollarSign className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2.5">
              <div className="text-2xl font-bold tracking-tight text-[var(--foreground)] tabular-nums">
                <KpiNumberTicker
                  value={kpis.dailyRoomRevenue}
                  prefix="₹"
                  format={{ maximumFractionDigits: 0 }}
                />
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                RevPAR: {formatCurrency(kpis.revpar)} · ADR: {formatCurrency(kpis.adr)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── CHARTS & ANALYTICS GRID ────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* 7-DAY REVENUE & OCCUPANCY TREND CHART (col-span-12 lg:col-span-8) */}
        <Card className="col-span-12 lg:col-span-8 hover:border-[var(--primary)]/40 transition-all shadow-xs">
          <CardHeader className="p-5 pb-3 border-b border-[var(--border)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[var(--primary)]" />
                  7-Day Revenue &amp; Occupancy Trend
                </CardTitle>
                <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                  Daily revenue vs occupancy pacing overview
                </p>
              </div>

              {/* Chart Options Selector Pills */}
              <div className="flex items-center gap-2">
                <div className="bg-[var(--muted)] p-0.5 rounded-xl flex items-center text-xs border border-[var(--border)]/40">
                  <button
                    onClick={() => setChartType('combo')}
                    className={`px-2.5 py-1 rounded-lg font-medium text-[11px] transition-all cursor-pointer ${
                      chartType === 'combo'
                        ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs font-semibold'
                        : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                    }`}
                  >
                    Combo (Bar+Line)
                  </button>
                  <button
                    onClick={() => setChartType('bar')}
                    className={`px-2.5 py-1 rounded-lg font-medium text-[11px] transition-all cursor-pointer ${
                      chartType === 'bar'
                        ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs font-semibold'
                        : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                    }`}
                  >
                    Bar Chart
                  </button>
                  <button
                    onClick={() => setChartType('area')}
                    className={`px-2.5 py-1 rounded-lg font-medium text-[11px] transition-all cursor-pointer ${
                      chartType === 'area'
                        ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs font-semibold'
                        : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                    }`}
                  >
                    Area Curve
                  </button>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs mt-3 pt-2 border-t border-[var(--border)]/50">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[var(--primary)]" />
                <span className="text-[var(--muted-foreground)] font-medium">Revenue (₹)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--chart-1)]" />
                <span className="text-[var(--muted-foreground)] font-medium">Occupancy (%)</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-3 sm:p-5 pt-4">
            <div className="h-72 sm:h-80 w-full min-h-[290px]">
              {weeklyTrend.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-[var(--muted-foreground)]">
                  No historical trend data available for this range.
                </div>
              ) : (
                <VisxComboTrendChart
                  data={weeklyTrend}
                  chartType={chartType}
                  height={300}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* BOOKING CHANNELS MIX DONUT (col-span-12 lg:col-span-4) */}
        <Card className="col-span-12 lg:col-span-4 hover:border-[var(--primary)]/40 transition-all shadow-xs flex flex-col justify-between">
          <CardHeader className="p-5 pb-2 border-b border-[var(--border)]">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-[var(--primary)]" />
              Booking Source Mix
            </CardTitle>
            <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
              Active channel distribution &amp; source share
            </p>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            <VisxDonutChart
              data={channelMix}
              totalCount={totalActiveBookings}
              height={176}
            />

            {/* Legend List */}
            <div className="space-y-2 pt-2 border-t border-[var(--border)]">
              {channelMix.map((c, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                    <span className="text-[var(--foreground)] font-medium">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono tabular-nums">
                    <span className="text-[var(--muted-foreground)] text-[11px]">({c.count})</span>
                    <span className="font-bold text-[var(--foreground)]">{c.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* LIVE HOUSEKEEPING & ROOM READINESS (col-span-12 lg:col-span-7) */}
        <Card className="col-span-12 lg:col-span-7 hover:border-[var(--primary)]/40 transition-all shadow-xs flex flex-col justify-between">
          <CardHeader className="p-5 pb-2 border-b border-[var(--border)]">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[var(--primary)]" />
              Live Housekeeping &amp; Room Readiness
            </CardTitle>
            <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
              Turnaround status distribution across all {kpis.totalRooms} rooms
            </p>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {/* Status Indicator Badges */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-3 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)]">
                <p className="text-[var(--foreground)] font-black text-xl tabular-nums">
                  {housekeeping.cleanCount}
                </p>
                <p className="text-[10px] text-[var(--muted-foreground)] font-semibold uppercase tracking-wider mt-0.5">Clean</p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)]">
                <p className="text-[var(--foreground)] font-black text-xl tabular-nums">
                  {housekeeping.cleaningCount}
                </p>
                <p className="text-[10px] text-[var(--muted-foreground)] font-semibold uppercase tracking-wider mt-0.5">Cleaning</p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)]">
                <p className="text-[var(--foreground)] font-black text-xl tabular-nums">
                  {housekeeping.dirtyCount}
                </p>
                <p className="text-[10px] text-[var(--muted-foreground)] font-semibold uppercase tracking-wider mt-0.5">Dirty</p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)]">
                <p className="text-[var(--destructive)] font-black text-xl tabular-nums">
                  {housekeeping.oooCount}
                </p>
                <p className="text-[10px] text-[var(--muted-foreground)] font-semibold uppercase tracking-wider mt-0.5">OOO</p>
              </div>
            </div>

            {/* Room Distribution Pills */}
            <div className="pt-2 border-t border-[var(--border)]">
              <p className="text-xs font-semibold text-[var(--muted-foreground)] mb-2.5">Live Room Distribution:</p>
              <div className="flex flex-wrap gap-2 text-xs max-h-36 overflow-y-auto pr-1">
                {housekeeping.rooms.length === 0 ? (
                  <span className="text-xs text-[var(--muted-foreground)] italic">No rooms registered.</span>
                ) : (
                  housekeeping.rooms.map((r) => {
                    const isClean = r.status === 'CLEAN';
                    const isCleaning = r.status === 'CLEANING';
                    const isDirty = r.status === 'DIRTY';
                    const isOoo = r.status === 'OOO';

                    return (
                      <span
                        key={r.roomId}
                        className={`px-2.5 py-1 rounded-lg font-medium border flex items-center gap-1.5 shadow-2xs ${
                          isOoo
                            ? 'bg-[var(--destructive)]/10 text-[var(--destructive)] border-[var(--destructive)]/30'
                            : isDirty
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                            : isCleaning
                            ? 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30'
                            : 'bg-[var(--muted)]/40 text-[var(--foreground)] border-[var(--border)]'
                        }`}
                      >
                        {isClean && <CheckCircle2 className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />}
                        {isCleaning && <Clock className="w-3.5 h-3.5 text-sky-500 shrink-0" />}
                        {isDirty && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                        {isOoo && <Wrench className="w-3.5 h-3.5 text-[var(--destructive)] shrink-0" />}
                        <span>Room {r.roomNumber}</span>
                      </span>
                    );
                  })
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ROOM CATEGORY PERFORMANCE & ADR (col-span-12 lg:col-span-5) */}
        <Card className="col-span-12 lg:col-span-5 hover:border-[var(--primary)]/40 transition-all shadow-xs flex flex-col justify-between">
          <CardHeader className="p-5 pb-2 border-b border-[var(--border)]">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[var(--primary)]" />
              Category Performance &amp; ADR
            </CardTitle>
            <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
              Occupancy % and nightly yield by category
            </p>
          </CardHeader>
          <CardContent className="p-5">
            <div className="h-56 w-full">
              {categoryPerformance.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-[var(--muted-foreground)]">
                  No category data available.
                </div>
              ) : (
                <VisxBarChart data={categoryPerformance} height={224} />
              )}
            </div>
          </CardContent>
        </Card>

        {/* DAILY OPERATIONS & COMPLAINT CALENDAR HEATMAP (col-span-12) */}
        <Card className="col-span-12 hover:border-[var(--primary)]/40 transition-all shadow-xs">
          <CardHeader className="p-5 pb-2 border-b border-[var(--border)]">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--primary)]" />
              Daily Operations &amp; Guest Issue Heatmap Grid
            </CardTitle>
            <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
              Powered by @visx/heatmap • Departmental incident and complaint intensity by weekday
            </p>
          </CardHeader>
          <CardContent className="p-5">
            <VisxHeatmapChart data={heatmapData} height={200} />
          </CardContent>
        </Card>
      </div>
        </>
      )}

      {/* TAGGED & NOTED GUESTS DIALOG */}
      <Dialog open={isTaggedDialogOpen} onOpenChange={setIsTaggedDialogOpen}>
        <DialogContent className="max-w-3xl w-full mx-3 sm:mx-auto bg-[var(--card)] text-[var(--card-foreground)] border-[var(--border)] p-4 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  Today's VIP &amp; Noted Arrivals
                  <span className="bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 text-xs px-2.5 py-0.5 rounded-full font-bold">
                    {vipArrivals.length} Guests
                  </span>
                </DialogTitle>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  Guests arriving on {TODAY} with special preferences, room requests, or VIP status.
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--muted)]/50 text-[var(--muted-foreground)] font-semibold">
                  <th className="py-2.5 px-3 rounded-l-lg">Guest &amp; Contact</th>
                  <th className="py-2.5 px-3">Room &amp; Category</th>
                  <th className="py-2.5 px-3">ETA &amp; Status</th>
                  <th className="py-2.5 px-3">Special Requests &amp; Tags</th>
                  <th className="py-2.5 px-3 text-right rounded-r-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {vipArrivals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[var(--muted-foreground)]">
                      No arriving guests with special notes today.
                    </td>
                  </tr>
                ) : (
                  vipArrivals.map((res: VIPArrivalGuest) => (
                    <tr key={res.reservationId} className="hover:bg-[var(--muted)]/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(res.guestName)}`}
                            alt={res.guestName}
                            className="w-8 h-8 rounded-full bg-[var(--muted)] border border-[var(--border)] shrink-0"
                          />
                          <div>
                            <div className="font-bold text-[var(--foreground)] flex items-center gap-1.5">
                              {res.guestName}
                              {res.vipStatus !== 'STANDARD' && (
                                <span className="bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] font-bold px-1.5 py-0.5 rounded border border-[var(--primary)]/20">
                                  {res.vipStatus}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[var(--muted-foreground)] flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-[var(--muted-foreground)]" /> <PhoneNumberDisplay value={res.phone} />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-[var(--foreground)]">Room {res.roomNumber || '—'}</div>
                        <div className="text-[11px] text-[var(--muted-foreground)]">{res.categoryName}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-[var(--foreground)]">{res.eta || '12:00 PM'}</div>
                        <span
                          className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            res.status === 'CHECKED_IN'
                              ? 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20'
                              : 'bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)]'
                          }`}
                        >
                          {res.status === 'CHECKED_IN' ? 'Checked In' : 'Expected'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {res.specialRequests && res.specialRequests.length > 0 ? (
                            res.specialRequests.map((req, idx) => (
                              <span
                                key={idx}
                                className="bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] font-semibold px-2 py-0.5 rounded-md border border-[var(--primary)]/20"
                              >
                                {req}
                              </span>
                            ))
                          ) : (
                            <span className="text-[var(--muted-foreground)] italic">Standard Arrival</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setIsTaggedDialogOpen(false);
                            openFolio({
                              id: String(res.reservationId),
                              reservationCode: res.reservationCode,
                              guestName: res.guestName,
                              roomNumber: res.roomNumber || '',
                              roomType: res.categoryName,
                              phone: res.phone,
                              status: res.status,
                              folioId: res.folioId,
                            });
                          }}
                          className="text-xs h-7 gap-1"
                        >
                          <span>Folio</span>
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      {/* SHARE DIRECT BOOKING LINK MODAL */}
      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent className="max-w-md bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] rounded-2xl p-6">
          <DialogHeader className="text-left space-y-1 pb-3 border-b border-[var(--border)]">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Globe className="w-5 h-5 text-[var(--primary)]" />
              <span>Share Direct Guest Booking Link</span>
            </DialogTitle>
            <p className="text-xs text-[var(--muted-foreground)]">
              Send this public URL to guests via WhatsApp, SMS, or Email so they can reserve rooms directly.
            </p>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1.5">
                Public Booking Link URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/book/${analytics?.outletId || Number(user?.active_outlet_id) || 1}`}
                  className="flex-1 h-10 px-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono font-semibold text-[var(--foreground)] outline-none"
                />
                <Button
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/book/${analytics?.outletId || Number(user?.active_outlet_id) || 1}`);
                    setLinkCopied(true);
                    setTimeout(() => setLinkCopied(false), 2000);
                  }}
                  className="h-10 px-3 bg-[var(--primary)] text-white font-bold text-xs gap-1.5 shrink-0 rounded-xl cursor-pointer"
                >
                  {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{linkCopied ? 'Copied' : 'Copy'}</span>
                </Button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--background)] border border-[var(--border)] space-y-2 text-xs">
              <div className="flex items-center gap-2 text-[var(--foreground)] font-semibold">
                <Sparkles className="w-4 h-4 text-[var(--primary)] shrink-0" />
                <span>Instant Auto-Registration</span>
              </div>
              <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                Guests provide check-in dates, contact info, and room category preferences. Bookings auto-assign available rooms and instantly sync with your Front Desk engine.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsShareModalOpen(false)}
                className="text-xs font-semibold rounded-xl"
              >
                Close
              </Button>

              <Button
                size="sm"
                onClick={() => window.open(`/book/${analytics?.outletId || Number(user?.active_outlet_id) || 1}`, '_blank')}
                className="text-xs font-semibold bg-[var(--primary)] text-white gap-1.5 rounded-xl cursor-pointer"
              >
                <span>Open Public Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
