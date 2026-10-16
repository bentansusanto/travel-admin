"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { TablePagination } from "@/components/ui/table-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useFindAllRolesQuery } from "@/store/services/role.service";
import { useDeleteUserMutation, useFindAllUsersQuery } from "@/store/services/user.service";
import {
  IconCheck,
  IconClock,
  IconDotsVertical,
  IconEdit,
  IconPlus,
  IconSearch,
  IconTrash,
  IconUserCheck,
  IconUserExclamation,
  IconUsers
} from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { AddUserModal } from "../AddUserModal";
import { EditUserModal } from "../EditUserModal";

export const UsersTab = () => {
  const { data: usersData, isLoading, isError, error } = useFindAllUsersQuery(undefined);
  const { data: rolesData } = useFindAllRolesQuery(undefined);
  const [deleteUser] = useDeleteUserMutation();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const users: any[] = useMemo(() => {
    return usersData?.data || [];
  }, [usersData]);

  const roles: any[] = useMemo(() => {
    return rolesData?.data || [];
  }, [rolesData]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase());

      const matchesRole =
        roleFilter === "all" ||
        user.role?.code === roleFilter ||
        user.role?.id === roleFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "verified" && user.is_verified === true) ||
        (statusFilter === "unverified" && (user.is_verified === false || user.is_verified == null));

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  // Reset pagination when search or filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, statusFilter, pageSize]);

  // Pagination calculations
  const totalItems = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete user "${name}"?`)) return;
    try {
      await deleteUser(id).unwrap();
      toast.success("User deleted successfully");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete user");
    }
  };

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  // Stats calculation
  const totalUsers = users.length;
  const verifiedUsers = users.filter((u) => u.is_verified === true).length;
  const pendingUsers = users.filter((u) => !u.is_verified).length;

  if (isLoading) {
    return (
      <div className="flex h-72 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-72 items-center justify-center">
        <p className="text-red-500 text-sm">Error loading users: {error?.toString()}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <IconUsers className="size-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Staff Accounts</p>
            <p className="text-xl font-bold text-slate-900">{totalUsers}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <IconUserCheck className="size-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Verified Active</p>
            <p className="text-xl font-bold text-slate-900">{verifiedUsers}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="flex size-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <IconUserExclamation className="size-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Pending Verification</p>
            <p className="text-xl font-bold text-slate-900">{pendingUsers}</p>
          </div>
        </div>
      </div>

      {/* Filter & Action Toolbar */}
      <Card className="border-slate-200/80 shadow-xs bg-white py-0 gap-0 overflow-hidden">
        <CardContent className="p-3.5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                placeholder="Search staff by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs bg-slate-50/50 border-slate-200"
              />
            </div>

            {/* Filters & Add User Button */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Role Filter */}
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-9 text-xs w-[140px] bg-slate-50/50 border-slate-200">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={r.code || r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 text-xs w-[140px] bg-slate-50/50 border-slate-200">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Pending</SelectItem>
                </SelectContent>
              </Select>

              {/* Add User Button */}
              <Button
                size="sm"
                onClick={() => setIsAddModalOpen(true)}
                className="h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold gap-1.5 shadow-sm hover:shadow-md transition-all">
                <IconPlus className="size-4" />
                Add Staff User
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Data Table */}
      <Card className="border-slate-200/80 shadow-xs bg-white py-0 gap-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80 border-b border-slate-200/60">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-slate-600 px-4 py-2.5">Staff Member</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 px-4 py-2.5">Role / Designation</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 px-4 py-2.5 text-center">Status</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 px-4 py-2.5 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-28 text-center text-xs text-slate-400">
                    No staff users found matching your search criteria.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => {
                  const roleCode = user.role?.code || "user";
                  const isOwner = roleCode === "owner";
                  const isAdmin = roleCode === "admin" || roleCode === "developer";

                  return (
                    <TableRow key={user.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100">
                      {/* User Avatar + Name + Email */}
                      <TableCell className="px-4 py-2.5">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8.5 rounded-lg border border-slate-200">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback className="bg-blue-50 text-blue-700 font-bold text-xs rounded-lg">
                              {user.name ? user.name.substring(0, 2).toUpperCase() : "US"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-bold text-xs text-slate-900">{user.name}</span>
                            <span className="text-[11px] text-slate-400">{user.email}</span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Role Badge */}
                      <TableCell className="px-4 py-2.5">
                        <Badge
                          variant="outline"
                          className={`text-xs font-semibold gap-1 ${
                            isOwner
                              ? "border-blue-300 bg-blue-50 text-blue-700 font-bold"
                              : isAdmin
                              ? "border-purple-200 bg-purple-50 text-purple-700"
                              : "border-slate-200 bg-slate-50 text-slate-700"
                          }`}>
                          {user.role?.name || "No Role Assigned"}
                        </Badge>
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell className="px-4 py-2.5 text-center">
                        {user.is_verified ? (
                          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold text-[11px] gap-1">
                            <IconCheck className="size-3" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 font-semibold text-[11px] gap-1">
                            <IconClock className="size-3" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="px-4 py-2.5 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-7 text-slate-400 hover:text-slate-700">
                              <IconDotsVertical className="size-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36">
                            <DropdownMenuItem onClick={() => handleEdit(user)} className="text-xs gap-2 cursor-pointer">
                              <IconEdit className="size-3.5 text-blue-600" />
                              Edit User
                            </DropdownMenuItem>
                            {!isOwner && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDelete(user.id, user.name)}
                                  className="text-xs gap-2 text-rose-600 cursor-pointer">
                                  <IconTrash className="size-3.5" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Standardized Table Pagination Footer */}
        <TablePagination
          currentPage={validCurrentPage}
          pageSize={pageSize}
          totalItems={totalItems}
          itemName="staff users"
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          className="pt-2 border-t border-slate-100 bg-transparent"
        />
      </Card>

      {/* Modals */}
      <AddUserModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} existingUsers={users} />
      <EditUserModal open={isEditModalOpen} onOpenChange={setIsEditModalOpen} user={selectedUser} />
    </div>
  );
};
