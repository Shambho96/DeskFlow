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

import {
  type CreateBuildingInput,
  type UpdateBuildingInput,
  type ReorderBuildingsInput,
  type CreateFloorInput,
  type UpdateFloorInput,
  type ReorderFloorsInput,
  type CreateRoomCategoryInput,
  type UpdateRoomCategoryInput,
  type CreateRoomInput,
  type CreateBulkRoomsInput,
  type UpdateRoomInput,
  type CreateUtilityInput,
  type UpdateUtilityInput,
  GET_CAMPUS_DATA_QUERY,
  CREATE_BUILDING_MUTATION,
  UPDATE_BUILDING_MUTATION,
  DELETE_BUILDING_MUTATION,
  REORDER_BUILDINGS_MUTATION,
  CREATE_FLOOR_MUTATION,
  UPDATE_FLOOR_MUTATION,
  DELETE_FLOOR_MUTATION,
  REORDER_FLOORS_MUTATION,
  CREATE_ROOM_CATEGORY_MUTATION,
  UPDATE_ROOM_CATEGORY_MUTATION,
  DELETE_ROOM_CATEGORY_MUTATION,
  CREATE_ROOM_MUTATION,
  CREATE_BULK_ROOMS_MUTATION,
  UPDATE_ROOM_MUTATION,
  UPDATE_ROOM_STATUS_MUTATION,
  DELETE_ROOM_MUTATION,
  CREATE_UTILITY_MUTATION,
  UPDATE_UTILITY_MUTATION,
  UPDATE_UTILITY_STATUS_MUTATION,
  DELETE_UTILITY_MUTATION,
} from '../graphql/roomsQueries';

export type {
  CreateBuildingInput,
  UpdateBuildingInput,
  ReorderBuildingsInput,
  CreateFloorInput,
  UpdateFloorInput,
  ReorderFloorsInput,
  CreateRoomCategoryInput,
  UpdateRoomCategoryInput,
  CreateRoomInput,
  CreateBulkRoomsInput,
  UpdateRoomInput,
  CreateUtilityInput,
  UpdateUtilityInput,
};
export { GET_CAMPUS_DATA_QUERY };

interface CampusDataResponse {
  campusLayout: CampusLayoutPayload;
  roomCategories: BackendRoomCategory[];
}

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
      keepPreviousData: false,
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
