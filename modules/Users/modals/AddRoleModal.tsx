"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFindAllPermissionsQuery } from "@/store/services/permission.service";
import { useCreateRoleMutation } from "@/store/services/role.service";
import { useFormik } from "formik";
import { Loader2 } from "lucide-react";
import React, { useMemo } from "react";
import { toast } from "sonner";
import { z } from "zod";

const createRoleSchema = z.object({
  name: z.string().min(2, "Role name must be at least 2 characters"),
  code: z
    .string()
    .min(2, "Role code must be at least 2 characters")
    .regex(/^[a-z0-9_-]+$/, "Code must be lowercase alphanumeric with dashes/underscores"),
  level: z.number().min(1, "Level must be at least 1"),
  self_register: z.boolean().default(false),
  permission_ids: z.array(z.string()).default([])
});

type CreateRoleFormValues = z.infer<typeof createRoleSchema>;

interface AddRoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddRoleModal = ({ open, onOpenChange }: AddRoleModalProps) => {
  const [createRole, { isLoading }] = useCreateRoleMutation();
  const { data: permissionsData, isLoading: isPermissionsLoading } = useFindAllPermissionsQuery(undefined);

  const permissions = permissionsData?.data || [];

  // Group permissions by module prefix (e.g. "users:read" -> module "users")
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, any[]> = {};
    permissions.forEach((perm: any) => {
      const moduleName = perm.name.includes(":") ? perm.name.split(":")[0] : "general";
      if (!groups[moduleName]) {
        groups[moduleName] = [];
      }
      groups[moduleName].push(perm);
    });
    return groups;
  }, [permissions]);

  const formik = useFormik<CreateRoleFormValues>({
    initialValues: {
      name: "",
      code: "",
      level: 2,
      self_register: false,
      permission_ids: []
    },
    validate: (values) => {
      const result = createRoleSchema.safeParse(values);
      if (!result.success) {
        const errors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as string] = err.message;
          }
        });
        return errors;
      }
      return {};
    },
    onSubmit: async (values, { resetForm }) => {
      try {
        await createRole(values).unwrap();
        toast.success("Role created successfully");
        resetForm();
        onOpenChange(false);
      } catch (err: any) {
        toast.error(err?.data?.message || "Failed to create role");
      }
    }
  });

  const handleClose = () => {
    if (!isLoading) {
      formik.resetForm();
      onOpenChange(false);
    }
  };

  const handleTogglePermission = (permId: string) => {
    const current = formik.values.permission_ids;
    if (current.includes(permId)) {
      formik.setFieldValue(
        "permission_ids",
        current.filter((id) => id !== permId)
      );
    } else {
      formik.setFieldValue("permission_ids", [...current, permId]);
    }
  };

  const handleToggleModule = (modulePerms: any[]) => {
    const moduleIds = modulePerms.map((p) => p.id);
    const allSelected = moduleIds.every((id) => formik.values.permission_ids.includes(id));
    if (allSelected) {
      formik.setFieldValue(
        "permission_ids",
        formik.values.permission_ids.filter((id) => !moduleIds.includes(id))
      );
    } else {
      const newIds = Array.from(new Set([...formik.values.permission_ids, ...moduleIds]));
      formik.setFieldValue("permission_ids", newIds);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">Add New Role</DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Define role name, hierarchical authority level, and assign granular permissions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="space-y-5 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Role Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold text-slate-700">
                Role Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. Tour Operations Manager"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={formik.touched.name && formik.errors.name ? "border-red-500" : ""}
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-xs text-red-500">{formik.errors.name}</p>
              )}
            </div>

            {/* Role Code */}
            <div className="space-y-1.5">
              <Label htmlFor="code" className="text-xs font-semibold text-slate-700">
                Role Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                name="code"
                placeholder="e.g. tour_ops"
                value={formik.values.code}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={formik.touched.code && formik.errors.code ? "border-red-500" : ""}
              />
              {formik.touched.code && formik.errors.code && (
                <p className="text-xs text-red-500">{formik.errors.code}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Hierarchy Level */}
            <div className="space-y-1.5">
              <Label htmlFor="level" className="text-xs font-semibold text-slate-700">
                Authority Level (1 = Highest / Owner) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="level"
                name="level"
                type="number"
                min={1}
                max={10}
                value={formik.values.level}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>

            {/* Self Register Toggle */}
            <div className="flex items-center space-x-3 pt-6">
              <Checkbox
                id="self_register"
                checked={formik.values.self_register}
                onCheckedChange={(checked) => formik.setFieldValue("self_register", !!checked)}
              />
              <Label htmlFor="self_register" className="text-xs font-medium text-slate-700 cursor-pointer">
                Allow self-registration for this role
              </Label>
            </div>
          </div>

          {/* Permissions Matrix */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b pb-2">
              <Label className="text-sm font-bold text-slate-900">Assign Module Permissions</Label>
              <span className="text-xs text-slate-500 font-medium">
                {formik.values.permission_ids.length} permissions selected
              </span>
            </div>

            {isPermissionsLoading ? (
              <div className="flex py-6 justify-center items-center">
                <Loader2 className="size-6 animate-spin text-blue-600" />
              </div>
            ) : Object.keys(groupedPermissions).length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No permissions found.</p>
            ) : (
              <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
                {Object.entries(groupedPermissions).map(([moduleName, perms]) => {
                  const moduleIds = perms.map((p) => p.id);
                  const isAllModuleSelected = moduleIds.every((id) =>
                    formik.values.permission_ids.includes(id)
                  );

                  return (
                    <div key={moduleName} className="rounded-lg border border-slate-200/80 p-3 bg-slate-50/50 space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                          {moduleName} Module
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleModule(perms)}
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline">
                          {isAllModuleSelected ? "Deselect All" : "Select All"}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {perms.map((perm: any) => {
                          const isChecked = formik.values.permission_ids.includes(perm.id);
                          return (
                            <label
                              key={perm.id}
                              className="flex items-start gap-2 p-1.5 rounded hover:bg-white transition-colors cursor-pointer">
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={() => handleTogglePermission(perm.id)}
                                className="mt-0.5"
                              />
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold text-slate-800">{perm.name}</span>
                                {perm.description && (
                                  <span className="text-[11px] text-slate-400 line-clamp-1">{perm.description}</span>
                                )}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <DialogFooter className="pt-3 border-t">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
              {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Create Role
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
