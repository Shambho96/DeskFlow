import {
  AlertCircle,
  Building,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Crown,
  Pencil,
  Phone,
  RefreshCw,
  Search,
  Shield,
  User,
  UserPlus,
  Users,
} from 'lucide-react';
import React, { useState } from 'react';
import { useOutlets } from '../../hooks/useOutlets';
import { useTeam } from '../../hooks/useTeam';
import { useUser } from '../../hooks/useUser';
import type { TeamMember } from '../../types/team';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { PhoneNumberDisplay } from '../ui/PhoneNumberDisplay';
import { AddTeamMemberModal } from './AddTeamMemberModal';
import { EditTeamMemberModal } from './EditTeamMemberModal';

export const TeamManagementTab: React.FC = () => {
  const { user } = useUser();
  const { outlets } = useOutlets(!!user);

  const activeOutlet = outlets.find(
    o => o.id === (user?.active_outlet_id ? Number(user.active_outlet_id) : null)
  );

  const {
    members,
    isLoading,
    error,
    // Pagination
    page,
    setPage,
    pageSize,
    setPageSize,
    total,
    totalPages,
    hasNext,
    hasPrev,
    // Filters
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    allOutlets,
    setAllOutlets,
    refetch,
    addMember,
    updateMember,
    toggleStatus,
    actionError,
  } = useTeam();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const isOwner = user?.role === 'OWNER';
  const isManager = user?.role === 'MANAGER';
  const isStaff = user?.role === 'STAFF';

  // Helper for 2-letter avatar initials
  const getInitials = (name: string): string => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Helper to resolve outlet name
  const getOutletName = (outletIds: number[]): string => {
    if (!outletIds || outletIds.length === 0) return activeOutlet?.name || 'Assigned Property';
    const found = outlets.find(o => outletIds.includes(o.id));
    return found ? found.name : activeOutlet?.name || 'Active Property';
  };

  const handleToggle = async (member: TeamMember) => {
    try {
      setTogglingId(member.id);
      await toggleStatus(member.id, member.isActive);
    } catch (err) {
      // Error is tracked in useTeam actionError
    } finally {
      setTogglingId(null);
    }
  };

  // If logged-in user is STAFF, show restricted access notice
  if (isStaff) {
    return (
      <Card className="max-w-2xl mx-auto my-8 border-[var(--border)]">
        <CardContent className="p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-[var(--foreground)]">Access Restricted</h2>
          <p className="text-xs text-[var(--muted-foreground)] max-w-md mx-auto">
            Team member administration is restricted to Property Managers and Hotel Owners.
            Please reach out to your manager if you require access changes.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 text-left">
      {/* ── Top Bar: Header & Add Action ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--card)] p-4 sm:p-5 rounded-2xl border border-[var(--border)] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[var(--foreground)] tracking-tight">
              Team & Staff Management
            </h2>
            <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-semibold">
              {total} {total === 1 ? 'Member' : 'Members'}
            </Badge>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Manage roles, login credentials, and operational team members for{' '}
            <strong className="text-[var(--foreground)] font-semibold">
              {activeOutlet?.name || 'Active Property'}
            </strong>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="h-9 text-xs"
            title="Refresh team directory"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="h-9 px-4 text-xs font-semibold bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm hover:opacity-95 cursor-pointer flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Team Member</span>
          </Button>
        </div>
      </div>

      {actionError && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* ── Filters & Search Toolbar ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-[var(--card)] border border-[var(--border)]">
        <div className="flex flex-1 items-center gap-2 max-w-sm">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-[var(--muted-foreground)] absolute left-3 top-2.5 pointer-events-none" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="h-8 pl-8 text-xs bg-[var(--muted)]/40 border-[var(--border)]"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter - Owners can filter all roles, Managers are scoped to Staff */}
          {isOwner ? (
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="h-8 px-2.5 rounded-lg border border-[var(--border)] bg-[var(--muted)]/40 text-xs text-[var(--foreground)] font-medium outline-none cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              <option value="MANAGER">Managers</option>
              <option value="STAFF">Staff</option>
            </select>
          ) : (
            <div className="h-8 px-2.5 rounded-lg border border-[var(--border)] bg-[var(--muted)]/40 text-xs text-[var(--muted-foreground)] font-medium flex items-center">
              Staff Only
            </div>
          )}

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-[var(--border)] bg-[var(--muted)]/40 text-xs text-[var(--foreground)] font-medium outline-none cursor-pointer"
          >
            <option value="ALL">All Status (Active & Deactivated)</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Deactivated Only</option>
          </select>

          {/* Owner: cross-outlet toggle */}
          {isOwner && (
            <label className="flex items-center gap-1.5 text-xs font-medium text-[var(--muted-foreground)] cursor-pointer select-none ml-1">
              <input
                type="checkbox"
                checked={allOutlets}
                onChange={e => setAllOutlets(e.target.checked)}
                className="rounded border-[var(--border)] text-[var(--primary)]"
              />
              <span>All Properties</span>
            </label>
          )}
        </div>
      </div>

      {/* ── Team Directory Table ────────────────────────────────────────────── */}
      <Card className="border-[var(--border)] overflow-hidden shadow-xs">
        <CardContent className="p-0">
          {isLoading && members.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-[var(--muted-foreground)]">Loading team directory…</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center space-y-2">
              <AlertCircle className="w-6 h-6 text-red-500 mx-auto" />
              <p className="text-xs font-semibold text-red-500">{error}</p>
              <Button size="sm" variant="outline" onClick={() => refetch()} className="text-xs">
                Try Again
              </Button>
            </div>
          ) : members.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] mx-auto">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--foreground)]">No team members found</p>
                <p className="text-[11px] text-[var(--muted-foreground)]">
                  {search || roleFilter !== 'ALL' || statusFilter !== 'ALL'
                    ? 'Try adjusting your search query or filters.'
                    : 'Click "Add Team Member" above to invite your first staff member.'}
                </p>
              </div>
              {(search || roleFilter !== 'ALL' || statusFilter !== 'ALL') && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSearch('');
                    setRoleFilter('ALL');
                    setStatusFilter('ALL');
                  }}
                  className="text-xs h-8"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--muted)]/40 font-semibold text-[var(--muted-foreground)]">
                    <th className="py-3 px-4">Member</th>
                    <th className="py-3 px-4">Role & Access</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Property</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {members.map(member => {
                    const isTargetOwner = member.role === 'OWNER';
                    const canModify =
                      isOwner || (isManager && member.role === 'STAFF');
                    const isToggling = togglingId === member.id;

                    return (
                      <tr key={member.id} className="hover:bg-[var(--muted)]/20 transition-colors">
                        {/* Member Name + Avatar */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--primary)] text-[var(--primary-foreground)] text-[10px] font-bold shrink-0 shadow-xs">
                              {getInitials(member.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-[var(--foreground)] truncate">
                                {member.name}
                              </p>
                              <p className="text-[11px] text-[var(--muted-foreground)] truncate">
                                {member.email || 'Operational account'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Role & Access Badge */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {member.role === 'OWNER' ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-semibold text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              <Crown className="w-3 h-3" /> Owner
                            </span>
                          ) : member.role === 'MANAGER' ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-semibold text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                              <Shield className="w-3 h-3" /> Manager • Web Login
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-medium text-[10px] bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)]">
                              <User className="w-3 h-3" /> Staff • Operations
                            </span>
                          )}
                        </td>

                        {/* Contact */}
                        <td className="py-3.5 px-4 text-[var(--muted-foreground)] whitespace-nowrap">
                          {member.phone ? (
                            <span className="flex items-center gap-1.5 text-[var(--foreground)] font-mono text-[11px]">
                              <Phone className="w-3 h-3 text-[var(--muted-foreground)]" />
                              <PhoneNumberDisplay value={member.phone} className="font-mono text-[11px]" />
                            </span>
                          ) : (
                            <span className="text-[var(--muted-foreground)]">—</span>
                          )}
                        </td>

                        {/* Property */}
                        <td className="py-3.5 px-4 text-[var(--muted-foreground)] whitespace-nowrap">
                          <span className="flex items-center gap-1.5 text-[11px]">
                            <Building className="w-3 h-3 text-[var(--primary)] shrink-0" />
                            {getOutletName(member.assignedOutletIds)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {member.isActive ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium text-[10px] bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                              Deactivated
                            </span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {isTargetOwner ? (
                            <span className="text-[11px] text-[var(--muted-foreground)] italic">
                              Owner account
                            </span>
                          ) : canModify ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedMember(member);
                                  setIsEditModalOpen(true);
                                }}
                                className="h-7 px-2.5 text-[11px] cursor-pointer hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors flex items-center gap-1"
                                title="Edit team member details"
                              >
                                <Pencil className="w-3 h-3" />
                                <span>Edit</span>
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggle(member)}
                                disabled={isToggling}
                                className={`h-7 px-2.5 text-[11px] cursor-pointer transition-colors ${member.isActive
                                    ? 'hover:text-red-600 hover:border-red-300 hover:bg-red-50/50 dark:hover:bg-red-950/20'
                                    : 'hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20'
                                  }`}
                              >
                                {isToggling ? (
                                  <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : member.isActive ? (
                                  'Deactivate'
                                ) : (
                                  'Activate'
                                )}
                              </Button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-[var(--muted-foreground)]">
                              Protected
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Pagination Footer ── */}
          {total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-[var(--border)] bg-[var(--muted)]/20 text-xs select-none">
              {/* Left: Rows per page selector + Showing items count */}
              <div className="flex flex-wrap items-center gap-3 text-[var(--muted-foreground)]">
                <div className="flex items-center gap-1.5">
                  <span>Rows per page:</span>
                  <select
                    value={pageSize}
                    onChange={e => setPageSize(Number(e.target.value))}
                    className="h-7 px-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] font-medium outline-none cursor-pointer"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <span>•</span>
                <span>
                  Showing{' '}
                  <strong className="text-[var(--foreground)] font-semibold">
                    {(page - 1) * pageSize + 1}
                  </strong>{' '}
                  to{' '}
                  <strong className="text-[var(--foreground)] font-semibold">
                    {Math.min(page * pageSize, total)}
                  </strong>{' '}
                  of{' '}
                  <strong className="text-[var(--foreground)] font-semibold">{total}</strong>{' '}
                  members
                </span>
              </div>

              {/* Right: Page Navigation Buttons */}
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(1)}
                  disabled={page <= 1 || isLoading}
                  className="h-7 w-7 p-0 cursor-pointer"
                  title="First Page"
                >
                  <ChevronsLeft className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={!hasPrev || isLoading}
                  className="h-7 w-7 p-0 cursor-pointer"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>

                {/* Numbered Page Buttons */}
                <div className="flex items-center gap-1 mx-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => Math.abs(p - page) <= 2 || p === 1 || p === totalPages)
                    .reduce<(number | string)[]>((acc, p, idx, arr) => {
                      if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) {
                        acc.push('...');
                      }
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      typeof item === 'string' ? (
                        <span key={`ellipsis-${idx}`} className="px-1 text-[var(--muted-foreground)]">
                          …
                        </span>
                      ) : (
                        <Button
                          key={item}
                          size="sm"
                          variant={item === page ? 'default' : 'outline'}
                          onClick={() => setPage(item)}
                          disabled={isLoading}
                          className={`h-7 min-w-7 px-2 text-xs font-semibold cursor-pointer ${item === page
                              ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                              : 'text-[var(--foreground)] hover:bg-[var(--muted)]'
                            }`}
                        >
                          {item}
                        </Button>
                      )
                    )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={!hasNext || isLoading}
                  className="h-7 w-7 p-0 cursor-pointer"
                  title="Next Page"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(totalPages)}
                  disabled={page >= totalPages || isLoading}
                  className="h-7 w-7 p-0 cursor-pointer"
                  title="Last Page"
                >
                  <ChevronsRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Add Member Modal ────────────────────────────────────────────────── */}
      <AddTeamMemberModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onAddMember={addMember}
        currentUserRole={user?.role}
        activeOutletName={activeOutlet?.name}
      />

      {/* ── Edit Member Modal ───────────────────────────────────────────────── */}
      <EditTeamMemberModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        member={selectedMember}
        onUpdateMember={updateMember}
        currentUserRole={user?.role}
        activeOutletName={
          selectedMember?.assignedOutletIds && selectedMember.assignedOutletIds.length > 0
            ? getOutletName(selectedMember.assignedOutletIds)
            : activeOutlet?.name
        }
      />
    </div>
  );
};
