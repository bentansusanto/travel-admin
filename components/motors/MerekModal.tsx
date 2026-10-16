"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Merek } from "@/store/services/motor.service";
import { IconCheck, IconMotorbike } from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface MerekModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name_merek: string }) => Promise<any>;
  initialData?: Merek | null;
  title?: string;
}

export function MerekModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
}: MerekModalProps) {
  const [nameMerek, setNameMerek] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNameMerek(initialData?.name_merek || "");
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameMerek.trim()) {
      toast.error("Brand name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({ name_merek: nameMerek.trim() });
      onClose();
      toast.success(initialData ? "Brand updated successfully" : "Brand created successfully");
    } catch (error: any) {
      console.error("Failed to save brand:", error);
      toast.error(error?.data?.message || "Failed to save brand");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md bg-white border-slate-200 p-0 gap-0 overflow-hidden shadow-2xl rounded-2xl">
        <DialogHeader className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/70 text-left">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shadow-2xs">
              <IconMotorbike className="size-4.5" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-slate-900 text-left">
                {title || (initialData ? "Edit Motorcycle Brand" : "Add New Motorcycle Brand")}
              </DialogTitle>
              <DialogDescription className="text-[11px] text-slate-500 mt-0.5 text-left">
                Register manufacturer name for fleet classification.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-3.5">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                Brand Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                placeholder="e.g. Honda, Yamaha, Vespa, Kawasaki..."
                value={nameMerek}
                onChange={(e) => setNameMerek(e.target.value)}
                disabled={isSubmitting}
                className="h-9 text-xs bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500"
                autoFocus
              />
              <p className="text-[10px] text-slate-400">
                This brand will appear in vehicle registration filters and dropdowns.
              </p>
            </div>
          </div>

          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/70 flex flex-row items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-8.5 text-xs font-semibold border-slate-200 text-slate-700 bg-white hover:bg-slate-50">
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="h-8.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold gap-1.5 shadow-xs">
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <IconCheck className="size-3.5" />
                  <span>{initialData ? "Save Changes" : "Create Brand"}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
