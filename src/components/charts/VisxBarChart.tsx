import React, { useState, useMemo } from 'react';
import { ParentSize } from '@visx/responsive';
import { scaleBand, scaleLinear } from '@visx/scale';
import { Group } from '@visx/group';
import { GridColumns } from '@visx/grid';
import { Bar } from '@visx/shape';
import { motion, AnimatePresence } from 'motion/react';

export interface CategoryPerformanceItem {
  category: string;
  occupancy: number;
  adr?: number;
  availableRooms?: number;
  occupiedRooms?: number;
}

export interface VisxHorizontalBarChartProps {
  data: CategoryPerformanceItem[];
  height?: number;
  className?: string;
}

const defaultMargin = { top: 10, right: 30, bottom: 26, left: 100 };

const HorizontalBarInner: React.FC<{
  data: CategoryPerformanceItem[];
  width: number;
  height: number;
}> = ({ data, width, height }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const xMax = Math.max(0, width - defaultMargin.left - defaultMargin.right);
  const yMax = Math.max(0, height - defaultMargin.top - defaultMargin.bottom);

  const yScale = useMemo(
    () =>
      scaleBand<string>({
        range: [0, yMax],
        domain: data.map(d => d.category),
        padding: 0.32,
      }),
    [data, yMax]
  );

  const xScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [0, xMax],
        domain: [0, 100],
      }),
    [xMax]
  );

  if (width < 50 || height < 50 || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-xs text-[var(--muted-foreground)]">
        No category data available
      </div>
    );
  }

  const activeItem = hoveredIdx !== null ? data[hoveredIdx] : null;

  const targetY =
    activeItem != null
      ? (yScale(activeItem.category) || 0) + defaultMargin.top - 20
      : 0;

  return (
    <div
      onPointerLeave={() => setHoveredIdx(null)}
      className="relative w-full h-full select-none"
    >
      <svg width={width} height={height} className="overflow-visible">
        <Group left={defaultMargin.left} top={defaultMargin.top}>
          {/* Subtle Vertical Grid Lines */}
          <GridColumns
            scale={xScale}
            height={yMax}
            stroke="var(--border)"
            strokeDasharray="3 3"
            strokeOpacity={0.4}
            numTicks={5}
          />

          {/* Bottom X-Axis Ticks (0% to 100%) */}
          {[0, 25, 50, 75, 100].map(pct => {
            const x = xScale(pct);
            return (
              <text
                key={`x-tick-${pct}`}
                x={x}
                y={yMax + 15}
                fill="var(--muted-foreground)"
                fontSize={10}
                textAnchor="middle"
                className="font-mono"
              >
                {pct}%
              </text>
            );
          })}

          {/* Background Track & Filled Bars */}
          {data.map((d, i) => {
            const y = yScale(d.category) || 0;
            const barHeight = yScale.bandwidth();
            const barWidth = Math.max(0, xScale(d.occupancy));
            const isHovered = hoveredIdx === i;

            return (
              <Group key={`cat-${d.category}-${i}`}>
                {/* Category Y-Axis Label */}
                <text
                  x={-10}
                  y={y + barHeight / 2 + 3.5}
                  fill={isHovered ? 'var(--primary)' : 'var(--foreground)'}
                  fontSize={11}
                  fontWeight={isHovered ? 700 : 500}
                  textAnchor="end"
                  className="transition-colors duration-150 truncate"
                >
                  {d.category.length > 14 ? `${d.category.slice(0, 13)}…` : d.category}
                </text>

                {/* Background Full Track (100%) */}
                <Bar
                  x={0}
                  y={y}
                  width={xMax}
                  height={barHeight}
                  fill="var(--muted)"
                  opacity={0.35}
                  rx={4}
                />

                {/* Animated Value Bar */}
                <motion.rect
                  x={0}
                  y={y}
                  height={barHeight}
                  fill="var(--primary)"
                  rx={4}
                  initial={{ width: 0 }}
                  animate={{
                    width: barWidth,
                    opacity: hoveredIdx === null || isHovered ? 1 : 0.65,
                    scaleY: isHovered ? 1.08 : 1,
                  }}
                  transition={{
                    opacity: { duration: 0.15 },
                    scaleY: { type: 'spring', stiffness: 450, damping: 25 },
                    width: { duration: 0.45, ease: 'easeOut' },
                  }}
                  style={{ transformOrigin: `0px ${y + barHeight / 2}px` }}
                  onPointerEnter={() => setHoveredIdx(i)}
                  className="cursor-pointer"
                />

                {/* End Percentage Value Label */}
                <text
                  x={Math.min(xMax - 2, barWidth + 6)}
                  y={y + barHeight / 2 + 3.5}
                  fill="var(--foreground)"
                  fontSize={10}
                  fontWeight={600}
                  className="font-mono"
                >
                  {d.occupancy.toFixed(0)}%
                </text>
              </Group>
            );
          })}
        </Group>
      </svg>

      {/* Floating Gliding Tooltip via Spring Y */}
      <AnimatePresence>
        {activeItem && hoveredIdx !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: targetY,
            }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{
              y: { type: 'spring', stiffness: 500, damping: 30 },
              opacity: { duration: 0.15 },
              scale: { duration: 0.15 },
            }}
            style={{
              left: Math.min(width - 150, defaultMargin.left + 20),
              position: 'absolute',
            }}
            className="pointer-events-none z-20 bg-[var(--popover)] border border-[var(--border)] text-[var(--popover-foreground)] p-2.5 rounded-xl shadow-xl text-xs space-y-1 min-w-36 backdrop-blur-md"
          >
            <p className="font-bold border-b border-[var(--border)] pb-1 text-[var(--foreground)]">
              {activeItem.category}
            </p>
            <div className="flex items-center justify-between gap-3 text-[11px]">
              <span className="text-[var(--muted-foreground)]">Occupancy:</span>
              <span className="font-bold font-mono text-[var(--primary)]">
                {activeItem.occupancy.toFixed(1)}%
              </span>
            </div>
            {activeItem.adr !== undefined && (
              <div className="flex items-center justify-between gap-3 text-[11px]">
                <span className="text-[var(--muted-foreground)]">ADR:</span>
                <span className="font-mono text-[var(--foreground)]">
                  ₹{Math.round(activeItem.adr).toLocaleString('en-IN')}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const VisxBarChart: React.FC<VisxHorizontalBarChartProps> = ({
  data,
  height = 220,
  className = '',
}) => {
  return (
    <div style={{ height }} className={`w-full ${className}`}>
      <ParentSize debounceTime={10}>
        {({ width, height: pHeight }: { width: number; height: number }) => (
          <HorizontalBarInner
            data={data}
            width={width}
            height={pHeight || height}
          />
        )}
      </ParentSize>
    </div>
  );
};
