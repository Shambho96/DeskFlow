import { useMemo } from 'react';
import useSWR from 'swr';
import { useUser } from './useUser';
import { graphqlRequest } from '../lib/graphql';
import type {
  BackendFloor,
  BackendRoomCategory,
  BackendRoom,
  BackendBuilding,
  BackendUtility,
  CampusBuilding,
  CampusLayoutPayload,
  HotelLayoutPayload,
  LiveRoomStatus
} from '../types/hotel';

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

interface CampusDataResponse {
  campusLayout: CampusLayoutPayload;
  roomCategories: BackendRoomCategory[];
}

const GET_CAMPUS_DATA_QUERY = `
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

// ─── Mutations ─────────────────────────────────────────────────────────────

const CREATE_BUILDING_MUTATION = `
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

const UPDATE_BUILDING_MUTATION = `
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

const DELETE_BUILDING_MUTATION = `
  mutation DeleteBuilding($id: Int!) {
    deleteBuilding(id: $id) {
      status
      message
    }
  }
`;

const REORDER_BUILDINGS_MUTATION = `
  mutation ReorderBuildings($input: ReorderBuildingsInput!) {
    reorderBuildings(input: $input) {
      id
      name
      displayOrder
    }
  }
`;

const CREATE_FLOOR_MUTATION = `
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

const UPDATE_FLOOR_MUTATION = `
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

const DELETE_FLOOR_MUTATION = `
  mutation DeleteFloor($id: Int!) {
    deleteFloor(id: $id) {
      status
      message
    }
  }
`;

const REORDER_FLOORS_MUTATION = `
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

const CREATE_ROOM_CATEGORY_MUTATION = `
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

const UPDATE_ROOM_CATEGORY_MUTATION = `
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

const DELETE_ROOM_CATEGORY_MUTATION = `
  mutation DeleteRoomCategory($id: Int!) {
    deleteRoomCategory(id: $id) {
      status
      message
    }
  }
`;

const CREATE_ROOM_MUTATION = `
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

const CREATE_BULK_ROOMS_MUTATION = `
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

const UPDATE_ROOM_MUTATION = `
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

const UPDATE_ROOM_STATUS_MUTATION = `
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

const DELETE_ROOM_MUTATION = `
  mutation DeleteRoom($id: Int!) {
    deleteRoom(id: $id) {
      status
      message
    }
  }
`;

const CREATE_UTILITY_MUTATION = `
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

const UPDATE_UTILITY_MUTATION = `
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

const UPDATE_UTILITY_STATUS_MUTATION = `
  mutation UpdateUtilityStatus($id: Int!, $status: UtilityStatusEnum!) {
    updateUtilityStatus(id: $id, status: $status) {
      id
      name
      status
    }
  }
`;

const DELETE_UTILITY_MUTATION = `
  mutation DeleteUtility($id: Int!) {
    deleteUtility(id: $id) {
      status
      message
    }
  }
`;

export function useRooms() {
  const { user } = useUser();
  const outletId = user?.active_outlet_id;

  // SWR automatically revalidates whenever the active outlet changes!
  const swrKey = outletId ? ['hotel-campus-data', outletId] : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR<CampusDataResponse>(
    swrKey,
    async () => {
      return await graphqlRequest<CampusDataResponse>(GET_CAMPUS_DATA_QUERY);
    },
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000,
      keepPreviousData: true,
    }
  );

  const campusLayout = data?.campusLayout || null;

  // Campus buildings list
  const campusBuildings: CampusBuilding[] = useMemo(
    () => data?.campusLayout?.buildings || [],
    [data?.campusLayout?.buildings]
  );

  const buildings: BackendBuilding[] = useMemo(
    () => campusBuildings.map(cb => cb.building),
    [campusBuildings]
  );

  // Flatten all floors across all buildings
  const floors: BackendFloor[] = useMemo(
    () => campusBuildings.flatMap(cb => cb.floors || []),
    [campusBuildings]
  );

  // Flatten all rooms across all buildings and floors
  const allRooms: BackendRoom[] = useMemo(
    () => floors.flatMap(f => f.rooms || []),
    [floors]
  );

  // Flatten all utilities (both building-level and floor-level)
  const allUtilities: BackendUtility[] = useMemo(
    () => campusBuildings.flatMap(cb => [
      ...(cb.utilities || []),
      ...cb.floors.flatMap(f => f.utilities || [])
    ]),
    [campusBuildings]
  );

  const categories: BackendRoomCategory[] = useMemo(
    () => data?.roomCategories || [],
    [data?.roomCategories]
  );

  // Backward-compatible layout representation for HotelContext
  const layout: HotelLayoutPayload | null = useMemo(() => {
    if (!campusLayout) return null;
    return {
      status: campusLayout.status,
      totalFloors: campusLayout.totalFloors,
      totalRooms: campusLayout.totalRooms,
      availableRooms: campusLayout.availableRooms,
      occupiedRooms: campusLayout.occupiedRooms,
      cleaningRooms: campusLayout.cleaningRooms,
      maintenanceRooms: campusLayout.maintenanceRooms,
      floors,
    };
  }, [campusLayout, floors]);

  // ─── Actions ─────────────────────────────────────────────────────────────

  async function createBuilding(input: CreateBuildingInput) {
    const res = await graphqlRequest<{ createBuilding: BackendBuilding }>(CREATE_BUILDING_MUTATION, { input });
    await mutate();
    return res.createBuilding;
  }

  async function updateBuilding(id: number, input: UpdateBuildingInput) {
    const res = await graphqlRequest<{ updateBuilding: BackendBuilding }>(UPDATE_BUILDING_MUTATION, { id, input });
    await mutate();
    return res.updateBuilding;
  }

  async function deleteBuilding(id: number) {
    const res = await graphqlRequest<{ deleteBuilding: { status: string; message: string } }>(DELETE_BUILDING_MUTATION, { id });
    await mutate();
    return res.deleteBuilding;
  }

  async function reorderBuildings(input: ReorderBuildingsInput) {
    const res = await graphqlRequest<{ reorderBuildings: BackendBuilding[] }>(REORDER_BUILDINGS_MUTATION, { input });
    await mutate();
    return res.reorderBuildings;
  }

  async function createFloor(input: CreateFloorInput) {
    const res = await graphqlRequest<{ createFloor: BackendFloor }>(CREATE_FLOOR_MUTATION, { input });
    await mutate();
    return res.createFloor;
  }

  async function updateFloor(id: number, input: UpdateFloorInput) {
    const res = await graphqlRequest<{ updateFloor: BackendFloor }>(UPDATE_FLOOR_MUTATION, { id, input });
    await mutate();
    return res.updateFloor;
  }

  async function deleteFloor(id: number) {
    const res = await graphqlRequest<{ deleteFloor: { status: string; message: string } }>(DELETE_FLOOR_MUTATION, { id });
    await mutate();
    return res.deleteFloor;
  }

  async function reorderFloors(input: ReorderFloorsInput) {
    const res = await graphqlRequest<{ reorderFloors: BackendFloor[] }>(REORDER_FLOORS_MUTATION, { input });
    await mutate();
    return res.reorderFloors;
  }

  async function createRoomCategory(input: CreateRoomCategoryInput) {
    const res = await graphqlRequest<{ createRoomCategory: BackendRoomCategory }>(CREATE_ROOM_CATEGORY_MUTATION, { input });
    await mutate();
    return res.createRoomCategory;
  }

  async function updateRoomCategory(id: number, input: UpdateRoomCategoryInput) {
    const res = await graphqlRequest<{ updateRoomCategory: BackendRoomCategory }>(UPDATE_ROOM_CATEGORY_MUTATION, { id, input });
    await mutate();
    return res.updateRoomCategory;
  }

  async function deleteRoomCategory(id: number) {
    const res = await graphqlRequest<{ deleteRoomCategory: { status: string; message: string } }>(DELETE_ROOM_CATEGORY_MUTATION, { id });
    await mutate();
    return res.deleteRoomCategory;
  }

  async function createRoom(input: CreateRoomInput) {
    const res = await graphqlRequest<{ createRoom: BackendRoom }>(CREATE_ROOM_MUTATION, { input });
    await mutate();
    return res.createRoom;
  }

  async function createBulkRooms(input: CreateBulkRoomsInput) {
    const res = await graphqlRequest<{ createBulkRooms: { status: string; message: string; createdCount: number; rooms: BackendRoom[] } }>(
      CREATE_BULK_ROOMS_MUTATION,
      { input }
    );
    await mutate();
    return res.createBulkRooms;
  }

  async function updateRoom(id: number, input: UpdateRoomInput) {
    const res = await graphqlRequest<{ updateRoom: BackendRoom }>(UPDATE_ROOM_MUTATION, { id, input });
    await mutate();
    return res.updateRoom;
  }

  async function updateRoomStatus(roomId: number, status: LiveRoomStatus) {
    const res = await graphqlRequest<{ updateRoomStatus: BackendRoom }>(UPDATE_ROOM_STATUS_MUTATION, { roomId, status });
    await mutate();
    return res.updateRoomStatus;
  }

  async function deleteRoom(id: number) {
    const res = await graphqlRequest<{ deleteRoom: { status: string; message: string } }>(DELETE_ROOM_MUTATION, { id });
    await mutate();
    return res.deleteRoom;
  }

  async function createUtility(input: CreateUtilityInput) {
    const res = await graphqlRequest<{ createUtility: BackendUtility }>(CREATE_UTILITY_MUTATION, { input });
    await mutate();
    return res.createUtility;
  }

  async function updateUtility(id: number, input: UpdateUtilityInput) {
    const res = await graphqlRequest<{ updateUtility: BackendUtility }>(UPDATE_UTILITY_MUTATION, { id, input });
    await mutate();
    return res.updateUtility;
  }

  async function updateUtilityStatus(id: number, status: 'OPEN' | 'CLOSED' | 'CLEANING' | 'MAINTENANCE') {
    const res = await graphqlRequest<{ updateUtilityStatus: BackendUtility }>(UPDATE_UTILITY_STATUS_MUTATION, { id, status });
    await mutate();
    return res.updateUtilityStatus;
  }

  async function deleteUtility(id: number) {
    const res = await graphqlRequest<{ deleteUtility: { status: string; message: string } }>(DELETE_UTILITY_MUTATION, { id });
    await mutate();
    return res.deleteUtility;
  }

  return {
    campusLayout,
    campusBuildings,
    buildings,
    floors,
    categories,
    allRooms,
    allUtilities,
    layout,
    isLoading,
    isValidating,
    error,
    createBuilding,
    updateBuilding,
    deleteBuilding,
    reorderBuildings,
    createFloor,
    updateFloor,
    deleteFloor,
    reorderFloors,
    createRoomCategory,
    updateRoomCategory,
    deleteRoomCategory,
    createRoom,
    createBulkRooms,
    updateRoom,
    updateRoomStatus,
    deleteRoom,
    createUtility,
    updateUtility,
    updateUtilityStatus,
    deleteUtility,
    refresh: mutate,
  };
}
