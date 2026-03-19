"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
} from "@/components/ui/field";
import { useFindAllMereksQuery, Motor } from "@/store/services/motor.service";
import { useFindAllCountriesQuery } from "@/store/services/destination.service";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Check, ChevronsUpDown, Plus, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const motorSchema = z.object({
  state_id: z.string().min(1, "Location is required"),
  merek_id: z.string().min(1, "Brand is required"),
  engine_cc: z.number().min(1, "Engine CC is required"),
  thumbnail: z.string().min(1, "Thumbnail URL is required"),
  is_available: z.boolean().default(true),
  translations: z.array(
    z.object({
      language_code: z.string(),
      name_motor: z.string().min(1, "Motor name is required"),
      description: z.string().min(1, "Description is required"),
    })
  ),
  variants: z.array(
    z.object({
      color: z.string().min(1, "Color is required"),
    })
  ),
  prices: z.array(
    z.object({
      price_type: z.enum(["daily", "weekly"]),
      price: z.number().min(0, "Price must be positive"),
    })
  ),
});

type MotorFormValues = z.infer<typeof motorSchema>;

interface MotorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MotorFormValues) => Promise<void>;
  initialData?: Motor | null;
  title: string;
}

export function MotorModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
}: MotorModalProps) {
  const { data: mereksData } = useFindAllMereksQuery();
  const { data: countriesData } = useFindAllCountriesQuery();
  const [openCombobox, setOpenCombobox] = useState(false);

  const states = countriesData?.data.flatMap((c) => c.cities) || [];

  const form = useForm<MotorFormValues>({
    resolver: zodResolver(motorSchema),
    defaultValues: {
      state_id: "",
      merek_id: "",
      engine_cc: 0,
      thumbnail: "",
      is_available: true,
      translations: [
        { language_code: "en", name_motor: "", description: "" },
        { language_code: "id", name_motor: "", description: "" },
      ],
      variants: [{ color: "" }],
      prices: [
        { price_type: "daily", price: 0 },
        { price_type: "weekly", price: 0 },
      ],
    },
  });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } =
    useFieldArray({
      control: form.control,
      name: "variants",
    });

  useEffect(() => {
    if (initialData) {
      form.reset({
        state_id: initialData.state_id || initialData.state?.id || "",
        merek_id: initialData.merek_id || initialData.merek?.id || "",
        engine_cc: initialData.engine_cc,
        thumbnail: initialData.thumbnail,
        is_available: initialData.is_available,
        translations: [
          initialData.translations.find((t) => t.language_code === "en") || {
            language_code: "en",
            name_motor: "",
            description: "",
          },
          initialData.translations.find((t) => t.language_code === "id") || {
            language_code: "id",
            name_motor: "",
            description: "",
          },
        ],
        variants: initialData.variants.length
          ? initialData.variants
          : [{ color: "" }],
        prices: (initialData.motor_prices && initialData.motor_prices.length > 0)
          ? initialData.motor_prices.map(p => ({ price_type: p.price_type, price: Number(p.price) }))
          : (initialData.prices && initialData.prices.length > 0)
          ? initialData.prices.map(p => ({ price_type: p.price_type, price: Number(p.price) }))
          : [
              { price_type: "daily", price: 0 },
              { price_type: "weekly", price: 0 },
            ],
      });
    } else {
      form.reset({
        state_id: "",
        merek_id: "",
        engine_cc: 0,
        thumbnail: "",
        is_available: true,
        translations: [
          { language_code: "en", name_motor: "", description: "" },
          { language_code: "id", name_motor: "", description: "" },
        ],
        variants: [{ color: "" }],
        prices: [
          { price_type: "daily", price: 0 },
          { price_type: "weekly", price: 0 },
        ],
      });
    }
  }, [initialData, form, isOpen]);

  const onHandleSubmit = async (data: MotorFormValues) => {
    try {
      await onSubmit(data);
      onClose();
      toast.success(initialData ? "Motor updated" : "Motor created");
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 flex flex-col overflow-hidden">
        <form
          onSubmit={form.handleSubmit(onHandleSubmit)}
          className="flex flex-col h-full overflow-hidden"
        >
          {/* Sticky Header */}
          <div className="p-6 pb-4 sticky top-0 bg-background z-20 border-b shadow-sm space-y-6">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Brand</FieldLabel>
                <FieldContent>
                  <Select
                    onValueChange={(val) => form.setValue("merek_id", val)}
                    value={form.watch("merek_id")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {mereksData?.data.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name_merek}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[form.formState.errors.merek_id]} />
                </FieldContent>
              </Field>

              <Field className="flex flex-col">
                <FieldLabel>Location (State, Country)</FieldLabel>
                <FieldContent>
                  <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between font-normal",
                          !form.watch("state_id") && "text-muted-foreground"
                        )}
                      >
                        <span className="truncate flex-1 text-left">
                          {form.watch("state_id")
                            ? countriesData?.data
                                ?.flatMap((c) =>
                                  c.cities.map((s) => ({
                                    label: `${s.name}, ${c.name}`,
                                    value: s.id,
                                  }))
                                )
                                .find((s) => s.value === form.watch("state_id"))?.label
                            : "Select location"}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search location..." />
                        <CommandList className="max-h-[300px] overflow-y-auto">
                          <CommandEmpty>No location found.</CommandEmpty>
                          {countriesData?.data?.map((country) => (
                            <CommandGroup
                              key={country.id}
                              heading={country.name}
                              className="font-bold"
                            >
                              {country.cities.map((state) => (
                                <CommandItem
                                  key={state.id}
                                  value={`${state.name}, ${country.name}`}
                                  onSelect={() => {
                                    form.setValue("state_id", state.id);
                                    setOpenCombobox(false);
                                  }}
                                  className="pl-4 font-normal"
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      state.id === form.watch("state_id")
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {state.name}, {country.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          ))}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FieldError errors={[form.formState.errors.state_id]} />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>Engine CC</FieldLabel>
                <FieldContent>
                  <Input
                    type="number"
                    {...form.register("engine_cc", { valueAsNumber: true })}
                  />
                  <FieldError errors={[form.formState.errors.engine_cc]} />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>Thumbnail URL</FieldLabel>
                <FieldContent>
                  <Input {...form.register("thumbnail")} />
                  <FieldError errors={[form.formState.errors.thumbnail]} />
                </FieldContent>
              </Field>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="available-toggle"
                checked={form.watch("is_available")}
                onCheckedChange={(val) => form.setValue("is_available", val)}
                className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-200"
              />
              <FieldLabel htmlFor="available-toggle" className="cursor-pointer">
                Available for rent
              </FieldLabel>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Translations</h3>
              </div>
              <Tabs defaultValue="en" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="en">English</TabsTrigger>
                  <TabsTrigger value="id">Indonesia</TabsTrigger>
                </TabsList>
                {form.watch("translations").map((translation, index) => (
                  <TabsContent
                    key={translation.language_code}
                    value={translation.language_code}
                  >
                    <div className="space-y-4 pt-4">
                      <Field>
                        <FieldLabel>
                          Name ({translation.language_code.toUpperCase()})
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            {...form.register(`translations.${index}.name_motor`)}
                          />
                          <FieldError
                            errors={[
                              form.formState.errors.translations?.[index]
                                ?.name_motor,
                            ]}
                          />
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel>
                          Description ({translation.language_code.toUpperCase()})
                        </FieldLabel>
                        <FieldContent>
                          <Textarea
                            {...form.register(`translations.${index}.description`)}
                          />
                          <FieldError
                            errors={[
                              form.formState.errors.translations?.[index]
                                ?.description,
                            ]}
                          />
                        </FieldContent>
                      </Field>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            <div className="space-y-10">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Variants (Colors)</h3>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => appendVariant({ color: "" })}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Variant
                  </Button>
                </div>
                {variantFields.map((field, index) => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <Input
                      {...form.register(`variants.${index}.color`)}
                      placeholder="e.g. Black - Matt"
                    />
                    {variantFields.length > 1 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeVariant(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {form.watch("prices").map((price, index) => (
                    <Field key={index}>
                      <FieldLabel>
                        {price.price_type === "daily"
                          ? "Daily Price"
                          : "Weekly Price"}
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          placeholder="0"
                          value={
                            price.price === 0
                              ? ""
                              : new Intl.NumberFormat("en-US").format(price.price)
                          }
                          onChange={(e) => {
                            const value = e.target.value.replace(/,/g, "");
                            if (value === "" || /^\d+$/.test(value)) {
                              form.setValue(
                                `prices.${index}.price`,
                                value === "" ? 0 : parseInt(value)
                              );
                            }
                          }}
                        />
                        <FieldError
                          errors={[form.formState.errors.prices?.[index]?.price]}
                        />
                      </FieldContent>
                    </Field>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="p-6 pt-4 sticky bottom-0 bg-background z-20 border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            <DialogFooter className="flex items-center justify-end gap-3 sm:space-x-0">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="min-w-[120px]">
                {initialData ? "Save Changes" : "Create Motor"}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
