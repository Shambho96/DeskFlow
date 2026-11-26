import React, { useState, useCallback, useMemo } from 'react';
import { ParentSize } from '@visx/responsive';
import { scaleBand, scaleLinear } from '@visx/scale';
import { Group } from '@visx/group';
import { GridRows } from '@visx/grid';
import { LinePath, AreaClosed } from '@visx/shape';
import { LinearGradient } from '@visx/gradient';
import { curveMonotoneX } from '@visx/curve';
import { localPoint } from '@visx/event';
import { motion, AnimatePresence } from 'motion/react';
import NumberFlow from '@number-flow/react';

export interface TrendDataPoint {
  day: string;
  revenue: number;
  occupancy: number;
}

export interface VisxComboTrendChartProps {
  data: TrendDataPoint[];
  chartType?: 'combo' | 'bar' | 'area';
  height?: number;
  className?: string;
  showStatBanner?: boolean;
}

const defaultMargin = { top: 16, right: 38, bottom: 44, left: 52 };

const ChartInner: React.FC<{
  data: TrendDataPoint[];
  chartType: 'combo' | 'bar' | 'area';
  width: number;
  height: number;
  showStatBanner?: boolean;
}> = ({ data, chartType, width, height, showStatBanner = true }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const bannerHeight = showStatBanner ? 38 : 0;
  const svgHeight = Math.max(120, height - bannerHeight);

  const xMax = Math.max(0, width - defaultMargin.left - defaultMargin.right);
  const yMax = Math.max(0, svgHeight - defaultMargin.top - defaultMargin.bottom);

  // Scales
  const xScale = useMemo(
    () =>
      scaleBand<string>({
        range: [0, xMax],
        domain: data.map(d => d.day),
        padding: 0.35,
      }),
    [data, xMax]
  );

  const maxRevenue = useMemo(() => {
    let globalMax = 0;
    data.forEach(d => {
      if (d.revenue > globalMax) globalMax = d.revenue;
    });
    return Math.max(1000, Math.ceil(globalMax * 1.15));
  }, [data]);

  const yRevScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [yMax, 0],
        domain: [0, maxRevenue],
        nice: true,
      }),
    [maxRevenue, yMax]
  );

  const yOccScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [yMax, 0],
        domain: [0, 100],
      }),
    [yMax]
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
      if (index >= 0 && index < data.length) {
        setHoverIndex(prev => (prev === index ? prev : index));
      }
    },
    [data.length, xScale]
  );

  const handlePointerLeave = useCallback(() => {
    setHoverIndex(null);
  }, []);

  const activeItem = hoverIndex !== null ? data[hoverIndex] : null;

  // Aggregate values when not hovered
  const totalRevenue = useMemo(
    () => data.reduce((acc, d) => acc + d.revenue, 0),
    [data]
  );
  const avgOccupancy = useMemo(
    () => (data.length ? data.reduce((acc, d) => acc + d.occupancy, 0) / data.length : 0),
    [data]
  );

  if (width < 50 || height < 50 || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-xs text-[var(--muted-foreground)]">
        No trend data available
      </div>
    );
  }

  // Active X coordinate for crosshair and tooltip
  const activeX =
    activeItem != null
      ? (xScale(activeItem.day) || 0) + bandWidth / 2
      : 0;

  // Clamped X coordinate for date pill to ensure it never overflows chart bounds
  const pillX = Math.max(30, Math.min(xMax - 30, activeX));

  const tooltipTargetX = Math.min(
    width - 165,
    Math.max(10, defaultMargin.left + activeX - 70)
  );

  return (
    <div
      onPointerLeave={handlePointerLeave}
      className="relative w-full h-full select-none flex flex-col justify-between"
    >
      {/* Dynamic Hover Stat Ticker Banner */}
      {showStatBanner && (
        <div className="flex items-center justify-between pb-2 mb-1 px-1 border-b border-[var(--border)]/40 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
              {activeItem ? `${activeItem.day}'s Metrics:` : '7-Day Summary:'}
            </span>
          </div>

          <div className="flex items-center gap-5">
            {/* Animated Revenue Ticker */}
            <div className="flex items-center gap-1.5 font-semibold">
              <span className="w-2 h-2 rounded-sm bg-[var(--primary)]" />
              <span className="text-[11px] text-[var(--muted-foreground)]">Rev:</span>
              <span className="font-mono text-[var(--foreground)] font-bold text-xs inline-flex items-baseline">
                ₹
                <NumberFlow
                  value={activeItem ? activeItem.revenue : totalRevenue}
                  transformTiming={{ duration: 350, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
                />
              </span>
            </div>

            {/* Animated Occupancy Ticker */}
            <div className="flex items-center gap-1.5 font-semibold">
              <span className="w-2 h-2 rounded-full bg-[var(--chart-1)]" />
              <span className="text-[11px] text-[var(--muted-foreground)]">Occ:</span>
              <span className="font-mono text-[var(--foreground)] font-bold text-xs inline-flex items-baseline">
                <NumberFlow
                  value={activeItem ? activeItem.occupancy : avgOccupancy}
                  format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
                  transformTiming={{ duration: 350, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
                />
                %
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main SVG Plot */}
      <div className="relative w-full flex-1 min-h-0" style={{ height: svgHeight }}>
        <svg
          width={width}
          height={svgHeight}
          className="overflow-visible block"
          style={{ width: '100%', height: svgHeight }}
        >
          <defs>
            <LinearGradient
              id="visx-rev-gradient"
              from="var(--primary)"
              to="var(--primary)"
              fromOpacity={0.45}
              toOpacity={0.02}
            />
            <LinearGradient
              id="visx-bar-gradient"
              from="var(--primary)"
              to="var(--primary)"
              fromOpacity={0.95}
              toOpacity={0.75}
            />
          </defs>

          <Group left={defaultMargin.left} top={defaultMargin.top}>
            {/* Subtle Grid Lines */}
            <GridRows
              scale={yRevScale}
              width={xMax}
              stroke="var(--border)"
              strokeDasharray="3 3"
              strokeOpacity={0.45}
              numTicks={5}
            />

            {/* Left Y-Axis Ticks (Revenue formatted in Indian numbering) */}
            {yRevScale.ticks(4).map(tick => {
              const y = yRevScale(tick);
              let label = `₹${tick}`;
              if (tick >= 10000000) {
                const cr = tick / 10000000;
                label = `₹${cr % 1 === 0 ? cr : cr.toFixed(1)} Cr`;
              } else if (tick >= 100000) {
                const lk = tick / 100000;
                label = `₹${lk % 1 === 0 ? lk : lk.toFixed(1)} L`;
              } else {
                label = `₹${Number(tick).toLocaleString('en-IN')}`;
              }
              return (
                <text
                  key={`rev-tick-${tick}`}
                  x={-10}
                  y={y + 3}
                  fill="var(--muted-foreground)"
                  fontSize={10}
                  textAnchor="end"
                  className="font-mono"
                >
                  {label}
                </text>
              );
            })}

            {/* Right Y-Axis Ticks (Occupancy %) */}
            {[0, 25, 50, 75, 100].map(pct => {
              const y = yOccScale(pct);
              return (
                <text
                  key={`occ-tick-${pct}`}
                  x={xMax + 10}
                  y={y + 3}
                  fill="var(--muted-foreground)"
                  fontSize={10}
                  textAnchor="start"
                  className="font-mono"
                >
                  {pct}%
                </text>
              );
            })}

            {/* X-Axis Day Labels (Hidden when date pill is over it) */}
            {data.map(d => {
              const x = (xScale(d.day) || 0) + bandWidth / 2;
              const isCoveredByPill =
                activeItem != null && Math.abs(x - pillX) < 26;
              return (
                <text
                  key={`day-${d.day}`}
                  x={x}
                  y={yMax + 18}
                  fill={isCoveredByPill ? 'transparent' : 'var(--muted-foreground)'}
                  fontSize={11}
                  textAnchor="middle"
                  fontWeight={500}
                >
                  {d.day}
                </text>
              );
            })}

            {/* Visual Elements by Chart Type */}
            {chartType === 'area' && (
              <>
                <AreaClosed<TrendDataPoint>
                  data={data}
                  x={d => (xScale(d.day) || 0) + bandWidth / 2}
                  y={d => yRevScale(d.revenue)}
                  yScale={yRevScale}
                  curve={curveMonotoneX}
                  fill="url(#visx-rev-gradient)"
                />
                <LinePath<TrendDataPoint>
                  data={data}
                  x={d => (xScale(d.day) || 0) + bandWidth / 2}
                  y={d => yRevScale(d.revenue)}
                  curve={curveMonotoneX}
                  stroke="var(--primary)"
                  strokeWidth={3}
                />
                <LinePath<TrendDataPoint>
                  data={data}
                  x={d => (xScale(d.day) || 0) + bandWidth / 2}
                  y={d => yOccScale(d.occupancy)}
                  curve={curveMonotoneX}
                  stroke="var(--chart-1)"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                />
              </>
            )}

            {chartType === 'bar' && (
              <Group>
                {data.map(d => {
                  const x = xScale(d.day) || 0;
                  const halfWidth = bandWidth / 2 - 2;
                  const revHeight = yMax - yRevScale(d.revenue);
                  const occHeight = yMax - yOccScale(d.occupancy);
                  const isHovered = activeItem?.day === d.day;

                  return (
                    <g key={`bars-${d.day}`}>
                      <motion.rect
                        x={x}
                        y={yRevScale(d.revenue)}
                        width={Math.max(4, halfWidth)}
                        height={Math.max(0, revHeight)}
                        fill="url(#visx-bar-gradient)"
                        rx={4}
                        animate={{
                          opacity: hoverIndex === null || isHovered ? 1 : 0.55,
                        }}
                        transition={{ duration: 0.15 }}
                      />
                      <motion.rect
                        x={x + halfWidth + 4}
                        y={yOccScale(d.occupancy)}
                        width={Math.max(4, halfWidth)}
                        height={Math.max(0, occHeight)}
                        fill="var(--chart-1)"
                        rx={4}
                        animate={{
                          opacity: hoverIndex === null || isHovered ? 0.95 : 0.5,
                        }}
                        transition={{ duration: 0.15 }}
                      />
                    </g>
                  );
                })}
              </Group>
            )}

            {chartType === 'combo' && (
              <Group>
                {/* Revenue Bars */}
                {data.map(d => {
                  const x = xScale(d.day) || 0;
                  const revHeight = yMax - yRevScale(d.revenue);
                  const isHovered = activeItem?.day === d.day;

                  return (
                    <motion.rect
                      key={`bar-${d.day}`}
                      x={x}
                      y={yRevScale(d.revenue)}
                      width={bandWidth}
                      height={Math.max(0, revHeight)}
                      fill="url(#visx-bar-gradient)"
                      rx={6}
                      animate={{
                        opacity: hoverIndex === null || isHovered ? 1 : 0.55,
                        scaleY: isHovered ? 1.02 : 1,
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      style={{ transformOrigin: `0px ${yMax}px` }}
                    />
                  );
                })}

                {/* Occupancy Line Path on top */}
                <LinePath<TrendDataPoint>
                  data={data}
                  x={d => (xScale(d.day) || 0) + bandWidth / 2}
                  y={d => yOccScale(d.occupancy)}
                  curve={curveMonotoneX}
                  stroke="var(--chart-1)"
                  strokeWidth={3}
                />

                {/* Data points for line */}
                {data.map(d => {
                  const cx = (xScale(d.day) || 0) + bandWidth / 2;
                  const cy = yOccScale(d.occupancy);
                  return (
                    <circle
                      key={`dot-${d.day}`}
                      cx={cx}
                      cy={cy}
                      r={3.5}
                      stroke="var(--card)"
                      strokeWidth={1.5}
                      fill="var(--chart-1)"
                    />
                  );
                })}
              </Group>
            )}

            {/* Smooth Gliding Crosshair Line */}
            {activeItem && (
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

            {/* Glowing Halo Dot on the Active Line Point */}
            {activeItem && (
              <g
                transform={`translate(${activeX}, ${yOccScale(activeItem.occupancy)})`}
                style={{
                  transition: 'transform 0.12s cubic-bezier(0.16, 1, 0.3, 1)',
                  willChange: 'transform',
                }}
                pointerEvents="none"
              >
                {/* Glowing Halo Disc */}
                <circle r={11} fill="var(--chart-1)" opacity={0.25} />
                {/* Core Dot */}
                <circle r={4.5} fill="var(--chart-1)" stroke="var(--card)" strokeWidth={2} />
              </g>
            )}

            {/* Spring-Gliding Date Pill at Bottom of Crosshair */}
            {activeItem && (
              <g
                transform={`translate(${pillX}, 0)`}
                style={{
                  transition: 'transform 0.12s cubic-bezier(0.16, 1, 0.3, 1)',
                  willChange: 'transform',
                }}
                pointerEvents="none"
              >
                <rect
                  x={-28}
                  y={yMax + 4}
                  width={56}
                  height={20}
                  rx={6}
                  fill="var(--foreground)"
                />
                <text
                  x={0}
                  y={yMax + 18}
                  textAnchor="middle"
                  fill="var(--background)"
                  fontSize={10}
                  fontWeight={700}
                  className="font-mono select-none"
                >
                  {activeItem.day}
                </text>
              </g>
            )}

            {/* Transparent Overlay for Catching Mouse / Touch Events */}
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

        {/* Fluid Gliding Tooltip via Motion Spring */}
        <AnimatePresence>
          {activeItem && hoverIndex !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{
                opacity: 1,
                scale: 1,
                x: tooltipTargetX,
              }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{
                x: { type: 'spring', stiffness: 450, damping: 30 },
                scale: { duration: 0.15 },
                opacity: { duration: 0.15 },
              }}
              style={{
                top: defaultMargin.top + 6,
                position: 'absolute',
              }}
              className="pointer-events-none z-20 bg-[var(--popover)] border border-[var(--border)] text-[var(--popover-foreground)] p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-36 backdrop-blur-md"
            >
              <p className="font-bold border-b border-[var(--border)] pb-1 mb-1 text-[var(--foreground)]">
                {activeItem.day}
              </p>
              <div className="flex items-center justify-between gap-3 text-[11px] font-semibold">
                <span className="flex items-center gap-1.5 text-[var(--primary)]">
                  <span className="w-2 h-2 rounded-sm bg-[var(--primary)]" />
                  Revenue:
                </span>
                <span className="font-mono text-[var(--foreground)] inline-flex items-baseline font-bold">
                  ₹
                  <NumberFlow
                    value={activeItem.revenue}
                    transformTiming={{ duration: 250, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
                  />
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 text-[11px] font-semibold">
                <span className="flex items-center gap-1.5 text-[var(--chart-1)]">
                  <span className="w-2 h-2 rounded-full bg-[var(--chart-1)]" />
                  Occupancy:
                </span>
                <span className="font-mono text-[var(--foreground)] inline-flex items-baseline font-bold">
                  <NumberFlow
                    value={activeItem.occupancy}
                    format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
                    transformTiming={{ duration: 250, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
                  />
                  %
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export const VisxComboTrendChart: React.FC<VisxComboTrendChartProps> = ({
  data,
  chartType = 'combo',
  height,
  className = '',
  showStatBanner = true,
}) => {
  return (
    <div
      style={height ? { height } : undefined}
      className={`w-full h-full min-h-[280px] ${className}`}
    >
      <ParentSize debounceTime={10}>
        {({ width, height: pHeight }: { width: number; height: number }) => (
          <ChartInner
            data={data}
            chartType={chartType}
            width={width}
            height={pHeight > 100 ? pHeight : (height || 290)}
            showStatBanner={showStatBanner}
          />
        )}
      </ParentSize>
    </div>
  );
};
