// Dashboard wrappers & KPI tickers
export { KpiNumberTicker } from './KpiNumberTicker';
export type { KpiNumberTickerProps } from './KpiNumberTicker';

export { VisxComboTrendChart } from './VisxComboTrendChart';
export type { VisxComboTrendChartProps, TrendDataPoint } from './VisxComboTrendChart';

export { VisxDonutChart } from './VisxDonutChart';
export type { VisxDonutChartProps, ChannelMixItem } from './VisxDonutChart';

export { VisxBarChart } from './VisxBarChart';
export type { VisxHorizontalBarChartProps, CategoryPerformanceItem } from './VisxBarChart';

export { VisxHeatmapChart } from './VisxHeatmapChart';
export type { VisxHeatmapChartProps, HeatmapColumn, HeatmapBin } from './VisxHeatmapChart';

export { ReportingChart } from './ReportingChart';
export type { ReportingChartProps, ChartSeriesMeta } from './ReportingChart';

// Modular ORM-inspired Chart Architecture Primitives
export { AreaChart } from './area-chart';
export { BarChart } from './bar-chart';
export { LineChart } from './line-chart';
export { PieChart } from './pie-chart';
export { RingChart } from './ring-chart';
export { Gauge } from './gauge';
export { LineSparkline, AreaSparkline, BarSparkline, useSparklineHover } from './sparkline';
export { HeatmapChart, HeatmapLegend, HeatmapTooltip } from './heatmap';
