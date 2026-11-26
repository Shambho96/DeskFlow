import type { LiveRoomStatus } from '../types/hotel';

export interface CreateBuildingInput {
  name: string;
  code?: string;
  buildingType?: string;
  displayOrder?: number;
}

export interface UpdateBuildingInput {
  name?: string;
  code?: string;
  buildingType?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface ReorderBuildingsInput {
  buildingIds: number[];
}

export interface CreateFloorInput {
  floorNumber: number;
  name: string;
  buildingId?: number;
}

export interface UpdateFloorInput {
  floorNumber?: number;
  name?: string;
  buildingId?: number;
  isActive?: boolean;
}

export interface ReorderFloorsInput {
  buildingId: number;
  floorIdsBottomToTop: number[];
}

export interface CreateRoomCategoryInput {
  name: string;
  basePrice: number;
  code?: string;
  maxAdults?: number;
  maxChildren?: number;
  amenities?: string[];
}

export interface UpdateRoomCategoryInput {
  name?: string;
  code?: string;
  basePrice?: number;
  maxAdults?: number;
  maxChildren?: number;
  amenities?: string[];
  isActive?: boolean;
}

export interface CreateRoomInput {
  floorId: number;
  roomNumber: string;
  categoryId?: number | null;
  customName?: string | null;
  customPrice?: number | null;
  customAmenities?: string[];
}

export interface CreateBulkRoomsInput {
  floorId: number;
  startNumber: number;
  endNumber: number;
  categoryId?: number | null;
  prefix?: string;
  customPrice?: number | null;
}

export interface UpdateRoomInput {
  floorId?: number;
  categoryId?: number | null;
  roomNumber?: string;
  customName?: string | null;
  customPrice?: number | null;
  customAmenities?: string[] | null;
  status?: LiveRoomStatus;
  isActive?: boolean;
}

export interface CreateUtilityInput {
  buildingId: number;
  name: string;
  utilityType: string;
  floorId?: number | null;
  status?: 'OPEN' | 'CLOSED' | 'CLEANING' | 'MAINTENANCE';
  capacity?: number | null;
  operatingHours?: string | null;
  isBookable?: boolean;
  rentalPrice?: number | null;
  amenities?: string[];
}

export interface UpdateUtilityInput {
  name?: string;
  utilityType?: string;
  buildingId?: number;
  floorId?: number | null;
  status?: 'OPEN' | 'CLOSED' | 'CLEANING' | 'MAINTENANCE';
  capacity?: number | null;
  operatingHours?: string | null;
  isBookable?: boolean;
  rentalPrice?: number | null;
  amenities?: string[];
  isActive?: boolean;
}

export const GET_CAMPUS_DATA_QUERY = `
  query GetCampusData {
    campusLayout {
      status
      totalBuildings
      totalFloors
      totalRooms
      availableRooms
      occupiedRooms
      cleaningRooms
      maintenanceRooms
      totalUtilities
      buildings {
        building {
          id
          name
          code
          buildingType
          displayOrder
          isActive
          floorCount
          roomCount
          utilityCount
        }
        totalFloors
        totalRooms
        floors {
          id
          floorNumber
          name
          buildingId
          buildingName
          isActive
          roomCount
          rooms {
            id
            roomNumber
            status
            floorId
            floorName
            floorNumber
            buildingId
            buildingName
            categoryId
            categoryName
            basePrice
            amenities
            customName
            customPrice
            customAmenities
            isActive
          }
          utilities {
            id
            name
            utilityType
            status
            buildingId
            floorId
            capacity
            operatingHours
            isBookable
            rentalPrice
            amenities
            isActive
          }
        }
        utilities {
          id
          name
          utilityType
          status
          buildingId
          floorId
          capacity
          operatingHours
          isBookable
          rentalPrice
          amenities
          isActive
        }
      }
    }
    roomCategories(isActive: true) {
      id
      name
      code
      basePrice
      maxAdults
      maxChildren
      amenities
      isActive
      roomCount
    }
  }
`;

export const CREATE_BUILDING_MUTATION = `
  mutation CreateBuilding($input: CreateBuildingInput!) {
    createBuilding(input: $input) {
      id
      name
      code
      buildingType
      displayOrder
      isActive
      floorCount
      roomCount
      utilityCount
    }
  }
`;

export const UPDATE_BUILDING_MUTATION = `
  mutation UpdateBuilding($id: Int!, $input: UpdateBuildingInput!) {
    updateBuilding(id: $id, input: $input) {
      id
      name
      code
      buildingType
      displayOrder
      isActive
    }
  }
`;

export const DELETE_BUILDING_MUTATION = `
  mutation DeleteBuilding($id: Int!) {
    deleteBuilding(id: $id) {
      status
      message
    }
  }
`;

export const REORDER_BUILDINGS_MUTATION = `
  mutation ReorderBuildings($input: ReorderBuildingsInput!) {
    reorderBuildings(input: $input) {
      id
      name
      displayOrder
    }
  }
`;

export const CREATE_FLOOR_MUTATION = `
  mutation CreateFloor($input: CreateFloorInput!) {
    createFloor(input: $input) {
      id
      floorNumber
      name
      buildingId
      isActive
      roomCount
    }
  }
`;

export const UPDATE_FLOOR_MUTATION = `
  mutation UpdateFloor($id: Int!, $input: UpdateFloorInput!) {
    updateFloor(id: $id, input: $input) {
      id
      floorNumber
      name
      buildingId
      isActive
    }
  }
`;

export const DELETE_FLOOR_MUTATION = `
  mutation DeleteFloor($id: Int!) {
    deleteFloor(id: $id) {
      status
      message
    }
  }
`;

export const REORDER_FLOORS_MUTATION = `
  mutation ReorderFloors($input: ReorderFloorsInput!) {
    reorderFloors(input: $input) {
      id
      floorNumber
      name
      buildingId
      isActive
    }
  }
`;

export const CREATE_ROOM_CATEGORY_MUTATION = `
  mutation CreateRoomCategory($input: CreateRoomCategoryInput!) {
    createRoomCategory(input: $input) {
      id
      name
      code
      basePrice
      maxAdults
      maxChildren
      amenities
      isActive
      roomCount
    }
  }
`;

export const UPDATE_ROOM_CATEGORY_MUTATION = `
  mutation UpdateRoomCategory($id: Int!, $input: UpdateRoomCategoryInput!) {
    updateRoomCategory(id: $id, input: $input) {
      id
      name
      code
      basePrice
      maxAdults
      maxChildren
      amenities
      isActive
    }
  }
`;

export const DELETE_ROOM_CATEGORY_MUTATION = `
  mutation DeleteRoomCategory($id: Int!) {
    deleteRoomCategory(id: $id) {
      status
      message
    }
  }
`;

export const CREATE_ROOM_MUTATION = `
  mutation CreateRoom($input: CreateRoomInput!) {
    createRoom(input: $input) {
      id
      roomNumber
      status
      floorId
      floorName
      categoryId
      categoryName
      basePrice
      amenities
      customName
      customPrice
      customAmenities
      isActive
    }
  }
`;

export const CREATE_BULK_ROOMS_MUTATION = `
  mutation CreateBulkRooms($input: CreateBulkRoomsInput!) {
    createBulkRooms(input: $input) {
      status
      message
      createdCount
      rooms {
        id
        roomNumber
        status
        floorId
        floorName
        categoryId
        categoryName
        basePrice
        isActive
      }
    }
  }
`;

export const UPDATE_ROOM_MUTATION = `
  mutation UpdateRoom($id: Int!, $input: UpdateRoomInput!) {
    updateRoom(id: $id, input: $input) {
      id
      roomNumber
      status
      floorId
      floorName
      buildingName
      categoryId
      categoryName
      basePrice
      amenities
      customName
      customPrice
      customAmenities
      isActive
    }
  }
`;

export const UPDATE_ROOM_STATUS_MUTATION = `
  mutation UpdateRoomStatus($roomId: Int!, $status: RoomStatusEnum!) {
    updateRoomStatus(roomId: $roomId, status: $status) {
      id
      roomNumber
      status
      floorId
      floorName
      categoryId
      categoryName
      basePrice
      isActive
    }
  }
`;

export const DELETE_ROOM_MUTATION = `
  mutation DeleteRoom($id: Int!) {
    deleteRoom(id: $id) {
      status
      message
    }
  }
`;

export const CREATE_UTILITY_MUTATION = `
  mutation CreateUtility($input: CreateUtilityInput!) {
    createUtility(input: $input) {
      id
      name
      utilityType
      status
      buildingId
      floorId
      capacity
      operatingHours
      isBookable
      rentalPrice
      amenities
      isActive
    }
  }
`;

export const UPDATE_UTILITY_MUTATION = `
  mutation UpdateUtility($id: Int!, $input: UpdateUtilityInput!) {
    updateUtility(id: $id, input: $input) {
      id
      name
      utilityType
      status
      buildingId
      floorId
      capacity
      operatingHours
      isBookable
      rentalPrice
      amenities
      isActive
    }
  }
`;

export const UPDATE_UTILITY_STATUS_MUTATION = `
  mutation UpdateUtilityStatus($id: Int!, $status: UtilityStatusEnum!) {
    updateUtilityStatus(id: $id, status: $status) {
      id
      name
      status
    }
  }
`;

export const DELETE_UTILITY_MUTATION = `
  mutation DeleteUtility($id: Int!) {
    deleteUtility(id: $id) {
      status
      message
    }
  }
`;
