export const GET_OPERATIONS_BOARD = `
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

export const GET_OPERATIONS_KANBAN = `
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

export const GET_OPERATIONS_TAPE_CHART = `
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

export const GET_HOUSEKEEPING_BOARD = `
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

export const GET_GUEST_FOLIO = `
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

export const LOOKUP_GUEST_BY_PHONE_QUERY = `
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
      dateOfBirth
      city
      state
      purposeOfVisit
    }
  }
`;

export const CREATE_RESERVATION_MUTATION = `
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
      purposeOfVisit
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
        dateOfBirth
        city
        state
        purposeOfVisit
      }
    }
  }
`;

export const CHECK_IN_MUTATION = `
  mutation CheckInGuest($reservationId: Int!) {
    checkInGuest(reservationId: $reservationId) {
      id
      status
      actualCheckInTime
      roomNumber
    }
  }
`;

export const CHECK_OUT_MUTATION = `
  mutation CheckOutGuest($reservationId: Int!) {
    checkOutGuest(reservationId: $reservationId) {
      id
      status
      actualCheckOutTime
      roomNumber
    }
  }
`;

export const SETTLE_FOLIO_PAYMENT_MUTATION = `
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

export const UPDATE_HOUSEKEEPING_TASK_MUTATION = `
  mutation UpdateHousekeepingTask($taskId: Int!, $status: String!, $notes: String) {
    updateHousekeepingTask(taskId: $taskId, status: $status, notes: $notes) {
      id
      status
      completedAt
    }
  }
`;

export const REASSIGN_ROOM_MUTATION = `
  mutation ReassignRoom($reservationId: Int!, $newRoomId: Int!) {
    reassignRoom(reservationId: $reservationId, newRoomId: $newRoomId) {
      id
      roomId
      roomNumber
      status
    }
  }
`;
