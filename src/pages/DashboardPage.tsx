import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  CalendarX,
  Building,
  DollarSign,
  Plus,
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Wrench,
  Sparkles,
  ChevronRight,
  Phone,
  ExternalLink,
  PartyPopper
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  AreaChart,
  Bar,
  Line,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { useHotel } from '../context/HotelContext';
import { useModal } from '../context/ModalContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/Dialog';
import { DatePicker } from '../components/ui/DatePicker';
import { formatCurrency } from '../lib/utils';
import {
  fetchLivePublicHolidays,
  getUpcomingEventsFromList,
  type HotelEvent
} from '../data/festivalData';

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--popover)] border border-[var(--border)] text-[var(--popover-foreground)] p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-36">
        <p className="font-bold border-b border-[var(--border)] pb-1 mb-1 text-[var(--foreground)]">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-3 text-[11px] font-semibold">
            <span style={{ color: entry.color || entry.fill }}>{entry.name}:</span>
            <span className="font-mono">
              {entry.name.includes('Revenue') ? `₹${Number(entry.value).toLocaleString()}` : `${entry.value}%`}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Room Category Yield Data
const roomCategories = [
  { category: 'Deluxe Suite', occupancy: 85, adr: 6500, totalRooms: 4, occupied: 3 },
  { category: 'Executive King', occupancy: 75, adr: 4800, totalRooms: 4, occupied: 3 },
  { category: 'Standard Double', occupancy: 60, adr: 3200, totalRooms: 5, occupied: 3 },
  { category: 'Single Room', occupancy: 40, adr: 2200, totalRooms: 5, occupied: 2 }
];

export const DashboardPage: React.FC = () => {
  const { rooms, reservations, cashRegister } = useHotel();
  const { openNewReservation, openFolio } = useModal();
  const [chartType, setChartType] = useState<'combo' | 'bar' | 'area'>('combo');
  const [isTaggedDialogOpen, setIsTaggedDialogOpen] = useState(false);
  
  // Live Public Holiday API State
  const [liveEvents, setLiveEvents] = useState<HotelEvent[]>([]);
  const [selectedCountry] = useState<string>('IN');

  const [selectedDate, setSelectedDate] = useState<string>('2026-09-24');
  const TODAY = selectedDate;
  const selectedYear = new Date(selectedDate).getFullYear() || 2026;

  // Fetch real public holidays from API whenever selectedCountry or selectedYear changes
  useEffect(() => {
    let isMounted = true;

    fetchLivePublicHolidays(selectedYear, selectedCountry)
      .then(data => {
        if (isMounted) {
          setLiveEvents(data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLiveEvents([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCountry, selectedYear]);

  // Festival Engine computation evaluated dynamically against selectedDate
  const upcomingEvents = getUpcomingEventsFromList(liveEvents, selectedDate);
  const nextEvent = upcomingEvents[0];

  // Live KPI Computations from reservations & rooms
  const activeReservations = reservations.filter(r => r.status !== 'CANCELLED');

  const todayArrivals = reservations.filter(r => r.checkIn === TODAY && r.status !== 'CANCELLED');
  const arrivalsExpected = todayArrivals.length;
  const arrivalsCheckedIn = todayArrivals.filter(r => r.status === 'CHECKED_IN').length;
  const arrivalsPending = todayArrivals.filter(r => r.status === 'RESERVED').length;

  // Noted / VIP Arrivals for Today
  const notedArrivals = reservations.filter(
    r => r.checkIn === TODAY && r.status !== 'CANCELLED' && r.specialRequests && r.specialRequests.length > 0
  );

  const todayDepartures = reservations.filter(r => r.checkOut === TODAY && r.status !== 'CANCELLED');
  const departuresDue = todayDepartures.length;
  const departuresSettled = todayDepartures.filter(r => r.status === 'CHECKED_OUT').length;
  const departuresPending = todayDepartures.filter(r => r.status === 'CHECKED_IN' || r.status === 'RESERVED').length;

  const occupiedCount = rooms.filter(r => r.isOccupied).length;
  const occupancyPercent = rooms.length ? ((occupiedCount / rooms.length) * 100).toFixed(1) : '0.0';
  const currentDrawerTotal = cashRegister.startingFloat + cashRegister.cashCollected;

  // Dynamic 7-Day Revenue & Occupancy Trend derived from reservations
  const daysOfWeek = [
    { day: 'Mon', date: '2026-09-21' },
    { day: 'Tue', date: '2026-09-22' },
    { day: 'Wed', date: '2026-09-23' },
    { day: 'Thu', date: '2026-09-24' },
    { day: 'Fri', date: '2026-09-25' },
    { day: 'Sat', date: '2026-09-26' },
    { day: 'Sun', date: '2026-09-27' },
  ];

  const totalRoomsCount = rooms.length || 8;

  const weeklyTrend = daysOfWeek.map(({ day, date }) => {
    let dailyRevenue = 0;
    let occupiedRoomsForDay = 0;

    reservations.forEach(res => {
      if (res.status === 'CANCELLED') return;
      if (res.checkIn <= date && date < res.checkOut) {
        occupiedRoomsForDay++;
        const checkInDate = new Date(res.checkIn);
        const checkOutDate = new Date(res.checkOut);
        const diffDays = Math.max(1, Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24)));
        const nightlyRate = (res.totalAmount || 0) / diffDays;
        dailyRevenue += nightlyRate;
      }
    });

    const occupancy = Math.round((occupiedRoomsForDay / totalRoomsCount) * 100);

    return {
      day,
      revenue: Math.round(dailyRevenue),
      occupancy
    };
  });

  // Dynamic Channel Mix derived from reservations
  const totalActive = activeReservations.length;
  const channelCounts = activeReservations.reduce((acc, r) => {
    const source = r.source || 'Direct Walk-in';
    let category = 'Direct Walk-In';
    if (source.includes('Booking') || source.includes('Agoda') || source.includes('MakeMyTrip') || source.includes('OTA')) {
      category = 'OTAs';
    } else if (source.includes('Web') || source.includes('Direct Web')) {
      category = 'Direct Website';
    } else if (source.includes('Corp') || source.includes('Corporate')) {
      category = 'Corporate';
    }
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const channelMix = [
    { name: 'Direct Walk-In', value: totalActive ? Math.round(((channelCounts['Direct Walk-In'] || 0) / totalActive) * 100) : 40, color: 'var(--chart-1)' },
    { name: 'OTAs (Booking/Agoda)', value: totalActive ? Math.round(((channelCounts['OTAs'] || 0) / totalActive) * 100) : 35, color: 'var(--primary)' },
    { name: 'Direct Website', value: totalActive ? Math.round(((channelCounts['Direct Website'] || 0) / totalActive) * 100) : 15, color: 'var(--chart-4)' },
    { name: 'Corporate Accounts', value: totalActive ? Math.round(((channelCounts['Corporate'] || 0) / totalActive) * 100) : 10, color: 'var(--chart-3)' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 text-left pb-8">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Front Desk Operations &amp; Analytics
          </h1>
          <p className="text-xs text-[var(--muted-foreground)]">
            Real-time hotel performance metrics &amp; KPI insights • Active Shift: {cashRegister.activeReceptionist}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <DatePicker value={selectedDate} onChange={setSelectedDate} />
          <Button
            size="sm"
            onClick={() => openNewReservation()}
            className="bg-[var(--primary)] text-white shadow-sm font-semibold gap-1.5"
          >
            <Plus className="w-4 h-4" /> Quick Walk-In
          </Button>
        </div>
      </div>

      {/* FESTIVAL ALERT STRIP (READ-ONLY, TODAY & 1-3 DAYS WINDOW) */}
      {nextEvent && nextEvent.daysUntil >= 0 && nextEvent.daysUntil <= 3 && (
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl px-4 py-2 flex items-center gap-2.5 shadow-2xs">
          <PartyPopper className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
          <span className="text-xs font-bold text-[var(--foreground)]">
            {nextEvent.daysUntil === 0 ? "Today's Festival" : "Upcoming Festival"}: {nextEvent.name}
          </span>
          <span className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
            {nextEvent.statusText}
          </span>
        </div>
      )}

      {/* NOTED & VIP ARRIVALS ALERT STRIP */}
      {notedArrivals.length > 0 && (
        <div
          onClick={() => setIsTaggedDialogOpen(true)}
          className="bg-amber-500/10 border border-amber-500/30 hover:border-amber-500/60 rounded-xl p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all cursor-pointer shadow-xs hover:shadow-md group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  Today's VIP &amp; Noted Arrivals
                </span>
                <span className="bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  {notedArrivals.length} Guests
                </span>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                {notedArrivals.map(g => g.guestName).join(', ')} arriving today with special requests ({notedArrivals.flatMap(g => g.specialRequests || []).join(', ')})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 shrink-0 self-end sm:self-auto group-hover:translate-x-1 transition-transform">
            <span>View Tagged Guests Table</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* LEAN & SIMPLE KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Arrivals */}
        <Card className="border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/40 transition-colors shadow-2xs">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] font-medium">
              <span>Today's Arrivals</span>
              <CalendarCheck className="w-4 h-4 text-[var(--muted-foreground)]" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            <div className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
              {arrivalsExpected} <span className="text-xs font-normal text-[var(--muted-foreground)]">Expected</span>
            </div>
            <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] font-medium">
              <span>{arrivalsCheckedIn} Checked In</span>
              <span>{arrivalsPending} Pending</span>
            </div>
            <div className="w-full h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
              <div
                className="bg-[var(--primary)] h-full transition-all duration-300 rounded-full"
                style={{ width: `${arrivalsExpected > 0 ? (arrivalsCheckedIn / arrivalsExpected) * 100 : 0}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Today's Departures */}
        <Card className="border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/40 transition-colors shadow-2xs">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] font-medium">
              <span>Today's Departures</span>
              <CalendarX className="w-4 h-4 text-[var(--muted-foreground)]" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            <div className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
              {departuresDue} <span className="text-xs font-normal text-[var(--muted-foreground)]">Due</span>
            </div>
            <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] font-medium">
              <span>{departuresSettled} Settled</span>
              <span>{departuresPending} Overdue</span>
            </div>
            <div className="w-full h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
              <div
                className="bg-[var(--primary)] h-full transition-all duration-300 rounded-full"
                style={{ width: `${departuresDue > 0 ? (departuresSettled / departuresDue) * 100 : 0}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Occupancy Rate */}
        <Card className="border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/40 transition-colors shadow-2xs">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] font-medium">
              <span>Occupancy Rate</span>
              <Building className="w-4 h-4 text-[var(--muted-foreground)]" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-[var(--foreground)]">{occupancyPercent}%</span>
              <span className="text-xs text-[var(--muted-foreground)] font-medium flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3 text-[var(--primary)]" /> +5.2%
              </span>
            </div>
            <div className="text-xs text-[var(--muted-foreground)] font-medium">
              <span className="font-semibold text-[var(--foreground)]">{occupiedCount}</span> of {rooms.length} Rooms Occupied
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Cash Float */}
        <Card className="border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/40 transition-colors shadow-2xs">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] font-medium">
              <span>Current Cash Float</span>
              <DollarSign className="w-4 h-4 text-[var(--muted-foreground)]" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            <div className="text-2xl font-bold font-mono tracking-tight text-[var(--foreground)]">
              {formatCurrency(currentDrawerTotal)}
            </div>
            <div className="text-xs text-[var(--muted-foreground)] font-medium">
              Active Shift Drawer Cash
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROW 1: RECHARTS REVENUE TREND + BOOKING SOURCE MIX */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Revenue & Occupancy Recharts (2 Cols) */}
        <Card className="lg:col-span-2">
          <CardHeader className="p-5 pb-3 border-b border-[var(--border)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[var(--primary)]" />
                  7-Day Revenue &amp; Occupancy Trend
                </CardTitle>
                <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                  Daily revenue vs occupancy overview
                </p>
              </div>

              {/* Chart Options Selector Pills */}
              <div className="flex items-center gap-2">
                <div className="bg-[var(--muted)] p-0.5 rounded-lg flex items-center text-xs">
                  <button
                    onClick={() => setChartType('combo')}
                    className={`px-2.5 py-1 rounded-md font-medium text-[11px] transition-all cursor-pointer ${
                      chartType === 'combo'
                        ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs font-semibold'
                        : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                    }`}
                  >
                    Combo (Bar+Line)
                  </button>
                  <button
                    onClick={() => setChartType('bar')}
                    className={`px-2.5 py-1 rounded-md font-medium text-[11px] transition-all cursor-pointer ${
                      chartType === 'bar'
                        ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs font-semibold'
                        : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                    }`}
                  >
                    Bar Chart
                  </button>
                  <button
                    onClick={() => setChartType('area')}
                    className={`px-2.5 py-1 rounded-md font-medium text-[11px] transition-all cursor-pointer ${
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
                <span className="text-[var(--muted-foreground)]">Revenue (₹)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-[var(--muted-foreground)]">Occupancy (%)</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-3 sm:p-5 pt-4">
            <div className="h-52 sm:h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'combo' ? (
                  <ComposedChart data={weeklyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
                    <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                    <YAxis yAxisId="left" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                    <YAxis yAxisId="right" orientation="right" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} unit="%" domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="var(--primary)" radius={[6, 6, 0, 0]} maxBarSize={36} />
                    <Line yAxisId="right" type="monotone" dataKey="occupancy" name="Occupancy" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', stroke: 'var(--card)', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </ComposedChart>
                ) : chartType === 'bar' ? (
                  <BarChart data={weeklyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
                    <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                    <YAxis yAxisId="left" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                    <YAxis yAxisId="right" orientation="right" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} unit="%" domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={28} />
                    <Bar yAxisId="right" dataKey="occupancy" name="Occupancy" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  </BarChart>
                ) : (
                  <AreaChart data={weeklyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
                    <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                    <YAxis yAxisId="left" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                    <YAxis yAxisId="right" orientation="right" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} unit="%" domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                    <Line yAxisId="right" type="monotone" dataKey="occupancy" name="Occupancy" stroke="#10b981" strokeWidth={2.5} strokeDasharray="3 3" dot={{ r: 4, fill: '#10b981' }} />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Booking Channels Mix Donut (1 Col) */}
        <Card>
          <CardHeader className="p-5 pb-2 border-b border-[var(--border)]">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-[var(--primary)]" />
              Booking Source Mix
            </CardTitle>
            <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
              Current month channel breakdown
            </p>
          </CardHeader>
          <CardContent className="p-5">
            {/* Recharts Pie Chart Donut */}
            <div className="h-44 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelMix}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {channelMix.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="var(--card)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Donut Text */}
              <div className="absolute flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-xl font-bold text-[var(--foreground)]">{totalActive}</span>
                <span className="text-[10px] text-[var(--muted-foreground)]">Bookings</span>
              </div>
            </div>

            {/* Legend List */}
            <div className="space-y-2 mt-2 pt-3 border-t border-[var(--border)]">
              {channelMix.map((c, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                    <span className="text-[var(--foreground)] font-medium">{c.name}</span>
                  </div>
                  <span className="font-bold text-[var(--foreground)] font-mono">{c.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROW 2: ROOM CATEGORY YIELD + LIVE HOUSEKEEPING STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Category Yield & ADR Recharts Horizontal Bar */}
        <Card>
          <CardHeader className="p-5 pb-2 border-b border-[var(--border)]">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[var(--primary)]" />
              Room Category Performance &amp; ADR
            </CardTitle>
            <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
              Occupancy % per room category
            </p>
          </CardHeader>
          <CardContent className="p-5">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={roomCategories} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} horizontal={false} />
                  <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} domain={[0, 100]} unit="%" />
                  <YAxis type="category" dataKey="category" stroke="var(--foreground)" fontSize={11} tickLine={false} width={100} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="occupancy" name="Occupancy Rate" fill="var(--primary)" radius={[0, 6, 6, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Live Housekeeping & Room Turnaround */}
        <Card>
          <CardHeader className="p-5 pb-2 border-b border-[var(--border)]">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Live Housekeeping &amp; Turnaround Status
            </CardTitle>
            <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
              Visual room readiness distribution across 8 rooms
            </p>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {/* Status Indicator Badges */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">5</p>
                <p className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">Clean</p>
              </div>
              <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <p className="text-indigo-600 dark:text-indigo-400 font-bold text-lg">1</p>
                <p className="text-[10px] text-indigo-700 dark:text-indigo-300 font-medium">Cleaning</p>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-amber-600 dark:text-amber-400 font-bold text-lg">1</p>
                <p className="text-[10px] text-amber-700 dark:text-amber-300 font-medium">Dirty</p>
              </div>
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <p className="text-rose-600 dark:text-rose-400 font-bold text-lg">1</p>
                <p className="text-[10px] text-rose-700 dark:text-rose-300 font-medium">OOO</p>
              </div>
            </div>

            {/* Room Pills Overview */}
            <div className="pt-2 border-t border-[var(--border)]">
              <p className="text-xs font-semibold text-[var(--muted-foreground)] mb-2.5">Room Distribution Pills:</p>
              <div className="flex flex-wrap gap-2 text-xs">
                {['101', '102', '103', '301', '302'].map(r => (
                  <span key={r} className="px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-medium border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Room {r}
                  </span>
                ))}
                <span className="px-2.5 py-1 rounded-md bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-medium border border-indigo-500/30 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-indigo-500" /> Room 202
                </span>
                <span className="px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 font-medium border border-amber-500/30 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-500" /> Room 201
                </span>
                <span className="px-2.5 py-1 rounded-md bg-rose-500/15 text-rose-700 dark:text-rose-300 font-medium border border-rose-500/30 flex items-center gap-1">
                  <Wrench className="w-3 h-3 text-rose-500" /> Room 401
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TAGGED & NOTED GUESTS DIALOG */}
      <Dialog open={isTaggedDialogOpen} onOpenChange={setIsTaggedDialogOpen}>
        <DialogContent className="max-w-3xl w-full mx-3 sm:mx-auto bg-[var(--card)] text-[var(--card-foreground)] border-[var(--border)] p-4 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  Today's VIP &amp; Noted Arrivals
                  <span className="bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs px-2.5 py-0.5 rounded-full font-bold">
                    {notedArrivals.length} Guests
                  </span>
                </DialogTitle>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  Guests arriving on {TODAY} with special preferences, room requests, or notes.
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
                {notedArrivals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[var(--muted-foreground)]">
                      No arriving guests with special notes today.
                    </td>
                  </tr>
                ) : (
                  notedArrivals.map(res => (
                    <tr key={res.id} className="hover:bg-[var(--muted)]/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(res.guestName)}`}
                            alt={res.guestName}
                            className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-[var(--foreground)] flex items-center gap-1.5">
                              {res.guestName}
                              <span className="bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-500/30">
                                TAGGED
                              </span>
                            </div>
                            <div className="text-[11px] text-[var(--muted-foreground)] flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-[var(--muted-foreground)]" /> {res.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-[var(--foreground)]">Room {res.roomNumber}</div>
                        <div className="text-[11px] text-[var(--muted-foreground)]">{res.roomType}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-[var(--foreground)]">{res.eta || '12:00 PM'}</div>
                        <span
                          className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            res.status === 'CHECKED_IN'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
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
                            openFolio(res);
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
    </div>
  );
};
