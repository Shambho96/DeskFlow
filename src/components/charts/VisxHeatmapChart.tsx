import React, { useState, useMemo } from 'react';
import { ParentSize } from '@visx/responsive';
import { scaleBand, scaleLinear } from '@visx/scale';
import { HeatmapRect } from '@visx/heatmap';
import { Group } from '@visx/group';
import { motion, AnimatePresence } from 'motion/react';

export interface HeatmapBin {
  bin: string; // e.g. Row label: "Front Desk", "Housekeeping", "Maintenance"
  count: number;
  notes?: string;
}

export interface HeatmapColumn {
  column: string; // e.g. "Mon", "Tue", "Wed" or "10 Nov", "11 Nov"
  bins: HeatmapBin[];
}

export interface VisxHeatmapChartProps {
  data: HeatmapColumn[];
  height?: number;
  className?: string;
}

const defaultMargin = { top: 22, right: 20, bottom: 20, left: 85 };

const HeatmapInner: React.FC<{
  data: HeatmapColumn[];
  width: number;
  height: number;
}> = ({ data, width, height }) => {
  const [hoveredCell, setHoveredCell] = useState<{
    column: string;
    row: string;
    count: number;
    x: number;
    y: number;
  } | null>(null);

  const footerHeight = 36;
  const svgHeight = Math.max(80, height - footerHeight);

  const xMax = Math.max(0, width - defaultMargin.left - defaultMargin.right);
  const yMax = Math.max(0, svgHeight - defaultMargin.top - defaultMargin.bottom);

  const columnLabels = useMemo(() => data.map(d => d.column), [data]);
  const rowLabels = useMemo(() => {
    if (!data.length) return [];
    return data[0].bins.map(b => b.bin);
  }, [data]);

  const xScale = useMemo(
    () =>
      scaleBand<string>({
        domain: columnLabels,
        range: [0, xMax],
        padding: 0.15,
      }),
    [columnLabels, xMax]
  );

  const yScale = useMemo(
    () =>
      scaleBand<string>({
        domain: rowLabels,
        range: [0, yMax],
        padding: 0.15,
      }),
    [rowLabels, yMax]
  );

  const maxCount = useMemo(() => {
    let maxVal = 0;
    data.forEach(c => {
      c.bins.forEach(b => {
        if (b.count > maxVal) maxVal = b.count;
      });
    });
    return Math.max(1, maxVal);
  }, [data]);

  const colorScale = useMemo(
    () =>
      scaleLinear<string>({
        domain: [0, Math.ceil(maxCount * 0.5), maxCount],
        range: ['var(--muted)', '#f59e0b', '#ef4444'], // subtle to amber to red
      }),
    [maxCount]
  );

  if (width < 50 || height < 50 || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-xs text-[var(--muted-foreground)]">
        No calendar activity logged
      </div>
    );
  }

  const binWidth = xScale.bandwidth();
  const binHeight = yScale.bandwidth();

  const tooltipTargetX = hoveredCell
    ? Math.min(width - 150, Math.max(10, hoveredCell.x - 70))
    : 0;
  const tooltipTargetY = hoveredCell ? Math.max(0, hoveredCell.y - 48) : 0;

  return (
    <div
      onPointerLeave={() => setHoveredCell(null)}
      className="relative w-full h-full select-none flex flex-col justify-between"
    >
      <svg width={width} height={svgHeight} className="overflow-visible">
        <Group left={defaultMargin.left} top={defaultMargin.top}>
          {/* Top X-Axis Headers */}
          {columnLabels.map(col => {
            const x = (xScale(col) || 0) + binWidth / 2;
            const isColHovered = hoveredCell?.column === col;
            return (
              <text
                key={`header-${col}`}
                x={x}
                y={-8}
                fill={isColHovered ? 'var(--foreground)' : 'var(--muted-foreground)'}
                fontSize={10}
                fontWeight={isColHovered ? 700 : 600}
                textAnchor="middle"
                className="transition-colors duration-150"
              >
                {col}
              </text>
            );
          })}

          {/* Left Y-Axis Row Labels */}
          {rowLabels.map(row => {
            const y = (yScale(row) || 0) + binHeight / 2 + 3.5;
            const isRowHovered = hoveredCell?.row === row;
            return (
              <text
                key={`row-label-${row}`}
                x={-8}
                y={y}
                fill={isRowHovered ? 'var(--primary)' : 'var(--foreground)'}
                fontSize={10}
                fontWeight={isRowHovered ? 700 : 500}
                textAnchor="end"
                className="transition-colors duration-150"
              >
                {row.length > 12 ? `${row.slice(0, 11)}…` : row}
              </text>
            );
          })}

          {/* Heatmap Rectangles */}
          <HeatmapRect<HeatmapColumn, HeatmapBin>
            data={data}
            xScale={(colIdx: number) => xScale(columnLabels[colIdx]) || 0}
            yScale={(rowIdx: number) => yScale(rowLabels[rowIdx]) || 0}
            colorScale={colorScale}
            binWidth={binWidth}
            binHeight={binHeight}
            gap={2}
            bins={(col: HeatmapColumn) => col.bins}
            count={(bin: HeatmapBin) => bin.count}
          >
            {cells =>
              cells.map(columnCells =>
                columnCells.map(cell => {
                  const count = cell.count ?? 0;
                  const isZero = count === 0;
                  const colName = columnLabels[cell.column] || '';
                  const rowName = rowLabels[cell.row] || '';
                  const isHovered =
                    hoveredCell?.column === colName && hoveredCell?.row === rowName;

                  return (
                    <rect
                      key={`rect-${cell.column}-${cell.row}`}
                      x={cell.x}
                      y={cell.y}
                      width={cell.width}
                      height={cell.height}
                      rx={4}
                      fill={isZero ? 'var(--muted)' : (cell.color as string || 'var(--primary)')}
                      opacity={isZero ? 0.35 : isHovered ? 1 : 0.85}
                      stroke={isHovered ? 'var(--foreground)' : 'var(--card)'}
                      strokeWidth={isHovered ? 1.5 : 1}
                      className="cursor-pointer transition-opacity duration-150"
                      onPointerEnter={() =>
                        setHoveredCell({
                          column: colName,
                          row: rowName,
                          count,
                          x: defaultMargin.left + cell.x + cell.width / 2,
                          y: defaultMargin.top + cell.y,
                        })
                      }
                    />
                  );
                })
              )
            }
          </HeatmapRect>
        </Group>
      </svg>

      {/* Floating Gliding Hover Tooltip via Motion Spring */}
      <AnimatePresence>
        {hoveredCell && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: tooltipTargetX,
              y: tooltipTargetY,
            }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{
              x: { type: 'spring', stiffness: 500, damping: 30 },
              y: { type: 'spring', stiffness: 500, damping: 30 },
              opacity: { duration: 0.12 },
              scale: { duration: 0.12 },
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
            }}
            className="pointer-events-none z-20 bg-[var(--popover)] border border-[var(--border)] text-[var(--popover-foreground)] px-2.5 py-1.5 rounded-xl shadow-xl text-xs space-y-0.5 backdrop-blur-md"
          >
            <div className="font-semibold text-[11px] text-[var(--foreground)]">
              {hoveredCell.row} • {hoveredCell.column}
            </div>
            <div className="text-[10px] text-[var(--muted-foreground)] flex items-center gap-1.5">
              <span>Incidents/Complaints:</span>
              <span className="font-bold text-[var(--foreground)] font-mono">
                {hoveredCell.count}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Heatmap Intensity Footer Legend */}
      <div className="flex items-center justify-between text-[11px] text-[var(--muted-foreground)] font-medium pt-2.5 mt-1 border-t border-[var(--border)]/40 select-none">
        <span className="text-[10px] uppercase tracking-wider font-semibold">Incident Density</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px]">Low (0)</span>
          <span className="w-3 h-3 rounded-xs bg-[var(--muted)] opacity-50 border border-[var(--border)]" />
          <span className="w-3 h-3 rounded-xs bg-[#f59e0b] opacity-80" />
          <span className="w-3 h-3 rounded-xs bg-[#ef4444]" />
          <span className="text-[10px]">High ({maxCount}+)</span>
        </div>
      </div>
    </div>
  );
};

export const VisxHeatmapChart: React.FC<VisxHeatmapChartProps> = ({
  data,
  height = 180,
  className = '',
}) => {
  return (
    <div style={{ height }} className={`w-full ${className}`}>
      <ParentSize debounceTime={10}>
        {({ width, height: pHeight }: { width: number; height: number }) => (
          <HeatmapInner data={data} width={width} height={pHeight || height} />
        )}
      </ParentSize>
    </div>
  );
};
