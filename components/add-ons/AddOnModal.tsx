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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
} from "@/components/ui/field";
import { AddOn, AddOnCategory } from "@/store/services/add-ons.service";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

const addOnSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.number().min(0, "Price must be positive"),
  max_price: z.number().min(0, "Max price must be positive").optional(),
  category: z.enum(["motor", "tour", "general"]),
  description: z.string().optional(),
});

type AddOnFormValues = z.infer<typeof addOnSchema>;

interface AddOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddOnFormValues) => Promise<void>;
  initialData?: AddOn | null;
  title: string;
}

export function AddOnModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
}: AddOnModalProps) {
  const form = useForm<AddOnFormValues>({
    resolver: zodResolver(addOnSchema),
    defaultValues: {
      name: "",
      price: 0,
      max_price: 0,
      category: "general",
      description: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        price: Number(initialData.price),
        max_price: initialData.max_price ? Number(initialData.max_price) : 0,
        category: initialData.category,
        description: initialData.description || "",
      });
    } else {
      form.reset({
        name: "",
        price: 0,
        max_price: 0,
        category: "general",
        description: "",
      });
    }
  }, [initialData, form, isOpen]);

  const onHandleSubmit = async (data: AddOnFormValues) => {
    try {
      await onSubmit(data);
      onClose();
      toast.success(initialData ? "Add-on updated" : "Add-on created");
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={form.handleSubmit(onHandleSubmit)}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Field>
              <FieldLabel>Name</FieldLabel>
              <FieldContent>
                <Input {...form.register("name")} placeholder="Add-on Name" />
                <FieldError errors={[form.formState.errors.name]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>Category</FieldLabel>
              <FieldContent>
                <Select
                  onValueChange={(val) => form.setValue("category", val as AddOnCategory)}
                  value={form.watch("category")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="tour">Tour</SelectItem>
                    <SelectItem value="motor">Motor</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError errors={[form.formState.errors.category]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>Price (IDR) / Min Price</FieldLabel>
              <FieldContent>
                <Input
                  type="text"
                  placeholder="0"
                  value={
                    form.watch("price") === 0
                      ? ""
                      : new Intl.NumberFormat("id-ID").format(form.watch("price"))
                  }
                  onChange={(e) => {
                    const value = e.target.value.replace(/\./g, "");
                    if (value === "" || /^\d+$/.test(value)) {
                      form.setValue("price", value === "" ? 0 : parseInt(value));
                    }
                  }}
                />
                <FieldError errors={[form.formState.errors.price]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>Max Price (IDR) - Optional</FieldLabel>
              <FieldContent>
                <Input
                  type="text"
                  placeholder="Optional max price for range"
                  value={
                    !form.watch("max_price")
                      ? ""
                      : new Intl.NumberFormat("id-ID").format(form.watch("max_price")!)
                  }
                  onChange={(e) => {
                    const value = e.target.value.replace(/\./g, "");
                    if (value === "" || /^\d+$/.test(value)) {
                      form.setValue("max_price", value === "" ? 0 : parseInt(value));
                    }
                  }}
                />
                <FieldError errors={[form.formState.errors.max_price]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>Description</FieldLabel>
              <FieldContent>
                <Textarea
                  {...form.register("description")}
                  placeholder="Optional description"
                />
                <FieldError errors={[form.formState.errors.description]} />
              </FieldContent>
            </Field>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? "Save Changes" : "Create Add-on"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
