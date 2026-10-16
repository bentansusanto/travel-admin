"use client";

import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { useUpdatePermissionMutation } from "@/store/services/permission.service";
import { useFormik } from "formik";
import { Loader2 } from "lucide-react";
import React, { useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";

const updatePermissionSchema = z.object({
  name: z
    .string()
    .min(2, "Permission code must be at least 2 characters")
    .regex(/^[a-z0-9_-]+:[a-z0-9_-]+$/, "Format must be module:action (e.g. users:create)"),
  description: z.string().optional()
});

type UpdatePermissionFormValues = z.infer<typeof updatePermissionSchema>;

interface EditPermissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permission: any;
}

export const EditPermissionModal = ({ open, onOpenChange, permission }: EditPermissionModalProps) => {
  const [updatePermission, { isLoading }] = useUpdatePermissionMutation();

  const formik = useFormik<UpdatePermissionFormValues>({
    initialValues: {
      name: "",
      description: ""
    },
    enableReinitialize: true,
    validate: (values) => {
      const result = updatePermissionSchema.safeParse(values);
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
    onSubmit: async (values) => {
      if (!permission?.id) return;
      try {
        await updatePermission({ id: permission.id, ...values }).unwrap();
        toast.success("Permission updated successfully");
        onOpenChange(false);
      } catch (err: any) {
        toast.error(err?.data?.message || "Failed to update permission");
      }
    }
  });

  useEffect(() => {
    if (permission) {
      formik.setValues({
        name: permission.name || "",
        description: permission.description || ""
      });
    }
  }, [permission]);

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">Edit Permission</DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Update permission code and operational description.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-semibold text-slate-700">
              Permission Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={formik.touched.name && formik.errors.name ? "border-red-500" : ""}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-xs text-red-500">{formik.errors.name}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-semibold text-slate-700">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>

          <DialogFooter className="pt-3 border-t">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
              {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
