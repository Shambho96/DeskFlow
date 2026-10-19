import { useState } from 'react';
import useSWR from 'swr';
import { graphqlRequest } from '../lib/graphql';
import { useUser } from './useUser';
import type { TeamMember, CreateMemberInput, UpdateMemberInput, TeamMembersPayload } from '../types/team';

const GET_TEAM_MEMBERS_QUERY = `
  query GetTeamMembers(
    $role: String
    $search: String
    $isActive: Boolean
    $allOutlets: Boolean
    $page: Int
    $pageSize: Int
  ) {
    teamMembers(
      role: $role
      search: $search
      isActive: $isActive
      allOutlets: $allOutlets
      page: $page
      pageSize: $pageSize
    ) {
      status
      total
      page
      pageSize
      totalPages
      hasNext
      hasPrev
      users {
        id
        name
        email
        phone
        role
        clientId
        canLogin
        isActive
        assignedOutletIds
        createdAt
      }
    }
  }
`;

const CREATE_TEAM_MEMBER_MUTATION = `
  mutation CreateTeamMember($input: CreateUserInput!) {
    createTeamMember(input: $input) {
      id
      name
      email
      phone
      role
      clientId
      canLogin
      isActive
      assignedOutletIds
      createdAt
    }
  }
`;

const UPDATE_TEAM_MEMBER_MUTATION = `
  mutation UpdateTeamMember($input: UpdateUserInput!) {
    updateTeamMember(input: $input) {
      id
      name
      email
      phone
      role
      clientId
      canLogin
      isActive
      assignedOutletIds
      createdAt
    }
  }
`;

const TOGGLE_TEAM_MEMBER_STATUS_MUTATION = `
  mutation ToggleTeamMemberStatus($userId: Int!, $isActive: Boolean!) {
    toggleTeamMemberStatus(userId: $userId, isActive: $isActive) {
      status
      message
    }
  }
`;

export function useTeam() {
  const { user } = useUser();

  // Pagination states
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL'); // 'ALL' | 'ACTIVE' | 'INACTIVE'
  const [allOutlets, setAllOutlets] = useState<boolean>(false);

  // Action states
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Reset to page 1 when filter parameters change
  const handleSetSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleSetRoleFilter = (val: string) => {
    setRoleFilter(val);
    setPage(1);
  };

  const handleSetStatusFilter = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };

  const handleSetAllOutlets = (val: boolean) => {
    setAllOutlets(val);
    setPage(1);
  };

  const handleSetPageSize = (val: number) => {
    setPageSize(val);
    setPage(1);
  };

  const userId = user?.id;
  const userRole = user?.role;
  const activeOutletId = user?.active_outlet_id;

  // Cache key uniquely identifying the query parameters
  const swrKey = (!userId || userRole === 'STAFF') ? null : JSON.stringify({
    scope: 'teamMembers',
    outlet: userRole === 'OWNER' && allOutlets ? 'all' : activeOutletId,
    page,
    pageSize,
    search: search.trim(),
    role: roleFilter,
    status: statusFilter,
  });

  const {
    data,
    error: swrError,
    isLoading: isSwrLoading,
    isValidating,
    mutate,
  } = useSWR<TeamMembersPayload>(
    swrKey,
    async () => {
      const variables: Record<string, any> = {
        allOutlets: userRole === 'OWNER' ? allOutlets : false,
        page,
        pageSize,
      };

      if (roleFilter !== 'ALL') {
        variables.role = roleFilter;
      }

      if (search.trim()) {
        variables.search = search.trim();
      }

      if (statusFilter === 'ACTIVE') {
        variables.isActive = true;
      } else if (statusFilter === 'INACTIVE') {
        variables.isActive = false;
      } else {
        variables.isActive = null;
      }

      const res = await graphqlRequest<{ teamMembers: TeamMembersPayload }>(
        GET_TEAM_MEMBERS_QUERY,
        variables
      );

      return res.teamMembers;
    },
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300_000, // 5 min cache: only fetches once per filter set
      keepPreviousData: true,    // Retain previous page/data during filter changes
      shouldRetryOnError: false,
    }
  );

  // Derived state from cached payload
  const members: TeamMember[] = data?.users || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;
  const hasNext = data?.hasNext || false;
  const hasPrev = data?.hasPrev || false;

  // Only show loading spinner on initial fetch with no data
  const isLoading = isSwrLoading && !data;
  const error = swrError ? (swrError.message || 'Failed to fetch team members') : null;

  // Create member
  const addMember = async (input: CreateMemberInput): Promise<TeamMember> => {
    setIsSubmitting(true);
    setActionError(null);
    try {
      const res = await graphqlRequest<{ createTeamMember: TeamMember }>(
        CREATE_TEAM_MEMBER_MUTATION,
        {
          input: {
            name: input.name,
            email: input.email || null,
            phone: input.phone || null,
            role: input.role,
            password: input.password || null,
            assignedOutletIds: input.assignedOutletIds || null,
          },
        }
      );

      // Revalidate cache to sync directory
      await mutate();
      return res.createTeamMember;
    } catch (err: any) {
      const msg = err.message || 'Failed to create team member';
      setActionError(msg);
      throw new Error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update member
  const updateMember = async (input: UpdateMemberInput): Promise<TeamMember> => {
    setIsSubmitting(true);
    setActionError(null);
    try {
      const res = await graphqlRequest<{ updateTeamMember: TeamMember }>(
        UPDATE_TEAM_MEMBER_MUTATION,
        {
          input: {
            userId: input.userId,
            name: input.name,
            email: input.email || null,
            phone: input.phone || null,
            role: input.role || null,
            password: input.password || null,
            assignedOutletIds: input.assignedOutletIds || null,
          },
        }
      );

      await mutate();
      return res.updateTeamMember;
    } catch (err: any) {
      const msg = err.message || 'Failed to update team member';
      setActionError(msg);
      throw new Error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle member status
  const toggleStatus = async (userIdToToggle: number, currentStatus: boolean): Promise<void> => {
    const nextStatus = !currentStatus;
    setActionError(null);

    // Optimistic UI update
    if (data) {
      const updatedUsers = data.users.map(u =>
        u.id === userIdToToggle ? { ...u, isActive: nextStatus } : u
      );
      mutate({ ...data, users: updatedUsers }, false);
    }

    try {
      await graphqlRequest<{ toggleTeamMemberStatus: { status: string; message: string } }>(
        TOGGLE_TEAM_MEMBER_STATUS_MUTATION,
        {
          userId: userIdToToggle,
          isActive: nextStatus,
        }
      );
      // Background revalidate to ensure accurate server totals
      await mutate();
    } catch (err: any) {
      // Revert optimistic update on failure
      await mutate();
      const msg = err.message || 'Failed to change member status';
      setActionError(msg);
      throw new Error(msg);
    }
  };

  return {
    members,
    isLoading,
    isValidating,
    error,
    // Pagination
    page,
    setPage,
    pageSize,
    setPageSize: handleSetPageSize,
    total,
    totalPages,
    hasNext,
    hasPrev,
    // Filters
    search,
    setSearch: handleSetSearch,
    roleFilter,
    setRoleFilter: handleSetRoleFilter,
    statusFilter,
    setStatusFilter: handleSetStatusFilter,
    allOutlets,
    setAllOutlets: handleSetAllOutlets,
    // Actions
    refetch: () => mutate(),
    addMember,
    updateMember,
    toggleStatus,
    isSubmitting,
    actionError,
    currentUserRole: user?.role,
  };
}
