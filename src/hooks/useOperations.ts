import { useMemo } from 'react';
import useSWR, { mutate as globalMutate } from 'swr';
import { graphqlRequest } from '../lib/graphql';
import { useUser } from './useUser';
import type {
  OperationsBoardPayload,
  OperationsKanbanPayload,
  OperationsTapeChartPayload,
  HousekeepingBoardPayload,
  GuestFolioRecord,
  CreateReservationInput,
  SettlePaymentInput,
  ReservationRecord,
  GuestRecord
} from '../types/operations';

import {
  GET_OPERATIONS_BOARD,
  GET_OPERATIONS_KANBAN,
  GET_OPERATIONS_TAPE_CHART,
  GET_HOUSEKEEPING_BOARD,
  GET_GUEST_FOLIO,
  LOOKUP_GUEST_BY_PHONE_QUERY,
  CREATE_RESERVATION_MUTATION,
  CHECK_IN_MUTATION,
  CHECK_OUT_MUTATION,
  SETTLE_FOLIO_PAYMENT_MUTATION,
  UPDATE_HOUSEKEEPING_TASK_MUTATION,
  REASSIGN_ROOM_MUTATION
} from '../graphql/operationsQueries';

export {
  GET_OPERATIONS_BOARD,
  GET_OPERATIONS_KANBAN,
  GET_OPERATIONS_TAPE_CHART,
  GET_HOUSEKEEPING_BOARD,
  GET_GUEST_FOLIO,
  LOOKUP_GUEST_BY_PHONE_QUERY,
  CREATE_RESERVATION_MUTATION,
  CHECK_IN_MUTATION,
  CHECK_OUT_MUTATION,
  SETTLE_FOLIO_PAYMENT_MUTATION,
  UPDATE_HOUSEKEEPING_TASK_MUTATION,
  REASSIGN_ROOM_MUTATION
};

// ==============================================================================
// HOOK IMPLEMENTATION
// ==============================================================================

export const useOperations = (
  dateStr: string,
  buildingIdFilter?: string,
  floorIdFilter?: string
) => {
  const { user } = useUser();

  const parsedBuildingId = useMemo(() => {
    if (!buildingIdFilter || buildingIdFilter === 'ALL') return undefined;
    const num = Number(buildingIdFilter);
    return isNaN(num) ? undefined : num;
  }, [buildingIdFilter]);

  const parsedFloorId = useMemo(() => {
    if (!floorIdFilter || floorIdFilter === 'ALL') return undefined;
    const num = Number(floorIdFilter);
    return isNaN(num) ? undefined : num;
  }, [floorIdFilter]);

  // 1. Operations Room Board SWR
  const outletId = user?.active_outlet_id ? Number(user.active_outlet_id) : null;
  const boardKey = outletId ? ['operationsBoard', outletId, dateStr, parsedBuildingId, parsedFloorId] : null;
  const {
    data: boardData,
    error: boardError,
    isLoading: isBoardLoading,
    mutate: mutateBoard
  } = useSWR<{ operationsBoard: OperationsBoardPayload }>(
    boardKey,
    () => graphqlRequest(GET_OPERATIONS_BOARD, {
      dateStr,
      buildingId: parsedBuildingId,
      floorId: parsedFloorId
    }),
    { revalidateOnFocus: true, dedupingInterval: 3000 }
  );

  // 2. Operations Kanban SWR
  const kanbanKey = outletId ? ['operationsKanban', outletId, dateStr] : null;
  const {
    data: kanbanData,
    error: kanbanError,
    isLoading: isKanbanLoading,
    mutate: mutateKanban
  } = useSWR<{ operationsKanban: OperationsKanbanPayload }>(
    kanbanKey,
    () => graphqlRequest(GET_OPERATIONS_KANBAN, { dateStr }),
    { revalidateOnFocus: true, dedupingInterval: 3000 }
  );

  // 3. Operations Tape Chart SWR
  const tapeKey = outletId ? ['operationsTapeChart', outletId, dateStr] : null;
  const {
    data: tapeData,
    error: tapeError,
    isLoading: isTapeLoading,
    mutate: mutateTape
  } = useSWR<{ operationsTapeChart: OperationsTapeChartPayload }>(
    tapeKey,
    () => graphqlRequest(GET_OPERATIONS_TAPE_CHART, { startDateStr: dateStr, daysCount: 7 }),
    { revalidateOnFocus: true, dedupingInterval: 3000 }
  );

  // 4. Housekeeping Board SWR
  const hkKey = outletId ? ['housekeepingBoard', outletId, parsedFloorId] : null;
  const {
    data: housekeepingData,
    error: housekeepingError,
    isLoading: isHousekeepingLoading,
    mutate: mutateHousekeeping
  } = useSWR<{ housekeepingBoard: HousekeepingBoardPayload }>(
    hkKey,
    () => graphqlRequest(GET_HOUSEKEEPING_BOARD, { floorId: parsedFloorId }),
    { revalidateOnFocus: true, dedupingInterval: 3000 }
  );

  // Global refresh
  const refreshAll = async () => {
    await Promise.all([
      mutateBoard(),
      mutateKanban(),
      mutateTape(),
      mutateHousekeeping(),
      globalMutate(key => Array.isArray(key) && key[0] === 'crm_guests'),
      globalMutate('crm_guest_stats')
    ]);
  };

  // ----------------------------------------------------------------------------
  // MUTATIONS
  // ----------------------------------------------------------------------------

  const createReservation = async (input: CreateReservationInput): Promise<ReservationRecord> => {
    // Generate UUID idempotency key if not passed
    const idempotencyKey = input.idempotencyKey || (typeof crypto !== 'undefined' ? crypto.randomUUID() : `idemp-${Date.now()}`);
    const res = await graphqlRequest<{ createReservation: ReservationRecord }>(
      CREATE_RESERVATION_MUTATION,
      { input: { ...input, idempotencyKey } }
    );
    await Promise.all([
      refreshAll(),
      globalMutate(key => Array.isArray(key) && key[0] === 'crm_guests'),
      globalMutate('crm_guest_stats')
    ]);
    return res.createReservation;
  };

  const checkInGuest = async (reservationId: number) => {
    const res = await graphqlRequest(CHECK_IN_MUTATION, { reservationId });
    await refreshAll();
    return res.checkInGuest;
  };

  const checkOutGuest = async (reservationId: number) => {
    const res = await graphqlRequest(CHECK_OUT_MUTATION, { reservationId });
    await refreshAll();
    return res.checkOutGuest;
  };

  const settleFolioPayment = async (input: SettlePaymentInput) => {
    const idempotencyKey = input.idempotencyKey || (typeof crypto !== 'undefined' ? crypto.randomUUID() : `pay-${Date.now()}`);
    const res = await graphqlRequest(
      SETTLE_FOLIO_PAYMENT_MUTATION,
      { input: { ...input, idempotencyKey } }
    );
    await refreshAll();
    return res.settleFolioPayment;
  };

  const updateHousekeepingTask = async (taskId: number, status: string, notes?: string) => {
    const res = await graphqlRequest(
      UPDATE_HOUSEKEEPING_TASK_MUTATION,
      { taskId, status, notes }
    );
    await refreshAll();
    return res.updateHousekeepingTask;
  };

  const reassignRoom = async (reservationId: number, newRoomId: number) => {
    const res = await graphqlRequest(
      REASSIGN_ROOM_MUTATION,
      { reservationId, newRoomId }
    );
    await refreshAll();
    return res.reassignRoom;
  };

  const fetchGuestFolio = async (reservationId: number): Promise<GuestFolioRecord | null> => {
    const res = await graphqlRequest<{ guestFolio: GuestFolioRecord | null }>(
      GET_GUEST_FOLIO,
      { reservationId }
    );
    return res.guestFolio;
  };

  const lookupGuestByPhone = async (phone: string): Promise<GuestRecord | null> => {
    try {
      const res = await graphqlRequest<{ lookupGuestByPhone: GuestRecord | null }>(
        LOOKUP_GUEST_BY_PHONE_QUERY,
        { phone }
      );
      return res.lookupGuestByPhone;
    } catch (err) {
      console.warn('Failed to lookup guest by phone:', err);
      return null;
    }
  };

  return {
    // Data
    board: boardData?.operationsBoard,
    kanban: kanbanData?.operationsKanban,
    tapeChart: tapeData?.operationsTapeChart,
    housekeeping: housekeepingData?.housekeepingBoard,

    // Loading states
    isLoading: isBoardLoading || isKanbanLoading,
    isBoardLoading,
    isKanbanLoading,
    isTapeLoading,
    isHousekeepingLoading,

    // Errors
    error: boardError || kanbanError || tapeError || housekeepingError,

    // Actions
    createReservation,
    checkInGuest,
    checkOutGuest,
    settleFolioPayment,
    updateHousekeepingTask,
    reassignRoom,
    fetchGuestFolio,
    lookupGuestByPhone,
    refreshAll
  };
};
