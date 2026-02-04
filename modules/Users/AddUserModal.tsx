"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useFindAllRolesQuery } from "@/store/services/role.service";
import { useCreateUserMutation } from "@/store/services/user.service";
import { useFormik } from "formik";
import { Check, ChevronsUpDown, Eye, EyeOff, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

// Zod validation schema
const createUserSchema = z.object({
  name: z.string().min(1, "Name is required").min(3, "Name must be at least 3 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
  role_id: z.string().min(1, "Role is required")
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

interface AddUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingUsers: any[];
}

export const AddUserModal = ({ open, onOpenChange, existingUsers }: AddUserModalProps) => {
  const [createUser, { isLoading }] = useCreateUserMutation();
  const { data: rolesData } = useFindAllRolesQuery(undefined);
  const [showPassword, setShowPassword] = useState(false);
  const [openRoleCombobox, setOpenRoleCombobox] = useState(false);

  // Calculate role counts from existing users
  const roleCount = React.useMemo(() => {
    const counts: Record<string, number> = {};
    existingUsers.forEach((user: any) => {
      const roleCode = user.role?.code;
      if (roleCode) {
        counts[roleCode] = (counts[roleCode] || 0) + 1;
      }
    });
    return counts;
  }, [existingUsers]);

  // Check if a role should be disabled (owner >= 2, developer >= 2)
  const isRoleDisabled = (roleCode: string) => {
    if (roleCode === "owner" && roleCount["owner"] >= 2) return true;
    if (roleCode === "developer" && roleCount["developer"] >= 2) return true;
    return false;
  };

  const formik = useFormik<CreateUserFormValues>({
    initialValues: {
      name: "",
      email: "",
      password: "",
      role_id: ""
    },
    validate: (values) => {
      const result = createUserSchema.safeParse(values);
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
        await createUser(values).unwrap();
        toast.success("User created successfully");
        resetForm();
        onOpenChange(false);
      } catch (err: any) {
        toast.error(err?.data?.message || "Failed to create user");
      }
    }
  });

  const handleClose = () => {
    if (!isLoading) {
      formik.resetForm();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Name Field */}
            <div className="grid gap-2">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter user name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={isLoading}
                className={formik.touched.name && formik.errors.name ? "border-red-500" : ""}
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-sm text-red-500">{formik.errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="grid gap-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter email address"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={isLoading}
                className={formik.touched.email && formik.errors.email ? "border-red-500" : ""}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-sm text-red-500">{formik.errors.email}</p>
              )}
            </div>

            {/* Role Field */}
            <div className="grid gap-2">
              <Label htmlFor="role_id">
                Role <span className="text-red-500">*</span>
              </Label>
              <Popover open={openRoleCombobox} onOpenChange={setOpenRoleCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    disabled={isLoading}
                    className={cn(
                      "w-full justify-between",
                      !formik.values.role_id && "text-muted-foreground",
                      formik.touched.role_id && formik.errors.role_id && "border-red-500"
                    )}>
                    {formik.values.role_id
                      ? rolesData?.data?.find((role: any) => role.id === formik.values.role_id)
                          ?.name
                      : "Select role"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search role..." />
                    <CommandList>
                      <CommandEmpty>No role found.</CommandEmpty>
                      <CommandGroup>
                        {rolesData?.data?.map((role: any) => {
                          const disabled = isRoleDisabled(role.code);
                          const count = roleCount[role.code] || 0;
                          return (
                            <CommandItem
                              key={role.id}
                              value={role.name}
                              disabled={disabled}
                              onSelect={() => {
                                if (!disabled) {
                                  formik.setFieldValue("role_id", role.id);
                                  formik.setFieldTouched("role_id", true);
                                  setOpenRoleCombobox(false);
                                }
                              }}
                              className={cn(disabled && "cursor-not-allowed opacity-50")}>
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  role.id === formik.values.role_id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-1 items-center justify-between">
                                <span>{role.name}</span>
                                {(role.code === "owner" || role.code === "developer") && (
                                  <span className="text-muted-foreground ml-2 text-xs">
                                    ({count}/2)
                                  </span>
                                )}
                              </div>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {formik.touched.role_id && formik.errors.role_id && (
                <p className="text-sm text-red-500">{formik.errors.role_id}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="grid gap-2">
              <Label htmlFor="password">
                Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isLoading}
                  className={
                    formik.touched.password && formik.errors.password
                      ? "border-red-500 pr-10"
                      : "pr-10"
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={isLoading}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="text-sm text-red-500">{formik.errors.password}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
