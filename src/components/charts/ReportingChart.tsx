import React, { useState, useMemo, useCallback } from 'react';
import { ParentSize } from '@visx/responsive';
import { scaleBand, scaleLinear } from '@visx/scale';
import { Group } from '@visx/group';
import { GridRows } from '@visx/grid';
import { LinePath, AreaClosed } from '@visx/shape';
import { LinearGradient } from '@visx/gradient';
import { curveMonotoneX } from '@visx/curve';
import { localPoint } from '@visx/event';
import { pie as d3Pie, arc as d3Arc } from 'd3-shape';
import { motion, AnimatePresence } from 'motion/react';
import NumberFlow from '@number-flow/react';
import { AVAILABLE_METRICS } from '../../types/reporting';

export interface ChartSeriesMeta {
  metric_key: string;
  name: string;
  color: string;
}

export interface ReportingChartProps {
  chartType: 'bar' | 'line' | 'area' | 'pie' | 'donut';
  rows: Array<Record<string, any>>;
  series: ChartSeriesMeta[];
  summaryMeta?: Record<string, number>;
  height?: number;
  formatXLabel?: (period: any) => string;
  formatTooltipLabel?: (period: any, row?: any) => string;
  formatValue?: (val: number, key: string) => string;
  className?: string;
  showFooterLegend?: boolean;
}

const defaultMargin = { top: 18, right: 28, bottom: 48, left: 62 };

/* ─── TIME SERIES & CATEGORICAL INNER CHART ─── */
const CartesianChartInner: React.FC<{
  chartType: 'bar' | 'line' | 'area';
  rows: Array<Record<string, any>>;
  series: ChartSeriesMeta[];
  width: number;
  height: number;
  formatXLabel?: (period: any) => string;
  formatTooltipLabel?: (period: any, row?: any) => string;
}> = ({
  chartType,
  rows,
  series,
  width,
  height,
  formatXLabel = val => String(val),
  formatTooltipLabel = val => String(val),
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const xMax = Math.max(0, width - defaultMargin.left - defaultMargin.right);
  const yMax = Math.max(0, height - defaultMargin.top - defaultMargin.bottom);

  // X scale across time periods
  const xScale = useMemo(
    () =>
      scaleBand<string>({
        range: [0, xMax],
        domain: rows.map(r => String(r.period)),
        padding: chartType === 'bar' ? 0.28 : 0.1,
      }),
    [rows, xMax, chartType]
  );

  // Sub-scale for multiple bars within one period
  const subBarScale = useMemo(
    () =>
      scaleBand<string>({
        range: [0, xScale.bandwidth()],
        domain: series.map(s => s.metric_key),
        padding: 0.12,
      }),
    [series, xScale]
  );

  // Maximum value across all series
  const yMaxVal = useMemo(() => {
    let globalMax = 0;
    rows.forEach(r => {
      series.forEach(s => {
        const v = Number(r[s.metric_key] || 0);
        if (v > globalMax) globalMax = v;
      });
    });
    return Math.max(10, Math.ceil(globalMax * 1.15));
  }, [rows, series]);

  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [yMax, 0],
        domain: [0, yMaxVal],
        nice: true,
      }),
    [yMaxVal, yMax]
  );

  const bandWidth = xScale.bandwidth();

  // Pointer move handler with index de-duplication
  const handlePointerMove = useCallback(
    (event: React.PointerEvent<SVGRectElement>) => {
      const point = localPoint(event);
      if (!point) return;
      const x = point.x - defaultMargin.left;
      const step = xScale.step();
      const index = Math.floor(x / step);
      if (index >= 0 && index < rows.length) {
        setHoverIndex(prev => (prev === index ? prev : index));
      }
    },
    [rows.length, xScale]
  );

  const handlePointerLeave = useCallback(() => {
    setHoverIndex(null);
  }, []);

  const activeRow = hoverIndex !== null ? rows[hoverIndex] : null;

  // Uniform, consistent integer stride X-axis ticks (never non-integer step jitter)
  const xTicks = useMemo(() => {
    if (rows.length === 0) return [];
    // Ensure at least 80px between tick labels for enhanced readability
    const maxTicks = Math.max(2, Math.floor(xMax / 80));
    if (rows.length <= maxTicks) {
      return rows.map((r, i) => ({ row: r, index: i }));
    }

    // Determine an aesthetically clean integer stride
    const rawStride = Math.max(1, Math.ceil(rows.length / maxTicks));
    const niceStrides = [1, 2, 3, 4, 5, 7, 10, 14, 15, 30, 60];
    const stride = niceStrides.find(s => s >= rawStride) || rawStride;

    const result: Array<{ row: (typeof rows)[0]; index: number }> = [];
    for (let i = 0; i < rows.length; i += stride) {
      result.push({ row: rows[i], index: i });
    }
    return result;
  }, [rows, xMax]);

  if (width < 40 || height < 40 || rows.length === 0 || series.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-xs text-[var(--muted-foreground)]">
        No report data available
      </div>
    );
  }

  // Active X coordinate for crosshair and tooltip
  const activeX =
    activeRow != null
      ? (xScale(String(activeRow.period)) || 0) + bandWidth / 2
      : 0;

  // Clamped X coordinate for date pill to ensure it never overflows chart bounds
  const pillX = Math.max(40, Math.min(xMax - 40, activeX));

  const tooltipX = Math.min(
    width - 190,
    Math.max(10, defaultMargin.left + activeX - 85)
  );

  return (
    <div
      onPointerLeave={handlePointerLeave}
      className="relative w-full h-full select-none"
    >
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          {series.map(s => (
            <LinearGradient
              key={`grad-${s.metric_key}`}
              id={`area-grad-${s.metric_key}`}
              from={s.color}
              to={s.color}
              fromOpacity={0.4}
              toOpacity={0.02}
            />
          ))}
        </defs>

        <Group left={defaultMargin.left} top={defaultMargin.top}>
          {/* Subtle Grid Rows */}
          <GridRows
            scale={yScale}
            width={xMax}
            stroke="var(--border)"
            strokeDasharray="3 3"
            strokeOpacity={0.45}
            numTicks={5}
          />

          {/* Left Y-Axis Ticks (Formatted in Indian Numbering System: e.g. 15,000, 1 L, 1 Cr) */}
          {yScale.ticks(4).map(tick => {
            const y = yScale(tick);
            let label = String(tick);
            if (tick >= 10000000) {
              const cr = tick / 10000000;
              label = `${cr % 1 === 0 ? cr : cr.toFixed(1)} Cr`;
            } else if (tick >= 100000) {
              const lk = tick / 100000;
              label = `${lk % 1 === 0 ? lk : lk.toFixed(1)} L`;
            } else {
              label = Number(tick).toLocaleString('en-IN');
            }
            return (
              <text
                key={`y-tick-${tick}`}
                x={-12}
                y={y + 4}
                fill="var(--muted-foreground)"
                fontSize={12}
                fontWeight={500}
                textAnchor="end"
                className="font-mono"
              >
                {label}
              </text>
            );
          })}

          {/* Bottom X-Axis Ticks with Collision Prevention */}
          {xTicks.map(({ row: r, index: i }) => {
            const x = (xScale(String(r.period)) || 0) + bandWidth / 2;
            const isCoveredByPill =
              activeRow != null && Math.abs(x - pillX) < 38;

            return (
              <text
                key={`x-label-${r.period}-${i}`}
                x={x}
                y={yMax + 20}
                fill={isCoveredByPill ? 'transparent' : 'var(--muted-foreground)'}
                fontSize={12}
                fontWeight={500}
                textAnchor="middle"
                className="transition-opacity duration-150 select-none"
              >
                {formatXLabel(r.period)}
              </text>
            );
          })}

          {/* Area Chart View */}
          {chartType === 'area' && (
            <Group>
              {series.map(s => (
                <React.Fragment key={`area-frag-${s.metric_key}`}>
                  <AreaClosed
                    data={rows}
                    x={d => (xScale(String(d.period)) || 0) + bandWidth / 2}
                    y={d => yScale(Number(d[s.metric_key] || 0))}
                    yScale={yScale}
                    curve={curveMonotoneX}
                    fill={`url(#area-grad-${s.metric_key})`}
                  />
                  <LinePath
                    data={rows}
                    x={d => (xScale(String(d.period)) || 0) + bandWidth / 2}
                    y={d => yScale(Number(d[s.metric_key] || 0))}
                    curve={curveMonotoneX}
                    stroke={s.color}
                    strokeWidth={2.5}
                  />
                </React.Fragment>
              ))}
            </Group>
          )}

          {/* Line Chart View */}
          {chartType === 'line' && (
            <Group>
              {series.map(s => (
                <React.Fragment key={`line-frag-${s.metric_key}`}>
                  <LinePath
                    data={rows}
                    x={d => (xScale(String(d.period)) || 0) + bandWidth / 2}
                    y={d => yScale(Number(d[s.metric_key] || 0))}
                    curve={curveMonotoneX}
                    stroke={s.color}
                    strokeWidth={2.5}
                  />
                  {rows.map((d, dIdx) => {
                    const cx = (xScale(String(d.period)) || 0) + bandWidth / 2;
                    const cy = yScale(Number(d[s.metric_key] || 0));
                    return (
                      <circle
                        key={`dot-${s.metric_key}-${dIdx}`}
                        cx={cx}
                        cy={cy}
                        stroke="var(--card)"
                        strokeWidth={1.5}
                        fill={s.color}
                        r={3}
                      />
                    );
                  })}
                </React.Fragment>
              ))}
            </Group>
          )}

          {/* Grouped Bar Chart View */}
          {chartType === 'bar' && (
            <Group>
              {rows.map(r => {
                const groupX = xScale(String(r.period)) || 0;
                const isHovered = activeRow?.period === r.period;

                return (
                  <Group key={`bar-group-${r.period}`}>
                    {series.map(s => {
                      const barX = groupX + (subBarScale(s.metric_key) || 0);
                      const barW = Math.max(3, subBarScale.bandwidth());
                      const val = Number(r[s.metric_key] || 0);
                      const barH = Math.max(0, yMax - yScale(val));

                      return (
                        <motion.rect
                          key={`sub-bar-${r.period}-${s.metric_key}`}
                          x={barX}
                          y={yScale(val)}
                          width={barW}
                          height={barH}
                          fill={s.color}
                          rx={3}
                          animate={{
                            opacity: hoverIndex === null || isHovered ? 1 : 0.55,
                            scaleY: isHovered ? 1.02 : 1,
                          }}
                          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                          style={{ transformOrigin: `0px ${yMax}px` }}
                        />
                      );
                    })}
                  </Group>
                );
              })}
            </Group>
          )}

          {/* Smooth Gliding Crosshair Line */}
          {activeRow && (
            <motion.line
              x1={activeX}
              x2={activeX}
              y1={0}
              y2={yMax}
              stroke="var(--foreground)"
              strokeOpacity={0.25}
              strokeDasharray="3 3"
              pointerEvents="none"
              animate={{ x1: activeX, x2: activeX }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}

          {/* Halo Glow Dots on Line/Area Points for Active Row */}
          {activeRow && (chartType === 'line' || chartType === 'area') && (
            <Group pointerEvents="none">
              {series.map(s => {
                const val = Number(activeRow[s.metric_key] || 0);
                const cy = yScale(val);
                return (
                  <g
                    key={`halo-${s.metric_key}`}
                    transform={`translate(${activeX}, ${cy})`}
                    style={{
                      transition: 'transform 0.12s cubic-bezier(0.16, 1, 0.3, 1)',
                      willChange: 'transform',
                    }}
                  >
                    <circle r={10} fill={s.color} opacity={0.25} />
                    <circle r={4.5} fill={s.color} stroke="var(--card)" strokeWidth={2} />
                  </g>
                );
              })}
            </Group>
          )}

          {/* Spring-Gliding Date Pill at Bottom of Crosshair */}
          {activeRow && (
            <g
              transform={`translate(${pillX}, 0)`}
              style={{
                transition: 'transform 0.12s cubic-bezier(0.16, 1, 0.3, 1)',
                willChange: 'transform',
              }}
              pointerEvents="none"
            >
              <rect
                x={-38}
                y={yMax + 4}
                width={76}
                height={24}
                rx={6}
                fill="var(--foreground)"
              />
              <text
                x={0}
                y={yMax + 20}
                textAnchor="middle"
                fill="var(--background)"
                fontSize={11.5}
                fontWeight={700}
                className="font-mono select-none"
              >
                {formatXLabel(activeRow.period)}
              </text>
            </g>
          )}

          {/* Full-Plot Transparent Interactive Overlay */}
          <rect
            x={0}
            y={0}
            width={xMax}
            height={yMax}
            fill="transparent"
            onPointerMove={handlePointerMove}
            className="cursor-crosshair"
          />
        </Group>
      </svg>

      {/* Floating Gliding Tooltip via Spring Physics */}
      <AnimatePresence>
        {activeRow && hoverIndex !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: tooltipX,
            }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{
              x: { type: 'spring', stiffness: 450, damping: 30 },
              opacity: { duration: 0.15 },
              scale: { duration: 0.15 },
            }}
            style={{
              top: defaultMargin.top + 6,
              position: 'absolute',
            }}
            className="pointer-events-none z-20 bg-[var(--popover)] border border-[var(--border)] text-[var(--popover-foreground)] p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-40 backdrop-blur-md"
          >
            <p className="font-bold border-b border-[var(--border)] pb-1 mb-1 text-xs sm:text-[13px] text-[var(--foreground)]">
              {formatTooltipLabel(activeRow.period, activeRow)}
            </p>
            {series.map(s => {
              const val = Number(activeRow[s.metric_key] || 0);
              const isPct = s.metric_key.includes('occupancy') || s.metric_key.includes('pct');
              const isRev = s.metric_key.includes('revenue') || s.metric_key.includes('adr') || s.metric_key.includes('revpar');
              return (
                <div
                  key={`tip-${s.metric_key}`}
                  className="flex items-center justify-between gap-3 text-xs sm:text-[13px] font-semibold"
                >
                  <span className="flex items-center gap-1.5 text-[var(--muted-foreground)]">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="truncate max-w-32">{s.name}:</span>
                  </span>
                  <span className="font-mono text-[var(--foreground)] inline-flex items-baseline font-bold text-xs sm:text-[13px]">
                    {isRev && <span className="mr-0.5">₹</span>}
                    <NumberFlow
                      value={val}
                      locales="en-IN"
                      format={
                        isPct
                          ? { minimumFractionDigits: 1, maximumFractionDigits: 1 }
                          : { maximumFractionDigits: 0 }
                      }
                      transformTiming={{ duration: 250, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
                    />
                    {isPct ? '%' : ''}
                  </span>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── METRIC HELPERS & COLOR GENERATORS ─── */
const getMetricDef = (key: string) => AVAILABLE_METRICS.find(m => m.key === key);
const getMetricUnit = (key: string): '₹' | '%' | 'count' | string => {
  const def = getMetricDef(key);
  if (def) return def.unit;
  if (key.includes('pct') || key.includes('occupancy')) return '%';
  if (key.includes('count') || key.includes('bookings') || key.includes('arrivals') || key.includes('departures')) return 'count';
  return '₹';
};

function getPeriodSliceColor(baseColor: string, index: number, total: number): string {
  if (total <= 1) return baseColor;
  try {
    let hex = (baseColor || '#7c3aed').replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    const hueDeg = Math.round(h * 360);
    const satPct = Math.min(100, Math.max(40, Math.round(s * 100)));
    const minL = 36;
    const maxL = 72;
    const stepL = total > 1 ? (maxL - minL) / (total - 1) : 0;
    const lightPct = Math.round(minL + index * stepL);

    return `hsl(${hueDeg}, ${satPct}%, ${lightPct}%)`;
  } catch {
    const fallbackPalette = [baseColor, '#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
    return fallbackPalette[index % fallbackPalette.length];
  }
}

/* ─── SINGLE DONUT & PIE INNER CHART ─── */
const PieDonutChartInner: React.FC<{
  chartType: 'pie' | 'donut';
  rows?: Array<Record<string, any>>;
  series: ChartSeriesMeta[];
  summaryMeta?: Record<string, number>;
  width: number;
  height: number;
  hoveredIdx: number | null;
  onHoverChange: (idx: number | null) => void;
  selectedIdx: number | null;
  onSelectChange: (idx: number | null) => void;
  formatXLabel?: (period: any) => string;
  formatTooltipLabel?: (period: any, row?: any) => string;
  formatValue?: (val: number, key: string) => string;
}> = ({
  chartType,
  rows = [],
  series,
  summaryMeta = {},
  width,
  height,
  hoveredIdx,
  onHoverChange,
  selectedIdx,
  onSelectChange,
  formatXLabel = val => String(val),
  formatTooltipLabel = val => String(val),
  formatValue = val => Number(val).toLocaleString('en-IN'),
}) => {
  // Check if metrics have incompatible units or are rates (e.g. currency vs count vs %)
  const areMetricsIncompatible = useMemo(() => {
    if (series.length <= 1) return false;
    const units = new Set(series.map(s => getMetricUnit(s.metric_key)));
    if (units.size > 1) return true;
    if (units.has('%')) return true;
    if (series.some(s => ['adr', 'revpar'].includes(s.metric_key))) return true;
    return false;
  }, [series]);

  const isDonut = chartType === 'donut';
  const radius = Math.min(width, height) / 2;
  const innerRadius = isDonut ? radius * 0.62 : 0;
  const outerRadius = radius * 0.88;

  // Single metric across multiple periods breakdown
  const isSingleMetricPeriodBreakdown = series.length === 1 && rows.length > 1;

  const pieData = useMemo(() => {
    if (series.length === 0) return [];

    if (isSingleMetricPeriodBreakdown) {
      return rows.map((r, i) => {
        const v = Number(r[series[0].metric_key] || 0);
        return {
          name: formatXLabel(r.period),
          metric_key: series[0].metric_key,
          value: Math.max(0.0001, v),
          realValue: v,
          color: getPeriodSliceColor(series[0].color, i, rows.length),
          fullLabel: formatTooltipLabel(r.period, r),
        };
      });
    }

    if (areMetricsIncompatible) {
      // Balanced angular distribution so all metric colors (e.g. Purple, Blue, Red)
      // are clearly and vividly visible across the single donut, rather than 99.9% vs 0.02%
      return series.map(s => ({
        name: s.name,
        metric_key: s.metric_key,
        value: 1, // equal partition so each metric gets prominent color slice
        realValue: summaryMeta[s.metric_key] ?? 0,
        color: s.color,
        fullLabel: s.name,
      }));
    }

    // Homogeneous metrics (e.g. Cash ₹ + UPI ₹ + Card ₹ breakdown)
    return series.map(s => {
      const v = summaryMeta[s.metric_key] ?? 0;
      return {
        name: s.name,
        metric_key: s.metric_key,
        value: Math.max(0.0001, v),
        realValue: v,
        color: s.color,
        fullLabel: s.name,
      };
    });
  }, [series, summaryMeta, rows, areMetricsIncompatible, isSingleMetricPeriodBreakdown, formatXLabel, formatTooltipLabel]);

  const grandTotal = useMemo(() => {
    if (isSingleMetricPeriodBreakdown) {
      return summaryMeta[series[0].metric_key] ?? rows.reduce((acc, r) => acc + Number(r[series[0].metric_key] || 0), 0);
    }
    return series.reduce((acc, s) => acc + (summaryMeta[s.metric_key] || 0), 0);
  }, [series, summaryMeta, rows, isSingleMetricPeriodBreakdown]);

  const pieGen = useMemo(() => {
    return d3Pie<any>()
      .value(d => Math.max(0.0001, d.value))
      .padAngle(pieData.length > 1 ? (isDonut ? 0.035 : 0.015) : 0)
      .sort(null);
  }, [pieData.length, isDonut]);

  const arcGen = useMemo(() => {
    return d3Arc<any>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .cornerRadius(isDonut && pieData.length > 1 ? 4 : 0);
  }, [innerRadius, outerRadius, isDonut, pieData.length]);

  const pieSlices = useMemo(() => pieGen(pieData), [pieGen, pieData]);

  if (width < 30 || height < 30 || pieData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-xs text-[var(--muted-foreground)]">
        No data for pie distribution
      </div>
    );
  }

  const effectiveIdx = hoveredIdx !== null ? hoveredIdx : selectedIdx;
  const activeSlice = effectiveIdx !== null ? pieSlices[effectiveIdx]?.data : null;

  // Compute what to show in the center of the donut
  const displayVal = activeSlice
    ? activeSlice.realValue
    : areMetricsIncompatible
    ? (summaryMeta[series[0].metric_key] ?? 0)
    : grandTotal;

  const displayKey = activeSlice
    ? activeSlice.metric_key
    : series[0].metric_key;

  const displayLabel = activeSlice
    ? activeSlice.name
    : areMetricsIncompatible
    ? series[0].name
    : 'Total';

  return (
    <div
      onPointerLeave={() => onHoverChange(null)}
      className="relative w-full h-full flex items-center justify-center select-none"
    >
      <svg width={width} height={height} className="overflow-visible">
        <Group top={height / 2} left={width / 2}>
          {pieSlices.map((slice, i) => {
            const isHovered = effectiveIdx === i;
            const pathD = arcGen(slice) || '';

            return (
              <motion.path
                key={`slice-${slice.data.metric_key}-${i}`}
                d={pathD}
                fill={slice.data.color}
                stroke="var(--card)"
                strokeWidth={2}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{
                  opacity: effectiveIdx === null || isHovered ? 1 : 0.45,
                  scale: isHovered ? 1.07 : effectiveIdx !== null ? 0.97 : 1,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 26,
                  mass: 0.8,
                }}
                style={{ transformOrigin: '0px 0px' }}
                onPointerEnter={() => onHoverChange(i)}
                onClick={() => onSelectChange(selectedIdx === i ? null : i)}
                className="cursor-pointer"
              />
            );
          })}
        </Group>
      </svg>

      {/* Central Value & Metric Label Counter for Donut */}
      {isDonut && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          <motion.div
            key={`center-val-${displayVal}-${displayKey}`}
            initial={{ opacity: 0, scale: 0.95, y: -2 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="text-2xl sm:text-3xl font-black text-[var(--foreground)] tracking-tight font-mono"
          >
            {formatValue(displayVal, displayKey)}
          </motion.div>
          <motion.span
            key={`center-lbl-${displayLabel}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.18 }}
            className="text-xs text-[var(--muted-foreground)] font-bold uppercase tracking-wider truncate max-w-44 mt-0.5"
            title={displayLabel}
          >
            {displayLabel}
          </motion.span>
          {areMetricsIncompatible && effectiveIdx === null && (
            <span className="text-[10px] text-[var(--primary)] font-semibold tracking-normal mt-0.5 opacity-80">
              Click or hover legend to view
            </span>
          )}
        </div>
      )}

      {/* Floating Hover Badge */}
      <AnimatePresence>
        {activeSlice && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 28 }}
            className="absolute top-1 pointer-events-none z-10 px-3.5 py-1.5 rounded-full bg-[var(--popover)] border border-[var(--border)] text-[var(--popover-foreground)] shadow-lg text-xs sm:text-[13px] font-semibold flex items-center gap-2 backdrop-blur-md"
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: activeSlice.color }}
            />
            <span className="truncate max-w-36">{activeSlice.fullLabel || activeSlice.name}:</span>
            <span className="font-mono text-[var(--primary)] font-bold">
              {formatValue(activeSlice.realValue, activeSlice.metric_key)}
            </span>
            {!areMetricsIncompatible && grandTotal > 0 && !isSingleMetricPeriodBreakdown && (
              <span className="text-xs text-[var(--muted-foreground)] font-mono">
                ({((activeSlice.realValue / grandTotal) * 100).toFixed(1)}%)
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── EXPORTED PRIMARY REPORTING CHART WRAPPER ─── */
export const ReportingChart: React.FC<ReportingChartProps> = ({
  chartType,
  rows,
  series,
  summaryMeta,
  height = 250,
  formatXLabel,
  formatTooltipLabel,
  formatValue = val => Number(val).toLocaleString('en-IN'),
  className = '',
  showFooterLegend = true,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [hiddenKeys, setHiddenKeys] = useState<string[]>([]);

  // Toggle metric visibility when legend item is clicked (appear / disappear)
  const toggleMetricVisibility = (metricKey: string) => {
    setHiddenKeys(prev => {
      if (prev.includes(metricKey)) {
        // Currently hidden -> make it appear
        return prev.filter(k => k !== metricKey);
      } else {
        // Currently visible -> make it disappear (keep at least 1 metric visible)
        const currentlyVisibleCount = series.filter(s => !prev.includes(s.metric_key)).length;
        if (currentlyVisibleCount <= 1) {
          return prev;
        }
        return [...prev, metricKey];
      }
    });
    setHoveredIdx(null);
  };

  // Filter series to only those that are currently visible
  const visibleSeries = useMemo(() => {
    return series.filter(s => !hiddenKeys.includes(s.metric_key));
  }, [series, hiddenKeys]);

  return (
    <div className={`w-full flex flex-col ${className}`}>
      <div style={{ height }}>
        <ParentSize debounceTime={10}>
          {({ width, height: pHeight }: { width: number; height: number }) => {
            const chartH = pHeight || height;

            if (chartType === 'pie' || chartType === 'donut') {
              return (
                <PieDonutChartInner
                  chartType={chartType}
                  rows={rows}
                  series={visibleSeries}
                  summaryMeta={summaryMeta}
                  width={width}
                  height={chartH}
                  hoveredIdx={hoveredIdx}
                  onHoverChange={setHoveredIdx}
                  selectedIdx={null}
                  onSelectChange={idx => setHoveredIdx(idx)}
                  formatXLabel={formatXLabel}
                  formatTooltipLabel={formatTooltipLabel}
                  formatValue={formatValue}
                />
              );
            }

            return (
              <CartesianChartInner
                chartType={chartType}
                rows={rows}
                series={visibleSeries}
                width={width}
                height={chartH}
                formatXLabel={formatXLabel}
                formatTooltipLabel={formatTooltipLabel}
              />
            );
          }}
        </ParentSize>
      </div>

      {/* Prominent, Clean Chart Footer & Legend Bar with Click to Toggle Visibility */}
      {showFooterLegend && series.length > 0 && (
        <div className="flex items-center justify-center gap-2.5 sm:gap-4 flex-wrap pt-3 mt-1.5 border-t border-[var(--border)]/60 select-none">
          {series.map(s => {
            const isHidden = hiddenKeys.includes(s.metric_key);
            const visibleIdx = visibleSeries.findIndex(v => v.metric_key === s.metric_key);
            const isHovered = !isHidden && visibleIdx !== -1 && hoveredIdx === visibleIdx;

            return (
              <button
                key={`foot-legend-${s.metric_key}`}
                type="button"
                onClick={() => toggleMetricVisibility(s.metric_key)}
                onPointerEnter={() => {
                  if (!isHidden && visibleIdx !== -1) {
                    setHoveredIdx(visibleIdx);
                  }
                }}
                onPointerLeave={() => setHoveredIdx(null)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                  isHidden
                    ? 'opacity-40 bg-[var(--muted)]/20 border-dashed border-[var(--border)] text-[var(--muted-foreground)] line-through hover:opacity-75'
                    : isHovered
                    ? 'bg-[var(--primary)]/15 border-[var(--primary)] text-[var(--foreground)] shadow-xs scale-105'
                    : 'bg-[var(--muted)]/50 hover:bg-[var(--muted)]/80 border-[var(--border)]/50 text-[var(--foreground)]'
                }`}
                title={isHidden ? `Click to show ${s.name} on chart` : `Click to hide ${s.name} from chart`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full shrink-0 shadow-xs transition-all ${
                    isHidden ? 'border border-current bg-transparent' : ''
                  }`}
                  style={!isHidden ? { backgroundColor: s.color } : {}}
                />
                <span className="font-semibold text-xs sm:text-sm">{s.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
