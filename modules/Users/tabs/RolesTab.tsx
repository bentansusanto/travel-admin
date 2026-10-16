"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  useDeleteRoleMutation,
  useFindAllRolesQuery
} from "@/store/services/role.service";
import {
  IconDotsVertical,
  IconEdit,
  IconKey,
  IconLock,
  IconPlus,
  IconShield,
  IconShieldCheck,
  IconTrash
} from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { AddRoleModal } from "../modals/AddRoleModal";
import { EditRoleModal } from "../modals/EditRoleModal";

export const RolesTab = () => {
  const { data: rolesData, isLoading, isError, error } = useFindAllRolesQuery(undefined);
  const [deleteRole] = useDeleteRoleMutation();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);

  const roles: any[] = rolesData?.data || [];

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete role "${name}"?`)) return;
    try {
      await deleteRole(id).unwrap();
      toast.success("Role deleted successfully");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete role");
    }
  };

  const handleEdit = (role: any) => {
    setSelectedRole(role);
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
        <p className="text-red-500 text-sm">Error loading roles: {error?.toString()}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Banner & Add Role */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <IconShieldCheck className="size-4.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">Role-Based Access Control (RBAC)</h3>
            <p className="text-[11px] text-slate-500">
              Define authority levels, role codes, and granular permissions for internal staff.
            </p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          className="h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold gap-1.5 shadow-sm hover:shadow-md transition-all shrink-0">
          <IconPlus className="size-4" />
          Add New Role
        </Button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {roles.map((role) => {
          const isOwner = role.code === "owner";
          const permCount = role.permissions?.length || 0;

          return (
            <Card
              key={role.id}
              className="border-slate-200/80 shadow-xs bg-white hover:border-blue-200 transition-colors flex flex-col justify-between py-0 gap-0 overflow-hidden">
              <CardHeader className="p-3.5 pb-2 border-b border-slate-100 [.border-b]:pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8.5 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-bold">
                      <IconShield className="size-4.5" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold text-slate-900">{role.name}</CardTitle>
                      <CardDescription className="text-[11px] text-slate-400 font-mono">
                        code: {role.code}
                      </CardDescription>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-7 text-slate-400 hover:text-slate-700">
                        <IconDotsVertical className="size-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuItem onClick={() => handleEdit(role)} className="text-xs gap-2 cursor-pointer">
                        <IconEdit className="size-3.5 text-blue-600" />
                        Edit Role
                      </DropdownMenuItem>
                      {!isOwner && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(role.id, role.name)}
                            className="text-xs gap-2 text-rose-600 cursor-pointer">
                            <IconTrash className="size-3.5" />
                            Delete Role
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="p-3.5 space-y-2.5">
                {/* Badges Info */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="outline" className="text-[10px] font-semibold border-slate-200 bg-slate-50 text-slate-700 px-1.5 py-0.5">
                    Level {role.level ?? 2}
                  </Badge>

                  <Badge variant="outline" className="text-[10px] font-semibold border-blue-200 bg-blue-50 text-blue-700 gap-1 px-1.5 py-0.5">
                    <IconKey className="size-3" />
                    {permCount} Permissions
                  </Badge>

                  {role.self_register ? (
                    <Badge variant="outline" className="text-[10px] font-semibold border-emerald-200 bg-emerald-50 text-emerald-700 px-1.5 py-0.5">
                      Public Register
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] font-semibold border-slate-200 bg-slate-50 text-slate-500 gap-1 px-1.5 py-0.5">
                      <IconLock className="size-3" />
                      Internal Only
                    </Badge>
                  )}
                </div>

                {/* Permissions Sample Chips */}
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 mb-1">Assigned Permissions:</p>
                  {permCount === 0 ? (
                    <p className="text-xs text-slate-400 italic">No permissions assigned.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                      {role.permissions?.slice(0, 6).map((p: any, idx: number) => {
                        const permName = typeof p === "string" ? p : p.name;
                        return (
                          <span
                            key={idx}
                            className="text-[9px] font-mono font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200/60">
                            {permName}
                          </span>
                        );
                      })}
                      {permCount > 6 && (
                        <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-blue-50 text-blue-600">
                          +{permCount - 6} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Edit Button Footer */}
                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(role)}
                    className="h-7 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1 px-2.5">
                    <IconEdit className="size-3" />
                    Configure Permissions
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modals */}
      <AddRoleModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
      <EditRoleModal open={isEditModalOpen} onOpenChange={setIsEditModalOpen} role={selectedRole} />
    </div>
  );
};
