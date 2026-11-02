import { useMemo } from 'react';
import useSWR from 'swr';
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

// ==============================================================================
// GRAPHQL DOCUMENT DEFINITIONS
// ==============================================================================

const GET_OPERATIONS_BOARD = `
  query GetOperationsBoard($dateStr: String!, $buildingId: Int, $floorId: Int) {
    operationsBoard(dateStr: $dateStr, buildingId: $buildingId, floorId: $floorId) {
      date
      summary {
        totalRooms
        availableRooms
        reservedRooms
        occupiedRooms
        oooRooms
        bookedCount
        occupancyPercentage
      }
      buildings {
        id
        name
        code
        buildingType
        displayOrder
        isActive
      }
      rooms {
        id
        roomNumber
        floorId
        buildingId
        categoryName
        effectivePrice
        computedStatus
        activeReservation {
          id
          reservationCode
          roomId
          roomNumber
          categoryId
          categoryName
          checkInDate
          checkOutDate
          actualCheckInTime
          actualCheckOutTime
          eta
          status
          bookingSource
          adultsCount
          childrenCount
          ratePerNight
          totalRoomCharges
          taxAmount
          grandTotal
          paidAmount
          balanceDue
          guest {
            id
            firstName
            lastName
            fullName
            phone
            email
            idType
            idNumber
            vipStatus
            nationality
          }
        }
      }
    }
  }
`;

const GET_OPERATIONS_KANBAN = `
  query GetOperationsKanban($dateStr: String!) {
    operationsKanban(dateStr: $dateStr) {
      arrivals {
        id
        reservationCode
        roomId
        roomNumber
        checkInDate
        checkOutDate
        status
        bookingSource
        adultsCount
        childrenCount
        ratePerNight
        totalRoomCharges
        taxAmount
        grandTotal
        paidAmount
        balanceDue
        guest { id firstName lastName fullName phone email }
      }
      inHouse {
        id
        reservationCode
        roomId
        roomNumber
        checkInDate
        checkOutDate
        status
        bookingSource
        adultsCount
        childrenCount
        ratePerNight
        totalRoomCharges
        taxAmount
        grandTotal
        paidAmount
        balanceDue
        guest { id firstName lastName fullName phone email }
      }
      departures {
        id
        reservationCode
        roomId
        roomNumber
        checkInDate
        checkOutDate
        status
        bookingSource
        adultsCount
        childrenCount
        ratePerNight
        totalRoomCharges
        taxAmount
        grandTotal
        paidAmount
        balanceDue
        guest { id firstName lastName fullName phone email }
      }
      settled {
        id
        reservationCode
        roomId
        roomNumber
        checkInDate
        checkOutDate
        status
        bookingSource
        adultsCount
        childrenCount
        ratePerNight
        totalRoomCharges
        taxAmount
        grandTotal
        paidAmount
        balanceDue
        guest { id firstName lastName fullName phone email }
      }
    }
  }
`;

const GET_OPERATIONS_TAPE_CHART = `
  query GetOperationsTapeChart($startDateStr: String!, $daysCount: Int!) {
    operationsTapeChart(startDateStr: $startDateStr, daysCount: $daysCount) {
      startDate
      daysCount
      rooms {
        id
        roomNumber
        floorId
        buildingId
        categoryName
        effectivePrice
        computedStatus
      }
      reservations {
        id
        reservationCode
        roomId
        roomNumber
        checkInDate
        checkOutDate
        status
        bookingSource
        adultsCount
        childrenCount
        ratePerNight
        totalRoomCharges
        taxAmount
        grandTotal
        paidAmount
        balanceDue
        guest { id firstName lastName fullName phone }
      }
    }
  }
`;

const GET_HOUSEKEEPING_BOARD = `
  query GetHousekeepingBoard($floorId: Int) {
    housekeepingBoard(floorId: $floorId) {
      dirtyCount
      cleanCount
      occupiedCount
      oooCount
      tasks {
        id
        roomId
        roomNumber
        taskType
        priority
        status
        notes
        startedAt
        completedAt
      }
    }
  }
`;

const GET_GUEST_FOLIO = `
  query GetGuestFolio($reservationId: Int!) {
    guestFolio(reservationId: $reservationId) {
      id
      folioNumber
      reservationId
      status
      subtotal
      taxTotal
      grandTotal
      paidAmount
      balanceDue
      lineItems {
        id
        chargeCategory
        description
        unitPrice
        quantity
        taxRate
        taxAmount
        totalAmount
        postedAt
      }
      payments {
        id
        amount
        paymentMethod
        transactionRef
        status
        receiptNumber
        paymentDate
      }
    }
  }
`;

const LOOKUP_GUEST_BY_PHONE_QUERY = `
  query LookupGuestByPhone($phone: String!) {
    lookupGuestByPhone(phone: $phone) {
      id
      firstName
      lastName
      fullName
      phone
      email
      idType
      idNumber
      vipStatus
      nationality
      bookingSource
      specialRequests
    }
  }
`;

const CREATE_RESERVATION_MUTATION = `
  mutation CreateReservation($input: CreateReservationInput!) {
    createReservation(input: $input) {
      id
      reservationCode
      roomId
      roomNumber
      checkInDate
      checkOutDate
      status
      bookingSource
      ratePerNight
      totalRoomCharges
      taxAmount
      grandTotal
      paidAmount
      balanceDue
      guest {
        id
        firstName
        lastName
        fullName
        phone
      }
    }
  }
`;

const CHECK_IN_MUTATION = `
  mutation CheckInGuest($reservationId: Int!) {
    checkInGuest(reservationId: $reservationId) {
      id
      status
      actualCheckInTime
      roomNumber
    }
  }
`;

const CHECK_OUT_MUTATION = `
  mutation CheckOutGuest($reservationId: Int!) {
    checkOutGuest(reservationId: $reservationId) {
      id
      status
      actualCheckOutTime
      roomNumber
    }
  }
`;

const SETTLE_FOLIO_PAYMENT_MUTATION = `
  mutation SettleFolioPayment($input: SettlePaymentInput!) {
    settleFolioPayment(input: $input) {
      id
      amount
      paymentMethod
      transactionRef
      status
      receiptNumber
      paymentDate
    }
  }
`;

const UPDATE_HOUSEKEEPING_TASK_MUTATION = `
  mutation UpdateHousekeepingTask($taskId: Int!, $status: String!, $notes: String) {
    updateHousekeepingTask(taskId: $taskId, status: $status, notes: $notes) {
      id
      status
      completedAt
    }
  }
`;

const REASSIGN_ROOM_MUTATION = `
  mutation ReassignRoom($reservationId: Int!, $newRoomId: Int!) {
    reassignRoom(reservationId: $reservationId, newRoomId: $newRoomId) {
      id
      roomId
      roomNumber
      status
    }
  }
`;

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
  const boardKey = user ? ['operationsBoard', dateStr, parsedBuildingId, parsedFloorId] : null;
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
  const kanbanKey = user ? ['operationsKanban', dateStr] : null;
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
  const tapeKey = user ? ['operationsTapeChart', dateStr] : null;
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
  const hkKey = user ? ['housekeepingBoard', parsedFloorId] : null;
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
      mutateHousekeeping()
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
    await refreshAll();
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
