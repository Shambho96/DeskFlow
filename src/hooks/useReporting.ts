import useSWR from 'swr';
import { graphqlRequest } from '../lib/graphql';
import { useUser } from './useUser';
import type {
  CustomDashboard,
  CustomReportCard,
  ReportExecutionPayload,
} from '../types/reporting';

// ─── GRAPHQL DOCUMENTS ────────────────────────────────────────────────

export const GET_USER_DASHBOARDS = `
  query GetUserDashboards($outletId: Int) {
    userDashboards(outletId: $outletId) {
      id
      clientId
      createdByUserId
      outletId
      name
      description
      icon
      visibility
      sharedMembers
      isDefault
      displayOrder
      cardCount
      createdAt
      cards {
        id
        dashboardId
        clientId
        createdByUserId
        title
        reportType
        chartType
        groupBy
        datePreset
        dateFrom
        dateTo
        selectedMetrics
        outletIds
        filters
        displayOrder
        cardWidth
        createdAt
      }
    }
  }
`;

export const EXECUTE_REPORT_QUERY = `
  query ExecuteReport(
    $reportType: String!
    $outletIds: [Int!]
    $datePreset: String
    $dateFrom: String
    $dateTo: String
    $groupBy: String
    $selectedMetrics: [String!]
    $filters: JSON
  ) {
    executeReport(
      reportType: $reportType
      outletIds: $outletIds
      datePreset: $datePreset
      dateFrom: $dateFrom
      dateTo: $dateTo
      groupBy: $groupBy
      selectedMetrics: $selectedMetrics
      filters: $filters
    ) {
      meta {
        reportType
        totalRows
        dateFrom
        dateTo
        groupBy
        outletNames
        summary
      }
      rows
      chartSeries {
        name
        metricKey
        color
        data {
          label
          value
        }
      }
    }
  }
`;

export const CREATE_DASHBOARD_MUTATION = `
  mutation CreateDashboard($input: CreateDashboardInput!) {
    createDashboard(input: $input) {
      id
      name
      visibility
      cardCount
    }
  }
`;

export const UPDATE_DASHBOARD_MUTATION = `
  mutation UpdateDashboard($id: Int!, $input: UpdateDashboardInput!) {
    updateDashboard(id: $id, input: $input) {
      id
      name
      visibility
      sharedMembers
    }
  }
`;

export const DELETE_DASHBOARD_MUTATION = `
  mutation DeleteDashboard($id: Int!) {
    deleteDashboard(id: $id)
  }
`;

export const REORDER_DASHBOARDS_MUTATION = `
  mutation ReorderDashboards($input: ReorderDashboardsInput!) {
    reorderDashboards(input: $input)
  }
`;

export const ADD_REPORT_CARD_MUTATION = `
  mutation AddReportCard($input: CreateReportCardInput!) {
    addReportCard(input: $input) {
      id
      dashboardId
      title
      chartType
      selectedMetrics
    }
  }
`;

export const UPDATE_REPORT_CARD_MUTATION = `
  mutation UpdateReportCard($id: Int!, $input: UpdateReportCardInput!) {
    updateReportCard(id: $id, input: $input) {
      id
      title
      chartType
      selectedMetrics
      datePreset
    }
  }
`;

export const DELETE_REPORT_CARD_MUTATION = `
  mutation DeleteReportCard($id: Int!) {
    deleteReportCard(id: $id)
  }
`;

export const REORDER_REPORT_CARDS_MUTATION = `
  mutation ReorderReportCards($input: ReorderCardsInput!) {
    reorderReportCards(input: $input)
  }
`;

// ─── DATA NORMALIZATION HELPERS ───────────────────────────────────────

export function normalizeCard(c: any): CustomReportCard {
  return {
    id: Number(c?.id || 0),
    dashboard_id: Number(c?.dashboard_id ?? c?.dashboardId ?? 0),
    client_id: Number(c?.client_id ?? c?.clientId ?? 0),
    created_by_user_id: Number(c?.created_by_user_id ?? c?.createdByUserId ?? 0),
    title: c?.title || 'Untitled Report',
    report_type: c?.report_type ?? c?.reportType ?? 'ROOM_REVENUE',
    chart_type: c?.chart_type ?? c?.chartType ?? 'bar',
    group_by: c?.group_by ?? c?.groupBy ?? 'daily',
    date_preset: c?.date_preset ?? c?.datePreset ?? 'last_30_days',
    date_from: c?.date_from ?? c?.dateFrom ?? null,
    date_to: c?.date_to ?? c?.dateTo ?? null,
    selected_metrics: Array.isArray(c?.selected_metrics)
      ? c.selected_metrics
      : Array.isArray(c?.selectedMetrics)
      ? c.selectedMetrics
      : ['room_revenue'],
    outlet_ids: Array.isArray(c?.outlet_ids)
      ? c.outlet_ids
      : Array.isArray(c?.outletIds)
      ? c.outletIds
      : [],
    filters: c?.filters ?? {},
    display_order: Number(c?.display_order ?? c?.displayOrder ?? 0),
    card_width: Number(c?.card_width ?? c?.cardWidth ?? 1),
    created_at: c?.created_at ?? c?.createdAt ?? '',
  };
}

export function normalizeDashboard(d: any): CustomDashboard {
  const rawCards = d?.cards || [];
  return {
    id: Number(d?.id || 0),
    client_id: Number(d?.client_id ?? d?.clientId ?? 0),
    created_by_user_id: Number(d?.created_by_user_id ?? d?.createdByUserId ?? 0),
    outlet_id: d?.outlet_id ?? d?.outletId ?? null,
    name: d?.name || 'Dashboard',
    description: d?.description ?? '',
    icon: d?.icon || 'LayoutDashboard',
    visibility: d?.visibility || 'PRIVATE',
    shared_members: d?.shared_members ?? d?.sharedMembers ?? [],
    is_default: Boolean(d?.is_default ?? d?.isDefault),
    display_order: Number(d?.display_order ?? d?.displayOrder ?? 0),
    card_count: d?.card_count ?? d?.cardCount ?? rawCards.length,
    cards: rawCards.map(normalizeCard),
    created_at: d?.created_at ?? d?.createdAt ?? '',
  };
}

export function normalizeReportPayload(raw: any): ReportExecutionPayload | null {
  if (!raw) return null;
  const meta = raw.meta || {};
  const rawSeries = raw.chart_series ?? raw.chartSeries ?? [];
  return {
    meta: {
      report_type: meta.report_type ?? meta.reportType ?? 'ROOM_REVENUE',
      total_rows: Number(meta.total_rows ?? meta.totalRows ?? 0),
      date_from: meta.date_from ?? meta.dateFrom ?? '',
      date_to: meta.date_to ?? meta.dateTo ?? '',
      group_by: meta.group_by ?? meta.groupBy ?? 'daily',
      outlet_names: meta.outlet_names ?? meta.outletNames ?? [],
      summary: meta.summary ?? {},
    },
    rows: raw.rows || [],
    chart_series: rawSeries.map((s: any) => ({
      name: s.name,
      metric_key: s.metric_key ?? s.metricKey,
      color: s.color,
      data: s.data || [],
    })),
  };
}

// ─── SWR HOOKS ────────────────────────────────────────────────────────

export function useCustomDashboards(outletId?: number) {
  const { user } = useUser();
  const effectiveOutletId = outletId ?? (user?.active_outlet_id ? Number(user.active_outlet_id) : undefined);

  const { data, error, isLoading, mutate } = useSWR<{ userDashboards: any[] }>(
    user ? ['custom-dashboards', user.id, effectiveOutletId] : null,
    () => graphqlRequest(GET_USER_DASHBOARDS, { outletId: effectiveOutletId }),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60_000,
    }
  );

  const rawList = data?.userDashboards ?? [];
  const dashboards: CustomDashboard[] = rawList.map(normalizeDashboard);

  return {
    dashboards,
    isLoading,
    error,
    refreshDashboards: mutate,
  };
}

export function useReportExecution(card: CustomReportCard | null, isEnabled = true) {
  const normCard = card ? normalizeCard(card) : null;
  const metricsKey = (normCard?.selected_metrics || []).join(',');
  const outletsKey = (normCard?.outlet_ids || []).join(',');

  const key = normCard && isEnabled
    ? [
        'report-execution',
        normCard.id,
        normCard.report_type,
        normCard.date_preset,
        normCard.date_from,
        normCard.date_to,
        normCard.group_by,
        metricsKey,
        outletsKey,
      ]
    : null;

  const { data, error, isLoading, mutate } = useSWR<{ executeReport: any }>(
    key,
    () =>
      graphqlRequest(EXECUTE_REPORT_QUERY, {
        reportType: normCard?.report_type,
        outletIds: normCard?.outlet_ids,
        datePreset: normCard?.date_preset,
        dateFrom: normCard?.date_from,
        dateTo: normCard?.date_to,
        groupBy: normCard?.group_by,
        selectedMetrics: normCard?.selected_metrics,
        filters: normCard?.filters,
      }),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60_000,
      keepPreviousData: true,
    }
  );

  return {
    reportData: normalizeReportPayload(data?.executeReport),
    isLoading,
    error,
    refreshReport: mutate,
  };
}

// ─── DASHBOARD & CARD MUTATION HANDLERS ─────────────────────────────────

export async function createDashboard(input: {
  name: string;
  description?: string;
  icon?: string;
  visibility?: string;
  shared_members?: any[];
  sharedMembers?: any[];
  outlet_id?: number;
  outletId?: number;
}) {
  const payload: Record<string, any> = {
    name: input.name,
  };
  if (input.description !== undefined) payload.description = input.description;
  if (input.icon !== undefined) payload.icon = input.icon;
  if (input.visibility !== undefined) payload.visibility = input.visibility;
  const sharedMembers = input.sharedMembers ?? input.shared_members;
  if (sharedMembers !== undefined) payload.sharedMembers = sharedMembers;
  const outletId = input.outletId ?? input.outlet_id;
  if (outletId !== undefined) payload.outletId = outletId;

  return graphqlRequest(CREATE_DASHBOARD_MUTATION, { input: payload });
}

export async function updateDashboard(id: number, input: {
  name?: string;
  description?: string;
  icon?: string;
  visibility?: string;
  shared_members?: any[];
  sharedMembers?: any[];
}) {
  const payload: Record<string, any> = {};
  if (input.name !== undefined) payload.name = input.name;
  if (input.description !== undefined) payload.description = input.description;
  if (input.icon !== undefined) payload.icon = input.icon;
  if (input.visibility !== undefined) payload.visibility = input.visibility;
  const sharedMembers = input.sharedMembers ?? input.shared_members;
  if (sharedMembers !== undefined) payload.sharedMembers = sharedMembers;

  return graphqlRequest(UPDATE_DASHBOARD_MUTATION, { id, input: payload });
}

export async function deleteDashboard(id: number) {
  return graphqlRequest(DELETE_DASHBOARD_MUTATION, { id });
}

export async function reorderDashboards(orderedIds: number[]) {
  return graphqlRequest(REORDER_DASHBOARDS_MUTATION, { input: { orderedIds } });
}

export async function addReportCard(input: {
  dashboard_id: number;
  title: string;
  report_type: string;
  chart_type?: string;
  group_by?: string;
  date_preset?: string;
  date_from?: string;
  date_to?: string;
  selected_metrics?: string[];
  outlet_ids?: number[];
  filters?: any;
  card_width?: number;
}) {
  return graphqlRequest(ADD_REPORT_CARD_MUTATION, {
    input: {
      dashboardId: input.dashboard_id,
      title: input.title,
      reportType: input.report_type,
      chartType: input.chart_type,
      groupBy: input.group_by,
      datePreset: input.date_preset,
      dateFrom: input.date_from,
      dateTo: input.date_to,
      selectedMetrics: input.selected_metrics,
      outletIds: input.outlet_ids,
      filters: input.filters,
      cardWidth: input.card_width,
    },
  });
}

export async function updateReportCard(id: number, input: {
  title?: string;
  chart_type?: string;
  group_by?: string;
  date_preset?: string;
  date_from?: string;
  date_to?: string;
  selected_metrics?: string[];
  outlet_ids?: number[];
  filters?: any;
  card_width?: number;
}) {
  return graphqlRequest(UPDATE_REPORT_CARD_MUTATION, {
    id,
    input: {
      title: input.title,
      chartType: input.chart_type,
      groupBy: input.group_by,
      datePreset: input.date_preset,
      dateFrom: input.date_from,
      dateTo: input.date_to,
      selectedMetrics: input.selected_metrics,
      outletIds: input.outlet_ids,
      filters: input.filters,
      cardWidth: input.card_width,
    },
  });
}

export async function deleteReportCard(id: number) {
  return graphqlRequest(DELETE_REPORT_CARD_MUTATION, { id });
}

export async function reorderReportCards(dashboardId: number, orderedIds: number[]) {
  return graphqlRequest(REORDER_REPORT_CARDS_MUTATION, {
    input: {
      dashboardId,
      orderedIds,
    },
  });
}

export function downloadReportCSV(card: CustomReportCard) {
  const norm = normalizeCard(card);
  const query = new URLSearchParams({
    report_type: norm.report_type,
    date_preset: norm.date_preset,
    group_by: norm.group_by,
    metrics: (norm.selected_metrics || []).join(','),
    outlet_ids: (norm.outlet_ids || []).join(','),
    export_format: 'csv',
  });
  if (norm.date_from) query.set('date_from', norm.date_from);
  if (norm.date_to) query.set('date_to', norm.date_to);

  window.open(`/api/v1/reports/export?${query.toString()}`, '_blank');
}
