import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Download,
  Edit2,
  Trash2,
  Copy,
  Calendar,
  Building2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ReportingChart } from '../charts';
import { useReportExecution, downloadReportCSV } from '../../hooks/useReporting';
import type { CustomReportCard } from '../../types/reporting';
import { AVAILABLE_METRICS } from '../../types/reporting';

interface ReportCardItemProps {
  card: CustomReportCard;
  onEdit: (card: CustomReportCard) => void;
  onDelete: (cardId: number) => void;
  onDuplicate?: (card: CustomReportCard) => void;
}

export const ReportCardItem: React.FC<ReportCardItemProps> = React.memo(({
  card,
  onEdit,
  onDelete,
  onDuplicate,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // DnD Kit Sortable Hook
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Fetch report data live
  const { reportData, isLoading } = useReportExecution(card, isExpanded);

  // Formatting date preset display label
  const presetLabels: Record<string, string> = {
    today: 'Today',
    yesterday: 'Yesterday',
    last_7_days: 'Last 7 days',
    last_14_days: 'Last 14 days',
    last_30_days: 'Last 30 days',
    month_to_date: 'Month to date',
    this_month: 'This month',
    last_month: 'Last month',
    last_3_months: 'Last 3 months',
    last_6_months: 'Last 6 months',
    year_to_date: 'Year to date',
    last_1_year: 'Last 1 year',
    custom: card.date_from && card.date_to ? `${card.date_from} – ${card.date_to}` : 'Custom Range',
  };

  // Format currency / number
  const formatVal = (val: number, key: string) => {
    if (key.includes('pct') || key.includes('occupancy')) {
      return `${val.toFixed(1)}%`;
    }
    if (key.includes('count') || key.includes('bookings') || key.includes('arrivals') || key.includes('departures')) {
      return val.toLocaleString('en-IN');
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const selectedMetrics = card.selected_metrics || [];
  const outletIds = card.outlet_ids || [];

  // Primary domain pill color & label based on selected domain
  const domainBadgeConfig: Record<string, { label: string; className: string }> = {
    ROOM_REVENUE: {
      label: 'Rooms',
      className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    },
    OCCUPANCY: {
      label: 'Occupancy',
      className: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20',
    },
    REVPAR: {
      label: 'Yield',
      className: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
    },
    TOTAL_REVENUE: {
      label: 'Overall',
      className: 'bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20',
    },
    FINANCE_PAYMENTS: {
      label: 'Finance',
      className: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
    },
    CUSTOM: {
      label: 'Custom',
      className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    },
    rooms: {
      label: 'Rooms',
      className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    },
    pos_fb: {
      label: 'F&B',
      className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    },
    finance: {
      label: 'Finance',
      className: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
    },
    operations: {
      label: 'Operations',
      className: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20',
    },
    all: {
      label: 'Overall',
      className: 'bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20',
    },
  };
  const domainBadge =
    domainBadgeConfig[card.report_type] ||
    (card.domain ? domainBadgeConfig[card.domain] : null) ||
    domainBadgeConfig.all;

  // Format horizontal X-axis labels cleanly (e.g. 15 Oct, Nov '26)
  const formatXAxisPeriod = (label: any) => {
    const periodStr = String(label ?? '');
    if (!periodStr) return '';

    // Daily ISO date: "YYYY-MM-DD" -> "15 Oct"
    if (/^\d{4}-\d{2}-\d{2}$/.test(periodStr)) {
      const parts = periodStr.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return `${day} ${monthNames[monthIdx] || ''}`;
    }

    // Monthly: "YYYY-MM" -> "Oct '26"
    if (/^\d{4}-\d{2}$/.test(periodStr)) {
      const parts = periodStr.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIdx = parseInt(parts[1], 10) - 1;
      return `${monthNames[monthIdx]} '${parts[0].slice(2)}`;
    }

    return periodStr;
  };

  const formatTooltipPeriod = (label: any, payload?: any) => {
    const periodStr = String(label ?? '');
    if (!periodStr) return '';

    // If weekly or monthly row with date_range (e.g. "Week 46 (09 Nov – 15 Nov)")
    const rowPayload = Array.isArray(payload) && payload[0]?.payload ? payload[0].payload : null;
    if (rowPayload?.date_range) {
      return `${periodStr} (${rowPayload.date_range})`;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(periodStr)) {
      const parts = periodStr.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return `${day} ${monthNames[monthIdx]} ${parts[0]}`;
    }
    return periodStr;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl border transition-all ${
        isDragging
          ? 'opacity-40 border-dashed border-[var(--primary)] z-50 shadow-2xl scale-[0.98]'
          : 'bg-[var(--card)] border-[var(--border)] text-[var(--card-foreground)] shadow-xs hover:border-[var(--primary)]/40 hover:shadow-md'
      } ${card.card_width === 2 ? 'col-span-1 md:col-span-2' : 'col-span-1'}`}
    >
      {/* ─── CARD HEADER ──────────────────────────────────────────────────────────── */}
      <div className="p-4 sm:p-5 pb-3.5 border-b border-[var(--border)]">
        {/* Row 1: Drag handle + Title (Left) and Action buttons (Right) */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Drag Handle ⠿ */}
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded transition-colors touch-none shrink-0"
              title="Drag to reorder card"
            >
              <GripVertical className="w-4 h-4" />
            </button>

            {/* Custom Card Name */}
            <h3 className="font-bold text-base sm:text-lg text-[var(--foreground)] tracking-tight truncate">
              {card.title}
            </h3>
          </div>

          {/* Action Controls: Export, Edit, Duplicate, Delete */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => downloadReportCSV(card)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-lg hover:bg-[var(--muted)] border border-transparent hover:border-[var(--border)] transition-colors cursor-pointer"
              title="Export CSV"
            >
              <Download className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
              <span className="hidden xs:inline">Export</span>
            </button>

            <button
              type="button"
              onClick={() => onEdit(card)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-lg hover:bg-[var(--muted)] border border-transparent hover:border-[var(--border)] transition-colors cursor-pointer"
              title="Edit Report Card"
            >
              <Edit2 className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
              <span className="hidden xs:inline">Edit</span>
            </button>

            {onDuplicate && (
              <button
                type="button"
                onClick={() => onDuplicate(card)}
                className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-lg hover:bg-[var(--muted)] border border-transparent hover:border-[var(--border)] transition-colors cursor-pointer"
                title="Duplicate Report Card"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={() => onDelete(card.id)}
              className="p-1.5 text-[var(--muted-foreground)] hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Delete Card"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setIsExpanded(prev => !prev)}
              className="p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded hover:bg-[var(--muted)] cursor-pointer ml-0.5"
              title={isExpanded ? 'Collapse card' : 'Expand card'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Row 2: Badges / Filters (Directly Under Title as in Reference Screenshot) */}
        <div className="flex items-center gap-2 flex-wrap mt-2.5 pl-6 sm:pl-7">
          {/* Date Preset Pill */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--muted)] border border-[var(--border)] text-[var(--muted-foreground)]">
            <Calendar className="w-3 h-3 text-[var(--muted-foreground)]" />
            {presetLabels[card.date_preset] || card.date_preset}
          </span>

          {/* Outlets Pill */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--muted)] border border-[var(--border)] text-[var(--muted-foreground)]">
            <Building2 className="w-3 h-3 text-[var(--muted-foreground)]" />
            {outletIds && outletIds.length > 1
              ? `${outletIds.length} Outlets`
              : '1 Outlet'}
          </span>

          {/* Domain / Category Pill (e.g. Rooms / F&B / Overall) */}
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${domainBadge.className}`}>
            {domainBadge.label}
          </span>

          {/* Selected Metrics Chips */}
          {selectedMetrics.map(mKey => {
            const def = AVAILABLE_METRICS.find(m => m.key === mKey);
            return (
              <span
                key={mKey}
                className="px-2.5 py-0.5 rounded-full text-xs font-medium text-[var(--foreground)] bg-[var(--muted)]/80 border border-[var(--border)]"
              >
                {def?.label || mKey.replace('_', ' ')}
              </span>
            );
          })}
        </div>
      </div>

      {/* ─── CARD CONTENT BODY ──────────────────────────────────────────────────────── */}
      {isExpanded && (
        <div className="p-4 sm:p-5 pt-3">
          {isLoading ? (
            <div className="h-56 w-full flex flex-col justify-end gap-2 animate-pulse p-4">
              <div className="h-4 w-36 bg-[var(--muted)] rounded mb-4" />
              <div className="h-full flex items-end gap-3">
                {[40, 65, 80, 50, 75, 90, 60].map((h, i) => (
                  <div key={i} className="flex-1 bg-[var(--muted)] rounded-t" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          ) : !reportData || reportData.rows.length === 0 ? (
            <div className="h-44 flex items-center justify-center text-xs text-[var(--muted-foreground)]">
              No data records found for this period and outlet.
            </div>
          ) : (
            <>
              {/* Summary KPIs bar inside card */}
              <div className="flex items-center gap-6 mb-4 pb-3 border-b border-[var(--border)] overflow-x-auto">
                {selectedMetrics.map(mKey => {
                  const def = AVAILABLE_METRICS.find(m => m.key === mKey);
                  const total = reportData.meta.summary[mKey] ?? 0;
                  return (
                    <div key={mKey} className="flex items-center gap-2 shrink-0">
                      <span className="text-xs sm:text-sm font-medium text-[var(--muted-foreground)]">
                        {def?.label || mKey}:
                      </span>
                      <span className="font-bold text-sm sm:text-base text-[var(--foreground)] font-mono">
                        {formatVal(total, mKey)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Chart / Table Rendering */}
              {card.chart_type === 'table' ? (
                // Table View matching theme
                <div className="overflow-x-auto max-h-72 rounded-xl border border-[var(--border)]">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[var(--muted)] text-[var(--muted-foreground)] font-semibold border-b border-[var(--border)] sticky top-0">
                      <tr>
                        <th className="py-2.5 px-4 font-semibold">Period / Dimension</th>
                        {selectedMetrics.map(m => {
                          const def = AVAILABLE_METRICS.find(x => x.key === m);
                          return (
                            <th key={m} className="py-2.5 px-4 text-right font-semibold">
                              {def?.label || m}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {reportData.rows.map((r, i) => (
                        <tr key={i} className="hover:bg-[var(--muted)]/40 transition-colors">
                          <td className="py-2.5 px-4 font-medium text-[var(--foreground)]">
                            <div>
                              <span>{formatXAxisPeriod(r.period)}</span>
                              {r.date_range && (
                                <span className="block text-[10px] text-[var(--muted-foreground)] font-normal">{r.date_range}</span>
                              )}
                            </div>
                          </td>
                          {selectedMetrics.map(m => (
                            <td key={m} className="py-2.5 px-4 text-right font-mono text-[var(--foreground)]">
                              {formatVal(r[m] || 0, m)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="w-full">
                  <ReportingChart
                    chartType={card.chart_type as any}
                    rows={reportData.rows}
                    series={reportData.chart_series}
                    summaryMeta={reportData.meta.summary}
                    height={250}
                    formatXLabel={formatXAxisPeriod}
                    formatTooltipLabel={formatTooltipPeriod}
                    formatValue={formatVal}
                    showFooterLegend={true}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
});

ReportCardItem.displayName = 'ReportCardItem';
