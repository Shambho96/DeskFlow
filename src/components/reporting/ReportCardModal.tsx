import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Check,
  BarChart2,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Table as TableIcon,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Search,
  Calendar,
  Layers,
  LayoutGrid,
} from 'lucide-react';
import {
  AVAILABLE_METRICS,
  type ChartType,
  type DatePreset,
  type GroupBy,
  type CustomReportCard,
} from '../../types/reporting';

interface ReportCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  dashboardId: number;
  currentCardCount: number;
  initialCard?: CustomReportCard | null;
  onSave: (payload: {
    dashboard_id: number;
    title: string;
    report_type: string;
    chart_type: ChartType;
    group_by: GroupBy;
    date_preset: DatePreset;
    date_from?: string;
    date_to?: string;
    selected_metrics: string[];
    outlet_ids: number[];
    card_width: number;
  }) => Promise<void>;
}

const CATEGORIES: Array<{ id: string; label: string; icon: string }> = [
  { id: 'ALL', label: 'All Metrics', icon: '✨' },
  { id: 'REVENUE', label: 'Revenue & Sales', icon: '🏨' },
  { id: 'YIELD', label: 'Yield & Rates', icon: '📈' },
  { id: 'PAYMENT', label: 'Payments & Cash', icon: '💳' },
  { id: 'OPERATIONS', label: 'Front Desk & Guest', icon: '🛎️' },
];

const CHART_TYPES = [
  {
    id: 'bar' as ChartType,
    name: 'Bar Chart',
    desc: 'Compare daily or period figures side-by-side with clear vertical bars.',
    icon: BarChart2,
    badge: 'Most Popular',
  },
  {
    id: 'line' as ChartType,
    name: 'Line Chart',
    desc: 'Best for tracking rates, pacing, and occupancy curves over time.',
    icon: LineChartIcon,
    badge: 'Trend Analysis',
  },
  {
    id: 'area' as ChartType,
    name: 'Area Chart',
    desc: 'Visualize cumulative revenue growth and trajectory with filled curves.',
    icon: LineChartIcon,
    badge: 'Volume Trajectory',
  },
  {
    id: 'donut' as ChartType,
    name: 'Donut / Pie Chart',
    desc: 'Breakdown of proportions (e.g. payment methods, revenue mix split).',
    icon: PieChartIcon,
    badge: 'Mix Split',
  },
  {
    id: 'table' as ChartType,
    name: 'Data Table',
    desc: 'High-density tabular ledger showing exact numbers and periods.',
    icon: TableIcon,
    badge: 'Tabular Grid',
  },
];

const DATE_PRESET_OPTIONS: Array<{ value: DatePreset; label: string }> = [
  { value: 'last_7_days', label: 'Last 7 Days' },
  { value: 'last_14_days', label: 'Last 14 Days' },
  { value: 'this_month', label: 'This Month' },
  { value: 'month_to_date', label: 'Month to Date (MTD)' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'last_3_months', label: 'Last 3 Months' },
  { value: 'last_6_months', label: 'Last 6 Months' },
  { value: 'last_1_year', label: 'Last 1 Year' },
  { value: 'year_to_date', label: 'Year to Date (YTD)' },
  { value: 'last_30_days', label: 'Last 30 Days' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'custom', label: 'Custom Date Range...' },
];

export const ReportCardModal: React.FC<ReportCardModalProps> = ({
  isOpen,
  onClose,
  dashboardId,
  currentCardCount,
  initialCard,
  onSave,
}) => {
  const isEditing = Boolean(initialCard);

  // Stepper State (Step 1 = Chart Type, Step 2 = Metrics, Step 3 = Customize & Save)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [title, setTitle] = useState('');
  const [isTitleManual, setIsTitleManual] = useState(false);
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [groupBy, setGroupBy] = useState<GroupBy>('daily');
  const [datePreset, setDatePreset] = useState<DatePreset>('last_7_days');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['room_revenue']);
  const [cardWidth, setCardWidth] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Step 2 Category & Search Filter
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [metricSearch, setMetricSearch] = useState<string>('');

  // Pre-fill on open or edit
  useEffect(() => {
    if (initialCard) {
      setTitle(initialCard.title);
      setIsTitleManual(true);
      setChartType(initialCard.chart_type);
      setGroupBy(initialCard.group_by);
      setDatePreset(initialCard.date_preset);
      setDateFrom(initialCard.date_from || '');
      setDateTo(initialCard.date_to || '');
      setSelectedMetrics(
        initialCard.selected_metrics ||
        (initialCard as any).selectedMetrics ||
        ['room_revenue']
      );
      setCardWidth(initialCard.card_width || 1);
      setStep(1);
    } else {
      setTitle('Room Revenue Analysis');
      setIsTitleManual(false);
      setChartType('bar');
      setGroupBy('daily');
      setDatePreset('last_7_days');
      setDateFrom('');
      setDateTo('');
      setSelectedMetrics(['room_revenue']);
      setCardWidth(1);
      setStep(1);
    }
    setErrorMsg(null);
    setActiveCategory('ALL');
    setMetricSearch('');
  }, [initialCard, isOpen]);

  // Smart title generation when metrics change (if user hasn't manually edited title)
  const generateSmartTitle = (metrics: string[]) => {
    if (metrics.length === 0) return 'Custom Analytics Report';
    const labels = metrics
      .map(k => AVAILABLE_METRICS.find(m => m.key === k)?.label)
      .filter(Boolean);
    if (labels.length === 1) return `${labels[0]} Report`;
    if (labels.length === 2) return `${labels[0]} & ${labels[1]}`;
    return `${labels[0]}, ${labels[1]} & ${labels.length - 2} more`;
  };

  const handleMetricToggle = (key: string) => {
    let next: string[];
    if (selectedMetrics.includes(key)) {
      if (selectedMetrics.length === 1) {
        setErrorMsg('At least one metric must be selected.');
        return;
      }
      next = selectedMetrics.filter(m => m !== key);
    } else {
      next = [...selectedMetrics, key];
    }
    setSelectedMetrics(next);
    setErrorMsg(null);

    // Auto-update title if not manually overwritten
    if (!isTitleManual) {
      setTitle(generateSmartTitle(next));
    }
  };

  // Filtered metrics for Step 2
  const filteredMetrics = useMemo(() => {
    return AVAILABLE_METRICS.filter(m => {
      const matchCat = activeCategory === 'ALL' || m.category === activeCategory;
      const matchSearch =
        !metricSearch.trim() ||
        m.label.toLowerCase().includes(metricSearch.toLowerCase()) ||
        m.key.toLowerCase().includes(metricSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeCategory, metricSearch]);

  if (!isOpen) return null;

  const isLimitReached = !isEditing && currentCardCount >= 10;

  // Step Navigation Handlers
  const handleNextStep = () => {
    setErrorMsg(null);
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (selectedMetrics.length === 0) {
        setErrorMsg('Please select at least one metric to continue.');
        return;
      }
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setErrorMsg(null);
    if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // STRICT GUARD: ONLY SAVE WHEN USER IS EXPLICITLY ON STEP 3 AND SAVES!
    if (step !== 3) {
      handleNextStep();
      return;
    }

    if (!title.trim()) {
      setErrorMsg('Please enter a name for this report chart.');
      return;
    }
    if (selectedMetrics.length === 0) {
      setErrorMsg('Please select at least one metric to display.');
      return;
    }

    if (datePreset === 'custom') {
      if (!dateFrom || !dateTo) {
        setErrorMsg('Please specify both Start Date and End Date for custom date range.');
        return;
      }
      if (dateFrom > dateTo) {
        setErrorMsg('Start Date cannot be after End Date.');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      // Determine appropriate report_type code
      let reportTypeCode = 'CUSTOM';
      if (selectedMetrics.includes('room_revenue') && selectedMetrics.length === 1) {
        reportTypeCode = 'ROOM_REVENUE';
      } else if (selectedMetrics.includes('occupancy_pct')) {
        reportTypeCode = 'OCCUPANCY';
      } else if (selectedMetrics.includes('total_revenue')) {
        reportTypeCode = 'TOTAL_REVENUE';
      } else if (selectedMetrics.some(m => m.includes('collected'))) {
        reportTypeCode = 'FINANCE_PAYMENTS';
      }

      await onSave({
        dashboard_id: dashboardId,
        title: title.trim(),
        report_type: reportTypeCode,
        chart_type: chartType,
        group_by: groupBy,
        date_preset: datePreset,
        date_from: datePreset === 'custom' ? dateFrom : undefined,
        date_to: datePreset === 'custom' ? dateTo : undefined,
        selected_metrics: selectedMetrics,
        outlet_ids: [],
        card_width: cardWidth,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save report card.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-xl text-[var(--card-foreground)] transform-gpu">
        
        {/* ─── MODAL HEADER ────────────────────────────────────────────────────────── */}
        <div className="p-5 pb-4 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-[var(--primary)]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)] tracking-tight">
                {isEditing ? 'Edit Report Chart' : 'Add New Chart to Dashboard'}
              </h2>
              <p className="text-xs text-[var(--muted-foreground)]">
                Step {step} of 3 • {step === 1 ? 'Choose Visual Chart' : step === 2 ? 'Select Metrics' : 'Customize & Save'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-lg hover:bg-[var(--muted)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ─── STEPPER PROGRESS BAR ─────────────────────────────────────────────────── */}
        <div className="px-6 py-3 bg-[var(--muted)]/40 border-b border-[var(--border)] flex items-center justify-between text-xs">
          {[
            { num: 1, label: '1. Chart Type' },
            { num: 2, label: '2. Select Metrics' },
            { num: 3, label: '3. Customize & Save' },
          ].map(s => {
            const isCurrent = step === s.num;
            const isPassed = step > s.num;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  if (s.num < step || (s.num === 2 && step === 1) || (s.num === 3 && selectedMetrics.length > 0)) {
                    setStep(s.num as 1 | 2 | 3);
                  }
                }}
                className={`flex items-center gap-2 font-semibold transition-colors cursor-pointer ${
                  isCurrent
                    ? 'text-[var(--primary)] font-bold'
                    : isPassed
                    ? 'text-[var(--foreground)]'
                    : 'text-[var(--muted-foreground)]'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                    isCurrent
                      ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs'
                      : isPassed
                      ? 'bg-emerald-500 text-white'
                      : 'bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)]'
                  }`}
                >
                  {isPassed ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.num}
                </div>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* ─── ERROR & LIMIT ALERTS ─────────────────────────────────────────────────── */}
        <div className="px-6 pt-3">
          {isLimitReached && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 p-3 rounded-xl flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                Maximum limit of 10 charts reached on this dashboard. Please create a new board to add more.
              </span>
            </div>
          )}

          {errorMsg && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 p-3 rounded-xl flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* ─── SCROLLABLE STEP BODY ─────────────────────────────────────────────────── */}
        <form
          onSubmit={e => {
            e.preventDefault();
            if (step === 3) {
              handleSubmit(e);
            } else {
              handleNextStep();
            }
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
              e.preventDefault();
              if (step < 3) {
                handleNextStep();
              } else {
                handleSubmit();
              }
            }
          }}
          className="p-6 overflow-y-auto space-y-5 text-xs flex-1"
        >
          
          {/* ═══════════════════════════════════════════════════════════════════════════
              STEP 1: CHART TYPE & LAYOUT SPAN
             ═══════════════════════════════════════════════════════════════════════════ */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h3 className="font-bold text-sm text-[var(--foreground)]">Choose Visual Chart Type</h3>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  Select the visual format that best represents your report data.
                </p>
              </div>

              {/* Chart Type Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {CHART_TYPES.map(opt => {
                  const Icon = opt.icon;
                  const isSelected = chartType === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setChartType(opt.id)}
                      className={`p-4 rounded-xl border flex flex-col justify-between gap-3 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[var(--primary)]/10 border-[var(--primary)] shadow-xs ring-1 ring-[var(--primary)]'
                          : 'bg-[var(--card)] border-[var(--border)] hover:border-[var(--primary)]/40 hover:bg-[var(--muted)]/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                                : 'bg-[var(--muted)] text-[var(--foreground)]'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-bold text-xs text-[var(--foreground)] block">
                              {opt.name}
                            </span>
                            <span className="text-[10px] font-semibold text-[var(--primary)]">
                              {opt.badge}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                        {opt.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Card Width Option */}
              <div className="pt-2 border-t border-[var(--border)] space-y-2">
                <label className="block font-semibold text-[var(--foreground)] uppercase tracking-wider text-[11px]">
                  Dashboard Grid Width
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCardWidth(1)}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                      cardWidth === 1
                        ? 'bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--foreground)] font-bold'
                        : 'bg-[var(--card)] border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]/40'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4 shrink-0 text-[var(--primary)]" />
                    <div>
                      <span className="block text-xs font-semibold text-[var(--foreground)]">Standard (1 Column)</span>
                      <span className="text-[10px] text-[var(--muted-foreground)]">Compact half-grid card</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCardWidth(2)}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                      cardWidth === 2
                        ? 'bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--foreground)] font-bold'
                        : 'bg-[var(--card)] border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]/40'
                    }`}
                  >
                    <Layers className="w-4 h-4 shrink-0 text-[var(--primary)]" />
                    <div>
                      <span className="block text-xs font-semibold text-[var(--foreground)]">Wide (2 Columns)</span>
                      <span className="text-[10px] text-[var(--muted-foreground)]">Full width expansive chart</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════════
              STEP 2: CATEGORIZED METRICS MULTI-SELECTION
             ═══════════════════════════════════════════════════════════════════════════ */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-sm text-[var(--foreground)]">Select Report Metrics</h3>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  Browse by category and pick single or multiple metrics across any category.
                </p>
              </div>

              {/* Category Filter Pills & Search Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  {CATEGORIES.map(cat => {
                    const isActive = activeCategory === cat.id;
                    const countInCat =
                      cat.id === 'ALL'
                        ? AVAILABLE_METRICS.length
                        : AVAILABLE_METRICS.filter(m => m.category === cat.id).length;

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setActiveCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs'
                            : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/80'
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                            isActive ? 'bg-white/20 text-white' : 'bg-[var(--background)] text-[var(--muted-foreground)]'
                          }`}
                        >
                          {countInCat}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Search Input */}
                <div className="relative shrink-0 w-full sm:w-44">
                  <Search className="w-3.5 h-3.5 text-[var(--muted-foreground)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={metricSearch}
                    onChange={e => setMetricSearch(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                      }
                    }}
                    placeholder="Search metrics..."
                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>

              {/* Active Selected Metrics Summary Bar */}
              <div className="p-3 bg-[var(--muted)]/50 border border-[var(--border)] rounded-xl flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-[11px] text-[var(--foreground)] mr-1">
                    Selected ({selectedMetrics.length}):
                  </span>
                  {selectedMetrics.map(mKey => {
                    const def = AVAILABLE_METRICS.find(m => m.key === mKey);
                    return (
                      <span
                        key={mKey}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] shadow-2xs"
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: def?.color || 'var(--primary)' }} />
                        <span>{def?.label || mKey}</span>
                        <button
                          type="button"
                          onClick={() => handleMetricToggle(mKey)}
                          className="hover:text-rose-500 cursor-pointer"
                          title="Remove metric"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>

                {selectedMetrics.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMetrics(['room_revenue']);
                      if (!isTitleManual) setTitle(generateSmartTitle(['room_revenue']));
                    }}
                    className="text-[11px] font-semibold text-rose-500 hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Metrics Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-80 overflow-y-auto pr-1">
                {filteredMetrics.map(m => {
                  const isSelected = selectedMetrics.includes(m.key);
                  return (
                    <div
                      key={m.key}
                      onClick={() => handleMetricToggle(m.key)}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[var(--primary)]/10 border-[var(--primary)] shadow-xs ring-1 ring-[var(--primary)]'
                          : 'bg-[var(--card)] border-[var(--border)] hover:border-[var(--primary)]/40 hover:bg-[var(--muted)]/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Checkbox */}
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                            isSelected
                              ? 'bg-[var(--primary)] border-[var(--primary)] text-[var(--primary-foreground)]'
                              : 'border-[var(--border)] bg-[var(--background)]'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        {/* Color accent + Label */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                            <span className="font-bold text-xs text-[var(--foreground)] truncate">
                              {m.label}
                            </span>
                          </div>
                          <span className="text-[10px] text-[var(--muted-foreground)] block mt-0.5">
                            Category: {m.category}
                          </span>
                        </div>
                      </div>

                      {/* Unit Badge */}
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[var(--muted)] text-[var(--muted-foreground)] shrink-0">
                        {m.unit}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════════
              STEP 3: CUSTOMIZE & SAVE
             ═══════════════════════════════════════════════════════════════════════════ */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-sm text-[var(--foreground)]">Configure &amp; Finalize</h3>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  Set custom title, date preset, and preview your report card before saving.
                </p>
              </div>

              {/* 1. Custom Title Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block font-semibold text-[var(--foreground)] uppercase tracking-wider text-[11px]">
                    Report Card Custom Title
                  </label>
                  {!isTitleManual && (
                    <span className="text-[10px] text-[var(--primary)] font-medium">
                      Auto-generated
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={e => {
                    setTitle(e.target.value);
                    setIsTitleManual(true);
                  }}
                  placeholder="e.g. October Room Revenue Only"
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3.5 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  required
                />
              </div>

              {/* 2. Date Preset & Grouping */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-semibold text-[var(--foreground)] uppercase tracking-wider text-[11px]">
                    Date Period Preset
                  </label>
                  <select
                    value={datePreset}
                    onChange={e => setDatePreset(e.target.value as DatePreset)}
                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors h-[42px] cursor-pointer"
                  >
                    {DATE_PRESET_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold text-[var(--foreground)] uppercase tracking-wider text-[11px]">
                    Group Pacing
                  </label>
                  <div className="flex rounded-xl bg-[var(--muted)] p-1 border border-[var(--border)] h-[42px] items-center">
                    {(['daily', 'weekly', 'monthly'] as GroupBy[]).map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGroupBy(g)}
                        className={`flex-1 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                          groupBy === g
                            ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs font-bold'
                            : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Custom Date Range Pickers (Rendered if 'custom' preset is selected) */}
              {datePreset === 'custom' && (
                <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--foreground)]">
                    <Calendar className="w-3.5 h-3.5 text-[var(--primary)]" />
                    <span>Specify Custom Date Range</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                        From (Start Date)
                      </label>
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={e => setDateFrom(e.target.value)}
                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                        To (End Date)
                      </label>
                      <input
                        type="date"
                        value={dateTo}
                        onChange={e => setDateTo(e.target.value)}
                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Live Card Summary Preview */}
              <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                <span className="block font-semibold text-[var(--foreground)] uppercase tracking-wider text-[11px]">
                  Card Live Preview
                </span>
                <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--muted-foreground)] text-xs">⠿</span>
                      <span className="font-bold text-sm text-[var(--foreground)]">{title || 'Untitled Card'}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 capitalize">
                      {chartType} Chart • {cardWidth === 2 ? 'Full Width' : 'Half Width'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--muted)] border border-[var(--border)] text-[var(--muted-foreground)]">
                      <Calendar className="w-3 h-3" />
                      {datePreset === 'custom' && dateFrom && dateTo
                        ? `${dateFrom} to ${dateTo}`
                        : DATE_PRESET_OPTIONS.find(o => o.value === datePreset)?.label || datePreset.replace(/_/g, ' ')}
                    </span>
                    {selectedMetrics.map(mKey => {
                      const def = AVAILABLE_METRICS.find(m => m.key === mKey);
                      return (
                        <span
                          key={mKey}
                          className="px-2.5 py-0.5 rounded-full text-xs font-semibold text-[var(--foreground)] bg-[var(--muted)] border border-[var(--border)]"
                        >
                          {def?.label || mKey}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── FOOTER CONTROLS WITH STEPPER NAVIGATION ────────────────────────────── */}
          <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--foreground)] bg-[var(--muted)] hover:bg-[var(--muted)]/80 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[var(--primary)] text-white shadow-md hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={isSubmitting || isLimitReached}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[var(--primary)] text-white shadow-md hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{isSubmitting ? 'Saving...' : isEditing ? 'Update Chart' : 'Save to Dashboard'}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
