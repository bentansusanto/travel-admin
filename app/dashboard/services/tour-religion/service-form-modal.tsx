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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  useCreateDestinationMutation,
  useCreateTranslationDestinationMutation,
  useFindAllCategoryDestinationsQuery,
  useFindAllCountriesQuery,
  useUpdateDestinationMutation,
  useUpdateTranslationDestinationMutation
} from "@/store/services/destination.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { TourReligion } from "./data-table";

// --- Schema Definitions ---

// Schema for a single translation (shared for EN and ID)
const translationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  thumbnail: z.string().url("Invalid URL").or(z.literal("")),
  image: z.array(z.object({ value: z.string().url("Invalid URL") })),
  detail_tour: z.array(z.object({ value: z.string().min(1, "Detail is required") })),
  facilities: z.array(z.object({ value: z.string().min(1, "Facility is required") }))
});

const formSchema = z.object({
  // Base Destination Fields
  state_id: z.string().min(1, "Location is required"),
  category_destination_id: z.string().min(1, "Category is required"),
  price: z.coerce.number().min(0, "Price must be positive"),

  // Translations
  translations: z.object({
    en: translationSchema,
    id: translationSchema
  })
});

type TranslationFormValues = z.infer<typeof translationSchema>;
type FormValues = z.infer<typeof formSchema>;

// --- Components for Reusable Fields ---

const TranslationFields = ({
  lang,
  control,
  register
}: {
  lang: "en" | "id";
  control: any;
  register: any; // passing register for simple inputs if needed, though Control is better for arrays
}) => {
  // We need to use useFieldArray for *each* language's arrays.

  // Images
  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage
  } = useFieldArray({
    control,
    name: `translations.${lang}.image`
  });

  // Detail Tour
  const {
    fields: detailFields,
    append: appendDetail,
    remove: removeDetail
  } = useFieldArray({
    control,
    name: `translations.${lang}.detail_tour`
  });

  // Facilities
  const {
    fields: facilitiesFields,
    append: appendFacility,
    remove: removeFacility
  } = useFieldArray({
    control,
    name: `translations.${lang}.facilities`
  });

  return (
    <div className="space-y-4 py-4">
      <FormField
        control={control}
        name={`translations.${lang}.name`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name ({lang.toUpperCase()})</FormLabel>
            <FormControl>
              <Input placeholder={`Name in ${lang.toUpperCase()}`} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`translations.${lang}.description`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description ({lang.toUpperCase()})</FormLabel>
            <FormControl>
              <Textarea placeholder={`Description in ${lang.toUpperCase()}`} {...field} rows={4} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`translations.${lang}.thumbnail`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Thumbnail URL</FormLabel>
            <FormControl>
              <Input placeholder="https://example.com/image.jpg" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Images Array */}
      <div className="space-y-2">
        <FormLabel>Images</FormLabel>
        {imageFields.map((field, index) => (
          <div key={field.id} className="flex gap-2">
            <FormField
              control={control}
              name={`translations.${lang}.image.${index}.value`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input placeholder="Image URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => removeImage(index)}
              disabled={imageFields.length === 1}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => appendImage({ value: "" })}>
          <Plus className="mr-2 h-4 w-4" /> Add Image
        </Button>
      </div>

      {/* Detail Tour Array */}
      <div className="space-y-2">
        <FormLabel>Tour Details (Itinerary/Highlights)</FormLabel>
        {detailFields.map((field, index) => (
          <div key={field.id} className="flex gap-2">
            <FormField
              control={control}
              name={`translations.${lang}.detail_tour.${index}.value`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input placeholder="e.g. Day 1: Arrival" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => removeDetail(index)}
              disabled={detailFields.length === 1}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => appendDetail({ value: "" })}>
          <Plus className="mr-2 h-4 w-4" /> Add Detail
        </Button>
      </div>

      {/* Facilities Array */}
      <div className="space-y-2">
        <FormLabel>Facilities</FormLabel>
        {facilitiesFields.map((field, index) => (
          <div key={field.id} className="flex gap-2">
            <FormField
              control={control}
              name={`translations.${lang}.facilities.${index}.value`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input placeholder="e.g. WiFi, Breakfast" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => removeFacility(index)}
              disabled={facilitiesFields.length === 1}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => appendFacility({ value: "" })}>
          <Plus className="mr-2 h-4 w-4" /> Add Facility
        </Button>
      </div>
    </div>
  );
};

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: TourReligion | null; // Service to update, null if creating new
  onSubmit: (data: any) => void;
}

export default function ServiceFormModal({
  isOpen,
  onClose,
  service,
  onSubmit
}: ServiceFormModalProps) {
  const [createDestination] = useCreateDestinationMutation();
  const [updateDestination] = useUpdateDestinationMutation();
  const [createTranslation] = useCreateTranslationDestinationMutation();
  const [updateTranslation] = useUpdateTranslationDestinationMutation();

  const { data: categoriesData } = useFindAllCategoryDestinationsQuery();
  const { data: countriesData } = useFindAllCountriesQuery();
  const [openCombobox, setOpenCombobox] = useState(false);

  // Helper to extract translation data or defaults
  const getTranslationDefaults = (langCode: "en" | "id", currentService: TourReligion | null) => {
    const translation = currentService?.translations?.find((t) => t.language_code === langCode);

    // If we have currentService but no translation for this language, we might want to prefill with 'en' data if available?
    // Or just empty. For mandatory fields, maybe better empty to force entry.
    // Let's check if we can fallback to EN data if ID is missing to help user copy?
    // The requirement says "wajib bikin translation" (mandatory), so prefilling might be nice but not required.
    // Let's stick to empty if not found to ensure they consciously enter it.

    return {
      name: translation?.name || "",
      description: translation?.description || "",
      thumbnail: translation?.thumbnail || "",
      image: translation?.image?.map((v) => ({ value: v })) || [{ value: "" }],
      detail_tour: translation?.detail_tour?.map((v) => ({ value: v })) || [{ value: "" }],
      facilities: translation?.facilities?.map((v) => ({ value: v })) || [{ value: "" }]
    };
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      state_id: "",
      category_destination_id: "",
      price: 0,
      translations: {
        en: {
          name: "",
          description: "",
          thumbnail: "",
          image: [{ value: "" }],
          detail_tour: [{ value: "" }],
          facilities: [{ value: "" }]
        },
        id: {
          name: "",
          description: "",
          thumbnail: "",
          image: [{ value: "" }],
          detail_tour: [{ value: "" }],
          facilities: [{ value: "" }]
        }
      }
    }
  });

  useEffect(() => {
    if (isOpen && service) {
      form.reset({
        state_id: service.state_id || "",
        category_destination_id: service.category_destination_id || "",
        price: service.price || 0,
        translations: {
          en: getTranslationDefaults("en", service),
          id: getTranslationDefaults("id", service)
        }
      });
    } else if (isOpen && !service) {
      form.reset({
        state_id: "",
        category_destination_id: "",
        price: 0,
        translations: {
          en: {
            name: "",
            description: "",
            thumbnail: "",
            image: [{ value: "" }],
            detail_tour: [{ value: "" }],
            facilities: [{ value: "" }]
          },
          id: {
            name: "",
            description: "",
            thumbnail: "",
            image: [{ value: "" }],
            detail_tour: [{ value: "" }],
            facilities: [{ value: "" }]
          }
        }
      });
    }
  }, [isOpen, service, form]);

  const handleSubmit = async (values: FormValues) => {
    try {
      const promise = (async () => {
        const destinationData = {
          state_id: values.state_id,
          category_destination_id: values.category_destination_id,
          price: values.price
        };

        let destinationId = service?.id;

        // 1. Create or Update Destination
        if (service) {
          await updateDestination({ id: service.id, data: destinationData }).unwrap();
        } else {
          const createRes = await createDestination(destinationData).unwrap();
          destinationId = createRes.data?.id;
          if (!destinationId) throw new Error("Failed to get new destination ID");
        }

        // 2. Process Translations (EN & ID)
        const languages: ("en" | "id")[] = ["en", "id"];

        for (const lang of languages) {
          const tData = values.translations[lang];
          const translationPayload = {
            name: tData.name,
            description: tData.description,
            language_code: lang,
            thumbnail: tData.thumbnail,
            image: tData.image.map((i) => i.value),
            detail_tour: tData.detail_tour.map((i) => i.value),
            facilities: tData.facilities.map((i) => i.value)
          };

          if (service) {
            // Upsert Logic handled by backend now
            await updateTranslation({ id: service.id, translation: translationPayload }).unwrap();
          } else {
            // Create Logic
            await createTranslation({
              id: destinationId as string,
              translation: translationPayload
            }).unwrap();
          }
        }

        onSubmit(values); // Trigger refetch
        onClose();
      })();

      toast.promise(promise, {
        loading: service ? "Updating service..." : "Creating service...",
        success: service ? "Service updated successfully" : "Service created successfully",
        error: (err: any) => {
          console.error("Failed to save service:", err);
          let errorMessage = err?.data?.message || err?.message || "Unknown error occurred";
          if (err?.data?.Error && Array.isArray(err.data.Error)) {
            errorMessage = err.data.Error.map((e: any) => e.body).join(", ");
          }
          if (typeof errorMessage === "object") {
            return `Failed: ${JSON.stringify(errorMessage)}`;
          }
          return Array.isArray(errorMessage)
            ? `Failed: ${errorMessage.join(", ")}`
            : `Failed: ${errorMessage}`;
        }
      });
    } catch (error) {
      console.error("Unexpected error in handleSubmit:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden p-0 [&>button]:hidden">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>{service ? "Update Service" : "Add New Service"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
              {/* --- Core Fields --- */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Location */}
                <FormField
                  control={form.control}
                  name="state_id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Location (State, Country)</FormLabel>
                      <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}>
                              {field.value
                                ? countriesData?.data
                                    ?.flatMap((c) =>
                                      c.cities.map((s) => ({
                                        label: `${s.name}, ${c.name}`,
                                        value: s.id
                                      }))
                                    )
                                    .find((s) => s.value === field.value)?.label
                                : "Select location"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                          <Command>
                            <CommandInput placeholder="Search location..." />
                            <CommandList className="max-h-[300px] overflow-y-auto">
                              <CommandEmpty>No location found.</CommandEmpty>
                              {countriesData?.data?.map((country) => (
                                <CommandGroup
                                  key={country.id}
                                  heading={country.name}
                                  className="font-bold">
                                  {country.cities.map((state) => (
                                    <CommandItem
                                      key={state.id}
                                      value={`${state.name}, ${country.name}`}
                                      onSelect={() => {
                                        form.setValue("state_id", state.id);
                                        setOpenCombobox(false);
                                      }}
                                      className="pl-4 font-normal">
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          state.id === field.value ? "opacity-100" : "opacity-0"
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category */}
                <FormField
                  control={form.control}
                  name="category_destination_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categoriesData?.data?.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Price */}
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Price (IDR)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="0"
                          value={
                            field.value === 0
                              ? ""
                              : new Intl.NumberFormat("en-US").format(field.value)
                          }
                          onChange={(e) => {
                            const value = e.target.value.replace(/,/g, "");
                            if (value === "" || /^\d+$/.test(value)) {
                              field.onChange(value === "" ? 0 : parseInt(value));
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* --- Translations Tabs --- */}
              <Tabs defaultValue="en" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="en">English (Default)</TabsTrigger>
                  <TabsTrigger value="id">Indonesia</TabsTrigger>
                </TabsList>

                <TabsContent value="en">
                  <div className="rounded-md border bg-slate-50/50 px-4">
                    <TranslationFields lang="en" control={form.control} register={form.register} />
                  </div>
                </TabsContent>

                <TabsContent value="id">
                  <div className="rounded-md border bg-slate-50/50 px-4">
                    <TranslationFields lang="id" control={form.control} register={form.register} />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="bg-background sticky bottom-0 z-10 flex justify-end gap-3 border-t px-6 py-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">{service ? "Update Service" : "Create Service"}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
