import React, { useState, useMemo } from 'react';
import { ParentSize } from '@visx/responsive';
import { Group } from '@visx/group';
import { pie as d3Pie, arc as d3Arc } from 'd3-shape';
import { motion, AnimatePresence } from 'motion/react';
import NumberFlow from '@number-flow/react';

export interface ChannelMixItem {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface VisxDonutChartProps {
  data: ChannelMixItem[];
  totalCount: number;
  height?: number;
  className?: string;
}

const DonutInner: React.FC<{
  data: ChannelMixItem[];
  totalCount: number;
  width: number;
  height: number;
}> = ({ data, totalCount, width, height }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const radius = Math.min(width, height) / 2;
  const innerRadius = radius * 0.65;
  const outerRadius = radius * 0.92;

  const pieData = useMemo(() => {
    const pieGenerator = d3Pie<ChannelMixItem>()
      .value(d => Math.max(0.001, d.percentage))
      .padAngle(0.04)
      .sort(null);

    return pieGenerator(data);
  }, [data]);

  const arcGenerator = useMemo(() => {
    return d3Arc<any>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .cornerRadius(5);
  }, [innerRadius, outerRadius]);

  if (width < 30 || height < 30 || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-xs text-[var(--muted-foreground)]">
        No channel data
      </div>
    );
  }

  const activeItem = hoveredIdx !== null ? data[hoveredIdx] : null;

  return (
    <div
      onPointerLeave={() => setHoveredIdx(null)}
      className="relative w-full h-full flex items-center justify-center select-none"
    >
      <svg width={width} height={height} className="overflow-visible">
        <Group top={height / 2} left={width / 2}>
          {pieData.map((slice, i) => {
            const isHovered = hoveredIdx === i;
            const pathD = arcGenerator(slice) || '';

            return (
              <motion.path
                key={`donut-slice-${slice.data.name}-${i}`}
                d={pathD}
                fill={slice.data.color}
                stroke="var(--card)"
                strokeWidth={2}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{
                  opacity: hoveredIdx === null || isHovered ? 1 : 0.55,
                  scale: isHovered ? 1.08 : hoveredIdx !== null ? 0.97 : 1,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 26,
                  mass: 0.8,
                }}
                style={{ transformOrigin: '0px 0px' }}
                onPointerEnter={() => setHoveredIdx(i)}
                className="cursor-pointer"
              />
            );
          })}
        </Group>
      </svg>

      {/* Central Rolling Number Counter */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
        <div className="text-xl sm:text-2xl font-black text-[var(--foreground)] tracking-tight">
          <NumberFlow
            value={activeItem ? activeItem.count : totalCount}
            transformTiming={{ duration: 350, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
          />
        </div>
        <span className="text-[10px] text-[var(--muted-foreground)] font-semibold uppercase tracking-wider">
          {activeItem ? activeItem.name : 'Bookings'}
        </span>
      </div>

      {/* Floating Hover Badge with Smooth Spring Fade */}
      <AnimatePresence>
        {activeItem && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 28 }}
            className="absolute top-1 pointer-events-none z-10 px-3 py-1 rounded-full bg-[var(--popover)] border border-[var(--border)] text-[var(--popover-foreground)] shadow-lg text-[11px] font-semibold flex items-center gap-1.5 backdrop-blur-md"
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: activeItem.color }}
            />
            <span>{activeItem.name}:</span>
            <span className="font-mono text-[var(--primary)] font-bold">{activeItem.percentage}%</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const VisxDonutChart: React.FC<VisxDonutChartProps> = ({
  data,
  totalCount,
  height = 176,
  className = '',
}) => {
  return (
    <div style={{ height }} className={`w-full relative ${className}`}>
      <ParentSize debounceTime={10}>
        {({ width, height: pHeight }: { width: number; height: number }) => (
          <DonutInner
            data={data}
            totalCount={totalCount}
            width={width}
            height={pHeight || height}
          />
        )}
      </ParentSize>
    </div>
  );
};
