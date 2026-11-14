export interface KPISummary {
  occupancyPercentage: number;
  occupiedRooms: number;
  totalRooms: number;
  salableRooms: number;
  arrivalsExpected: number;
  arrivalsCheckedIn: number;
  arrivalsPending: number;
  departuresDue: number;
  departuresSettled: number;
  departuresPending: number;
  dailyRoomRevenue: number;
  adr: number;
  revpar: number;
  trevpar: number;
  alos: number;
}

export interface TrendDayPoint {
  day: string;
  date: string;
  revenue: number;
  occupancy: number;
  adr: number;
}

export interface ChannelMixItem {
  name: string;
  sourceKey: string;
  count: number;
  percentage: number;
  revenue: number;
  color: string;
}

export interface HousekeepingRoomItem {
  roomId: number;
  roomNumber: string;
  categoryName: string;
  status: 'CLEAN' | 'CLEANING' | 'DIRTY' | 'OOO' | string;
}

export interface HousekeepingSummary {
  cleanCount: number;
  cleaningCount: number;
  dirtyCount: number;
  oooCount: number;
  rooms: HousekeepingRoomItem[];
}

export interface CategoryPerformance {
  categoryId: number;
  category: string;
  occupancy: number;
  adr: number;
  totalRooms: number;
  occupied: number;
}

export interface VIPArrivalGuest {
  reservationId: number;
  reservationCode: string;
  guestName: string;
  phone: string;
  roomNumber: string | null;
  categoryName: string;
  eta: string | null;
  status: string;
  vipStatus: string;
  specialRequests: string[];
  folioId: number | null;
}

export interface DashboardAnalyticsPayload {
  targetDate: string;
  outletId: number;
  outletName: string;
  kpis: KPISummary;
  weeklyTrend: TrendDayPoint[];
  channelMix: ChannelMixItem[];
  totalActiveBookings: number;
  housekeeping: HousekeepingSummary;
  categoryPerformance: CategoryPerformance[];
  vipArrivals: VIPArrivalGuest[];
}

