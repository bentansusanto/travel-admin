"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
} from "@/components/ui/field";
import { Merek } from "@/store/services/motor.service";
import { toast } from "sonner";

const merekSchema = z.object({
  name_merek: z.string().min(1, "Brand name is required"),
});

type MerekFormValues = z.infer<typeof merekSchema>;

interface MerekModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MerekFormValues) => Promise<void>;
  initialData?: Merek | null;
  title: string;
}

export function MerekModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
}: MerekModalProps) {
  const form = useForm<MerekFormValues>({
    resolver: zodResolver(merekSchema),
    defaultValues: {
      name_merek: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name_merek: initialData.name_merek,
      });
    } else {
      form.reset({
        name_merek: "",
      });
    }
  }, [initialData, form, isOpen]);

  const onHandleSubmit = async (data: MerekFormValues) => {
    try {
      await onSubmit(data);
      onClose();
      toast.success(initialData ? "Brand updated" : "Brand created");
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onHandleSubmit)} className="space-y-6 pt-4">
          <Field>
            <FieldLabel>Brand Name</FieldLabel>
            <FieldContent>
              <Input
                {...form.register("name_merek")}
                placeholder="e.g. Honda, Yamaha"
              />
              <FieldError errors={[form.formState.errors.name_merek]} />
            </FieldContent>
          </Field>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? "Save Changes" : "Create Brand"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
