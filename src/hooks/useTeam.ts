import { useState, useEffect, useCallback } from 'react';
import { graphqlRequest } from '../lib/graphql';
import { useUser } from './useUser';
import type { TeamMember, CreateMemberInput, TeamMembersPayload } from '../types/team';

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
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [hasPrev, setHasPrev] = useState<boolean>(false);

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

  const fetchMembers = useCallback(async () => {
    if (!user || user.role === 'STAFF') {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const variables: Record<string, any> = {
        allOutlets: user.role === 'OWNER' ? allOutlets : false,
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
      }

      const res = await graphqlRequest<{ teamMembers: TeamMembersPayload }>(
        GET_TEAM_MEMBERS_QUERY,
        variables
      );

      const payload = res.teamMembers;
      setMembers(payload.users || []);
      setTotal(payload.total);
      setTotalPages(payload.totalPages);
      setHasNext(payload.hasNext);
      setHasPrev(payload.hasPrev);
    } catch (err: any) {
      console.error('Error fetching team members:', err);
      setError(err.message || 'Failed to fetch team members');
    } finally {
      setIsLoading(false);
    }
  }, [user, search, roleFilter, statusFilter, allOutlets, page, pageSize]);

  // Refetch on filter, page, or outlet switch
  useEffect(() => {
    fetchMembers();
  }, [fetchMembers, user?.active_outlet_id]);

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

      const newMember = res.createTeamMember;
      // Refetch directory to get current page updated accurately
      fetchMembers();
      return newMember;
    } catch (err: any) {
      const msg = err.message || 'Failed to create team member';
      setActionError(msg);
      throw new Error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle member status
  const toggleStatus = async (userId: number, currentStatus: boolean): Promise<void> => {
    const nextStatus = !currentStatus;
    setActionError(null);

    // Optimistic update
    setMembers(prev =>
      prev.map(m => (m.id === userId ? { ...m, isActive: nextStatus } : m))
    );

    try {
      await graphqlRequest<{ toggleTeamMemberStatus: { status: string; message: string } }>(
        TOGGLE_TEAM_MEMBER_STATUS_MUTATION,
        {
          userId,
          isActive: nextStatus,
        }
      );
    } catch (err: any) {
      // Revert on failure
      setMembers(prev =>
        prev.map(m => (m.id === userId ? { ...m, isActive: currentStatus } : m))
      );
      const msg = err.message || 'Failed to change member status';
      setActionError(msg);
      throw new Error(msg);
    }
  };

  return {
    members,
    isLoading,
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
    refetch: fetchMembers,
    addMember,
    toggleStatus,
    isSubmitting,
    actionError,
    currentUserRole: user?.role,
  };
}
