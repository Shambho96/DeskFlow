export type ChartType = 'bar' | 'line' | 'area' | 'pie' | 'donut' | 'table';
export type GroupBy = 'daily' | 'weekly' | 'monthly';
export type DatePreset =
  | 'today'
  | 'yesterday'
  | 'last_7_days'
  | 'last_14_days'
  | 'last_30_days'
  | 'month_to_date'
  | 'this_month'
  | 'last_month'
  | 'last_3_months'
  | 'last_6_months'
  | 'year_to_date'
  | 'last_1_year'
  | 'custom';

export type DashboardVisibility = 'PRIVATE' | 'OUTLET_SHARED' | 'SPECIFIC_MEMBERS';

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface ChartSeries {
  name: string;
  metric_key: string;
  data: ChartDataPoint[];
  color: string;
}

export interface ReportMeta {
  report_type: string;
  total_rows: number;
  date_from: string;
  date_to: string;
  group_by: string;
  outlet_names: string[];
  summary: Record<string, number>;
}

export interface ReportExecutionPayload {
  meta: ReportMeta;
  rows: Record<string, any>[];
  chart_series: ChartSeries[];
}

export interface CustomReportCard {
  id: number;
  dashboard_id: number;
  client_id: number;
  created_by_user_id: number;
  title: string;
  report_type: string;
  domain?: string;
  chart_type: ChartType;
  group_by: GroupBy;
  date_preset: DatePreset;
  date_from?: string | null;
  date_to?: string | null;
  selected_metrics: string[];
  outlet_ids: number[];
  filters: Record<string, any>;
  display_order: number;
  card_width: number;
  created_at: string;
}

export interface CustomDashboard {
  id: number;
  client_id: number;
  created_by_user_id: number;
  outlet_id?: number | null;
  name: string;
  description?: string | null;
  icon: string;
  visibility: DashboardVisibility;
  shared_members: Array<{ user_id: number; role: 'VIEWER' | 'EDITOR'; email?: string; name?: string }>;
  is_default: boolean;
  display_order: number;
  card_count: number;
  cards: CustomReportCard[];
  created_at: string;
}

export interface MetricDefinition {
  key: string;
  label: string;
  category: 'REVENUE' | 'YIELD' | 'OPERATIONS' | 'PAYMENT';
  unit: '₹' | '%' | 'count';
  color: string;
}

export const AVAILABLE_METRICS: MetricDefinition[] = [
  // Revenue
  { key: 'room_revenue', label: 'Room Revenue', category: 'REVENUE', unit: '₹', color: '#7c3aed' },
  { key: 'total_revenue', label: 'Total Revenue', category: 'REVENUE', unit: '₹', color: '#2563eb' },
  { key: 'fb_revenue', label: 'F&B Revenue', category: 'REVENUE', unit: '₹', color: '#f59e0b' },
  { key: 'other_revenue', label: 'Other Revenue', category: 'REVENUE', unit: '₹', color: '#10b981' },
  { key: 'tax_collected', label: 'Tax Collected', category: 'REVENUE', unit: '₹', color: '#6b7280' },
  
  // Yield & Performance
  { key: 'occupancy_pct', label: 'Occupancy Rate', category: 'YIELD', unit: '%', color: '#06b6d4' },
  { key: 'adr', label: 'Average Daily Rate (ADR)', category: 'YIELD', unit: '₹', color: '#f97316' },
  { key: 'revpar', label: 'RevPAR', category: 'YIELD', unit: '₹', color: '#84cc16' },
  
  // Payments
  { key: 'cash_collected', label: 'Cash Collected', category: 'PAYMENT', unit: '₹', color: '#14b8a6' },
  { key: 'upi_collected', label: 'UPI / Digital', category: 'PAYMENT', unit: '₹', color: '#8b5cf6' },
  { key: 'card_collected', label: 'Card Transactions', category: 'PAYMENT', unit: '₹', color: '#ec4899' },
  
  // Operations
  { key: 'arrivals_count', label: 'Arrivals Count', category: 'OPERATIONS', unit: 'count', color: '#3b82f6' },
  { key: 'departures_count', label: 'Departures Count', category: 'OPERATIONS', unit: 'count', color: '#ef4444' },
  { key: 'active_bookings', label: 'Active Bookings', category: 'OPERATIONS', unit: 'count', color: '#a855f7' },
];

export const REPORT_TYPE_TEMPLATES = [
  {
    code: 'ROOM_REVENUE',
    name: 'Room Revenue Analysis',
    description: 'Lodging room charges and net room yield over time',
    defaultMetrics: ['room_revenue'],
    defaultChart: 'bar' as ChartType,
  },
  {
    code: 'DAILY_REVENUE',
    name: 'Total Revenue & F&B Mix',
    description: 'Aggregated revenue comparison across Room, F&B, and other folios',
    defaultMetrics: ['room_revenue', 'fb_revenue', 'total_revenue'],
    defaultChart: 'bar' as ChartType,
  },
  {
    code: 'OCCUPANCY',
    name: 'Occupancy Rate & Pace',
    description: 'Occupancy percentage curve and available room utilization',
    defaultMetrics: ['occupancy_pct'],
    defaultChart: 'line' as ChartType,
  },
  {
    code: 'ADR_REVPAR',
    name: 'ADR & RevPAR Yield Curve',
    description: 'Average Daily Rate compared against Revenue Per Available Room',
    defaultMetrics: ['adr', 'revpar'],
    defaultChart: 'line' as ChartType,
  },
  {
    code: 'PAYMENT_METHODS',
    name: 'Payment Methods Distribution',
    description: 'Cash vs UPI vs Card front desk settlement split',
    defaultMetrics: ['cash_collected', 'upi_collected', 'card_collected'],
    defaultChart: 'donut' as ChartType,
  },
  {
    code: 'ARRIVALS_DEPARTURES',
    name: 'Arrivals & Departures Movement',
    description: 'Daily guest inflow and checkout pacing volume',
    defaultMetrics: ['arrivals_count', 'departures_count'],
    defaultChart: 'bar' as ChartType,
  },
];
