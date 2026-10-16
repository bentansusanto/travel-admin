"use client";

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
import {
  useDeletePermissionMutation,
  useFindAllPermissionsQuery
} from "@/store/services/permission.service";
import {
  IconDotsVertical,
  IconEdit,
  IconKey,
  IconPlus,
  IconSearch,
  IconTrash
} from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AddPermissionModal } from "../modals/AddPermissionModal";
import { EditPermissionModal } from "../modals/EditPermissionModal";

export const PermissionsTab = () => {
  const { data: permissionsData, isLoading, isError, error } = useFindAllPermissionsQuery(undefined);
  const [deletePermission] = useDeletePermissionMutation();

  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<any>(null);

  const permissions: any[] = useMemo(() => {
    return permissionsData?.data || [];
  }, [permissionsData]);

  // Extract unique module names from permission codes (e.g. "users:read" -> "users")
  const modules = useMemo(() => {
    const set = new Set<string>();
    permissions.forEach((p) => {
      if (p.name?.includes(":")) {
        set.add(p.name.split(":")[0]);
      }
    });
    return Array.from(set);
  }, [permissions]);

  // Filtered permissions
  const filteredPermissions = useMemo(() => {
    return permissions.filter((p) => {
      const matchesSearch =
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase());

      const matchesModule =
        moduleFilter === "all" ||
        (p.name?.includes(":") && p.name.split(":")[0] === moduleFilter);

      return matchesSearch && matchesModule;
    });
  }, [permissions, search, moduleFilter]);

  // Reset pagination when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, moduleFilter, pageSize]);

  // Pagination calculations
  const totalItems = filteredPermissions.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedPermissions = filteredPermissions.slice(startIndex, endIndex);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete permission "${name}"?`)) return;
    try {
      await deletePermission(id).unwrap();
      toast.success("Permission deleted successfully");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete permission");
    }
  };

  const handleEdit = (perm: any) => {
    setSelectedPermission(perm);
    setIsEditModalOpen(true);
  };

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
        <p className="text-red-500 text-sm">Error loading permissions: {error?.toString()}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Banner & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <IconKey className="size-4.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">Granular Permission Registry</h3>
            <p className="text-[11px] text-slate-500">
              {permissions.length} total permissions registered across {modules.length} platform modules.
            </p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          className="h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold gap-1.5 shadow-sm hover:shadow-md transition-all shrink-0">
          <IconPlus className="size-4" />
          Add Permission
        </Button>
      </div>

      {/* Search & Filter Toolbar */}
      <Card className="border-slate-200/80 shadow-xs bg-white py-0 gap-0 overflow-hidden">
        <CardContent className="p-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                placeholder="Search permission code or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs bg-slate-50/50 border-slate-200"
              />
            </div>

            {/* Module Filter */}
            <div className="flex items-center gap-2">
              <Select value={moduleFilter} onValueChange={setModuleFilter}>
                <SelectTrigger className="h-9 text-xs w-[160px] bg-slate-50/50 border-slate-200">
                  <SelectValue placeholder="All Modules" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  {modules.map((m) => (
                    <SelectItem key={m} value={m} className="capitalize">
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permissions Data Table */}
      <Card className="border-slate-200/80 shadow-xs bg-white py-0 gap-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80 border-b border-slate-200/60">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-slate-600 px-4 py-2.5">Permission Code</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 px-4 py-2.5">Module</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 px-4 py-2.5">Description</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 px-4 py-2.5 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPermissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-28 text-center text-xs text-slate-400">
                    No permissions found matching your search criteria.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPermissions.map((perm) => {
                  const moduleName = perm.name?.includes(":") ? perm.name.split(":")[0] : "general";
                  const actionName = perm.name?.includes(":") ? perm.name.split(":")[1] : perm.name;

                  return (
                    <TableRow key={perm.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100">
                      {/* Code */}
                      <TableCell className="px-4 py-2.5 font-mono text-xs font-bold text-blue-700">
                        {perm.name}
                      </TableCell>

                      {/* Module Badge */}
                      <TableCell className="px-4 py-2.5">
                        <Badge variant="outline" className="capitalize text-xs font-semibold border-slate-200 bg-slate-50 text-slate-700">
                          {moduleName}
                        </Badge>
                      </TableCell>

                      {/* Description */}
                      <TableCell className="px-4 py-2.5 text-xs text-slate-600">
                        {perm.description || (
                          <span className="text-slate-400 italic">Allows {actionName} operation on {moduleName}</span>
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
                            <DropdownMenuItem onClick={() => handleEdit(perm)} className="text-xs gap-2 cursor-pointer">
                              <IconEdit className="size-3.5 text-blue-600" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(perm.id, perm.name)}
                              className="text-xs gap-2 text-rose-600 cursor-pointer">
                              <IconTrash className="size-3.5" />
                              Delete
                            </DropdownMenuItem>
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
          itemName="permissions"
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          className="pt-2 border-t border-slate-100 bg-transparent"
        />
      </Card>

      {/* Modals */}
      <AddPermissionModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
      <EditPermissionModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        permission={selectedPermission}
      />
    </div>
  );
};
