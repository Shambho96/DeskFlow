export type TeamRole = 'OWNER' | 'MANAGER' | 'STAFF';

export interface TeamMember {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  role: TeamRole;
  clientId: number;
  canLogin: boolean;
  isActive: boolean;
  assignedOutletIds: number[];
  createdAt: string;
}

export interface CreateMemberInput {
  name: string;
  email?: string;
  phone?: string;
  role: TeamRole;
  password?: string;
  assignedOutletIds?: number[];
}

export interface TeamMembersPayload {
  status: string;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  users: TeamMember[];
}
