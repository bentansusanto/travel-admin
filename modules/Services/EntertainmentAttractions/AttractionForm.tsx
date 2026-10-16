"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  AttractionItem,
  CreateEntertainmentPayload,
  useCreateEntertainmentMutation,
  useFindAllEntertainmentCategoriesQuery,
  useFindAllLocationsQuery,
  useUpdateEntertainmentMutation
} from "@/store/services/entertainment.service";
import {
  IconArrowLeft,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconPhoto,
  IconPlus,
  IconSelector,
  IconSparkles,
  IconTicket,
  IconTrash
} from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";

interface AttractionFormProps {
  initialData?: AttractionItem | null;
  isEdit?: boolean;
}

export default function AttractionForm({ initialData, isEdit = false }: AttractionFormProps) {
  const router = useRouter();

  const [createEntertainment, { isLoading: isCreating }] = useCreateEntertainmentMutation();
  const [updateEntertainment, { isLoading: isUpdating }] = useUpdateEntertainmentMutation();
  const isSubmitting = isCreating || isUpdating;

  const { data: categoriesData } = useFindAllEntertainmentCategoriesQuery();
  const { data: locationsData } = useFindAllLocationsQuery();

  const [openLocationCombobox, setOpenLocationCombobox] = useState(false);

  // Form State initialized directly
  const [stateId, setStateId] = useState<string>(() => initialData?.state_id || "");
  const [cityId, setCityId] = useState<string>(() => initialData?.city_id || "");
  const [categoryDestinationId, setCategoryDestinationId] = useState<string>(
    () =>
      initialData?.category_destination_id ||
      (initialData as any)?.category_destination?.id ||
      initialData?.category_id ||
      ""
  );
  const [price, setPrice] = useState<number | string>(() =>
    initialData?.price != null ? initialData.price : ""
  );
  const [thumbnail, setThumbnail] = useState<string>(() => initialData?.thumbnail || "");
  const [images, setImages] = useState<string[]>(() =>
    initialData?.images && initialData.images.length > 0 ? initialData.images : [""]
  );
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  const validGalleryImages = useMemo(() => {
    return images.filter((img) => img && img.trim() !== "");
  }, [images]);

  // Translation State (EN, ID, TR)
  const [activeLangTab, setActiveLangTab] = useState<"en" | "id" | "tr">("en");

  const enTransInitial = initialData?.translations?.find((t) => t.language_code === "en");
  const idTransInitial = initialData?.translations?.find((t) => t.language_code === "id");
  const trTransInitial = initialData?.translations?.find((t) => t.language_code === "tr");

  const [enName, setEnName] = useState<string>(
    () => enTransInitial?.name || initialData?.name || ""
  );
  const [enDescription, setEnDescription] = useState<string>(
    () => enTransInitial?.description || initialData?.description || ""
  );
  const [enDetailTour, setEnDetailTour] = useState<string[]>(
    () => enTransInitial?.detail_tour || initialData?.highlights || [""]
  );
  const [enFacilities, setEnFacilities] = useState<string[]>(
    () => enTransInitial?.facilities || initialData?.facilities || [""]
  );

  const [idName, setIdName] = useState<string>(() => idTransInitial?.name || "");
  const [idDescription, setIdDescription] = useState<string>(
    () => idTransInitial?.description || ""
  );
  const [idDetailTour, setIdDetailTour] = useState<string[]>(
    () => idTransInitial?.detail_tour || [""]
  );
  const [idFacilities, setIdFacilities] = useState<string[]>(
    () => idTransInitial?.facilities || [""]
  );

  const [trName, setTrName] = useState<string>(() => trTransInitial?.name || "");
  const [trDescription, setTrDescription] = useState<string>(
    () => trTransInitial?.description || ""
  );
  const [trDetailTour, setTrDetailTour] = useState<string[]>(
    () => trTransInitial?.detail_tour || [""]
  );
  const [trFacilities, setTrFacilities] = useState<string[]>(
    () => trTransInitial?.facilities || [""]
  );

  const categories = useMemo(() => {
    return categoriesData?.data || (categoriesData as any)?.datas || [];
  }, [categoriesData]);

  const countriesList = useMemo(() => {
    return locationsData?.data || [];
  }, [locationsData]);

  // Derive human-readable location label
  const selectedLocationLabel = useMemo(() => {
    if (initialData?.location && !stateId) return initialData.location;
    for (const c of countriesList) {
      const foundState = c.states?.find((s: any) => s.id === stateId);
      if (foundState) {
        return `${foundState.name}, ${c.name}`;
      }
    }
    return stateId ? "Selected State" : "Select Attraction Location";
  }, [countriesList, stateId, initialData]);

  // Image helpers
  const handleAddImage = () => setImages([...images, ""]);
  const handleRemoveImage = (index: number) => {
    if (images.length === 1) {
      setImages([""]);
    } else {
      setImages(images.filter((_, i) => i !== index));
    }
  };
  const handleImageChange = (index: number, val: string) => {
    const updated = [...images];
    updated[index] = val;
    setImages(updated);
  };

  // Highlights helpers
  const handleAddDetail = (lang: "en" | "id" | "tr") => {
    if (lang === "en") setEnDetailTour([...enDetailTour, ""]);
    else if (lang === "id") setIdDetailTour([...idDetailTour, ""]);
    else setTrDetailTour([...trDetailTour, ""]);
  };
  const handleRemoveDetail = (lang: "en" | "id" | "tr", index: number) => {
    if (lang === "en") {
      setEnDetailTour(
        enDetailTour.length === 1 ? [""] : enDetailTour.filter((_, i) => i !== index)
      );
    } else if (lang === "id") {
      setIdDetailTour(
        idDetailTour.length === 1 ? [""] : idDetailTour.filter((_, i) => i !== index)
      );
    } else {
      setTrDetailTour(
        trDetailTour.length === 1 ? [""] : trDetailTour.filter((_, i) => i !== index)
      );
    }
  };
  const handleDetailChange = (lang: "en" | "id" | "tr", index: number, val: string) => {
    if (lang === "en") {
      const updated = [...enDetailTour];
      updated[index] = val;
      setEnDetailTour(updated);
    } else if (lang === "id") {
      const updated = [...idDetailTour];
      updated[index] = val;
      setIdDetailTour(updated);
    } else {
      const updated = [...trDetailTour];
      updated[index] = val;
      setTrDetailTour(updated);
    }
  };

  // Facilities / Inclusions helpers
  const handleAddFacility = (lang: "en" | "id" | "tr") => {
    if (lang === "en") setEnFacilities([...enFacilities, ""]);
    else if (lang === "id") setIdFacilities([...idFacilities, ""]);
    else setTrFacilities([...trFacilities, ""]);
  };
  const handleRemoveFacility = (lang: "en" | "id" | "tr", index: number) => {
    if (lang === "en") {
      setEnFacilities(
        enFacilities.length === 1 ? [""] : enFacilities.filter((_, i) => i !== index)
      );
    } else if (lang === "id") {
      setIdFacilities(
        idFacilities.length === 1 ? [""] : idFacilities.filter((_, i) => i !== index)
      );
    } else {
      setTrFacilities(
        trFacilities.length === 1 ? [""] : trFacilities.filter((_, i) => i !== index)
      );
    }
  };
  const handleFacilityChange = (lang: "en" | "id" | "tr", index: number, val: string) => {
    if (lang === "en") {
      const updated = [...enFacilities];
      updated[index] = val;
      setEnFacilities(updated);
    } else if (lang === "id") {
      const updated = [...idFacilities];
      updated[index] = val;
      setIdFacilities(updated);
    } else {
      const updated = [...trFacilities];
      updated[index] = val;
      setTrFacilities(updated);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stateId) {
      toast.error("Please select a location / state for this attraction");
      return;
    }
    if (!categoryDestinationId) {
      toast.error("Please select an attraction category");
      return;
    }
    if (!enName.trim() && !idName.trim() && !trName.trim()) {
      toast.error("Please provide at least an attraction title in English, Indonesian, or Turkish");
      return;
    }

    const numPrice = Number(price) || 0;
    if (numPrice <= 0) {
      toast.error("Ticket price (USD) must be greater than zero");
      return;
    }

    const cleanedImages = images.filter((img) => img.trim() !== "");
    const cleanedEnDetail = enDetailTour.filter((d) => d.trim() !== "");
    const cleanedEnFacilities = enFacilities.filter((f) => f.trim() !== "");
    const cleanedIdDetail = idDetailTour.filter((d) => d.trim() !== "");
    const cleanedIdFacilities = idFacilities.filter((f) => f.trim() !== "");
    const cleanedTrDetail = trDetailTour.filter((d) => d.trim() !== "");
    const cleanedTrFacilities = trFacilities.filter((f) => f.trim() !== "");

    const translations: any[] = [];

    // EN Translation
    if (enName.trim()) {
      translations.push({
        language_code: "en",
        name: enName.trim(),
        description: enDescription.trim(),
        detail_tour: cleanedEnDetail,
        facilities: cleanedEnFacilities
      });
    }

    // ID Translation
    if (idName.trim()) {
      translations.push({
        language_code: "id",
        name: idName.trim(),
        description: idDescription.trim(),
        detail_tour: cleanedIdDetail,
        facilities: cleanedIdFacilities
      });
    }

    // TR Translation
    if (trName.trim()) {
      translations.push({
        language_code: "tr",
        name: trName.trim(),
        description: trDescription.trim(),
        detail_tour: cleanedTrDetail,
        facilities: cleanedTrFacilities
      });
    }

    const payload: CreateEntertainmentPayload = {
      state_id: stateId,
      city_id: cityId || undefined,
      category_destination_id: categoryDestinationId,
      price: numPrice,
      thumbnail: thumbnail.trim() || undefined,
      images: cleanedImages,
      translations
    };

    try {
      if (isEdit && initialData?.id) {
        await updateEntertainment({ id: initialData.id, data: payload }).unwrap();
        toast.success("Attraction updated successfully");
      } else {
        await createEntertainment(payload).unwrap();
        toast.success("Attraction created successfully");
      }
      router.push("/dashboard/services/entertainment-attractions");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save attraction");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-12">
      {/* 1. Header Action Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-3">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            asChild
            className="size-8.5 rounded-lg border-slate-200 bg-white text-slate-600 shadow-2xs hover:bg-slate-50">
            <Link href="/dashboard/services/entertainment-attractions">
              <IconArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-wider text-blue-600 uppercase">
                Attractions & Entertainment
              </span>
              <Badge
                variant="outline"
                className="border-blue-200 bg-blue-50 text-[10px] font-semibold text-blue-700">
                {isEdit ? "Update Mode" : "New Package"}
              </Badge>
            </div>
            <h1 className="text-lg leading-tight font-bold text-slate-900">
              {isEdit ? `Edit: ${enName || "Attraction"}` : "Create New Attraction"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            asChild
            className="h-8.5 border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50">
            <Link href="/dashboard/services/entertainment-attractions">Cancel</Link>
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting}
            className="h-8.5 min-w-32.5 gap-1.5 bg-blue-600 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md">
            {isSubmitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <IconCheck className="size-4" />
                <span>{isEdit ? "Save Changes" : "Publish Attraction"}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 2. Main Grid Layout */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Left Column: General Details & Media (5 cols) */}
        <div className="space-y-5 lg:col-span-5">
          {/* Card 1: General Details */}
          <Card className="gap-0 overflow-hidden border-slate-200/80 bg-white py-0 shadow-xs">
            <CardHeader className="flex items-center gap-2 border-b border-slate-100 px-5 py-3.5 [.border-b]:pb-3.5">
              <div className="flex size-7 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                <IconTicket className="size-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">
                  General Information
                </CardTitle>
                <CardDescription className="text-[11px] text-slate-500">
                  Configure location, category, and ticket pricing.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3.5 p-5">
              {/* Location Combobox */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                  Location / State <span className="text-rose-500">*</span>
                </Label>
                <Popover open={openLocationCombobox} onOpenChange={setOpenLocationCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openLocationCombobox}
                      className={cn(
                        "h-9 w-full justify-between border-slate-200 bg-slate-50/50 text-xs font-normal",
                        !stateId && "text-slate-400"
                      )}>
                      <span className="truncate">{selectedLocationLabel}</span>
                      <IconSelector className="ml-1 size-4 shrink-0 text-slate-400" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[320px] p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Search state or region..."
                        className="h-8.5 text-xs"
                      />
                      <CommandList className="max-h-60 overflow-y-auto">
                        <CommandEmpty className="py-2 text-center text-xs text-slate-500">
                          No location found.
                        </CommandEmpty>
                        {countriesList.map((country: any) => (
                          <CommandGroup
                            key={country.id}
                            heading={country.name}
                            className="p-1 **:[[cmdk-group-heading]]:text-[10px] **:[[cmdk-group-heading]]:font-bold **:[[cmdk-group-heading]]:tracking-wider **:[[cmdk-group-heading]]:text-slate-500 **:[[cmdk-group-heading]]:uppercase">
                            {country.states?.map((state: any) => (
                              <CommandItem
                                key={state.id}
                                value={`${state.name}, ${country.name}`}
                                onSelect={() => {
                                  setStateId(state.id);
                                  setOpenLocationCombobox(false);
                                }}
                                className="cursor-pointer py-1.5 text-xs font-normal text-slate-700 hover:text-slate-900">
                                <IconCheck
                                  className={cn(
                                    "mr-2 size-3.5",
                                    state.id === stateId ? "text-blue-600 opacity-100" : "opacity-0"
                                  )}
                                />
                                <span className="font-normal text-slate-700">{state.name}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        ))}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Category Select */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                  Category <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={categoryDestinationId || ""}
                  onValueChange={setCategoryDestinationId}>
                  <SelectTrigger className="h-9 border-slate-200 bg-slate-50/50 text-xs">
                    <SelectValue placeholder="Select Category">
                      {categories.find((c: any) => c.id === categoryDestinationId)?.name ||
                        (initialData as any)?.category_destination_name ||
                        (initialData as any)?.category ||
                        "Select Category"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id} className="text-xs">
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Ticket Price (USD) */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                  Ticket Price (USD) <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute top-1/2 left-3 -translate-y-1/2 text-xs font-bold text-slate-400">
                    $
                  </span>
                  <Input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="h-9 border-slate-200 bg-slate-50/50 pl-8 font-mono text-xs font-bold focus-visible:ring-blue-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Visuals & Media */}
          <Card className="gap-0 overflow-hidden border-slate-200/80 bg-white py-0 shadow-xs">
            <CardHeader className="flex items-center gap-2 border-b border-slate-100 px-5 py-3.5 [.border-b]:pb-3.5">
              <div className="flex size-7 items-center justify-center rounded-md bg-amber-50 text-amber-600">
                <IconPhoto className="size-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">Media & Visuals</CardTitle>
                <CardDescription className="text-[11px] text-slate-500">
                  Primary attraction thumbnail and photo gallery URLs.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3.5 p-5">
              {/* Primary Thumbnail */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">
                  Primary Thumbnail URL
                </Label>
                <Input
                  placeholder="https://images.unsplash.com/..."
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  className="h-9 border-slate-200 bg-slate-50/50 text-xs focus-visible:ring-blue-500"
                />
                {thumbnail && (
                  <div className="relative mt-2 aspect-video w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-2xs">
                    <img
                      src={thumbnail}
                      alt="Thumbnail Preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='88' viewBox='0 0 120 88'%3E%3Crect width='120' height='88' fill='%23f1f5f9'/%3E%3Cpath d='M44 38a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-16 26h64L74 42l-14 18-10-12-22 26z' fill='%23cbd5e1'/%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Gallery Images */}
              <div className="space-y-2 border-t border-slate-100 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-slate-700">Gallery Media</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddImage}
                    className="h-7 gap-1 border-blue-200 text-[11px] font-semibold text-blue-600 hover:bg-blue-50">
                    <IconPlus className="size-3" /> Add Image
                  </Button>
                </div>

                <div className="space-y-2">
                  {images.map((imgUrl, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        placeholder="https://images.unsplash.com/..."
                        value={imgUrl}
                        onChange={(e) => handleImageChange(idx, e.target.value)}
                        className="h-8.5 border-slate-200 bg-slate-50/50 text-xs"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveImage(idx)}
                        disabled={images.length === 1 && !imgUrl}
                        className="size-8.5 shrink-0 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                        <IconTrash className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Gallery Carousel / Strip Preview */}
                {validGalleryImages.length > 0 && (
                  <div className="border-t border-slate-100 pt-3">
                    <div className="relative mb-2 aspect-video w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-2xs">
                      <img
                        src={validGalleryImages[activeGalleryIndex] || validGalleryImages[0]}
                        alt="Gallery preview"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='88' viewBox='0 0 120 88'%3E%3Crect width='120' height='88' fill='%23f1f5f9'/%3E%3Cpath d='M44 38a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-16 26h64L74 42l-14 18-10-12-22 26z' fill='%23cbd5e1'/%3E%3C/svg%3E";
                        }}
                      />
                      {validGalleryImages.length > 1 && (
                        <div className="absolute inset-0 flex items-center justify-between p-2">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveGalleryIndex((prev) =>
                                prev === 0 ? validGalleryImages.length - 1 : prev - 1
                              )
                            }
                            className="flex size-7 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80">
                            <IconChevronLeft className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setActiveGalleryIndex((prev) =>
                                prev === validGalleryImages.length - 1 ? 0 : prev + 1
                              )
                            }
                            className="flex size-7 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80">
                            <IconChevronRight className="size-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    {/* Thumbnail Strip */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      {validGalleryImages.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveGalleryIndex(idx)}
                          className={cn(
                            "relative size-12 shrink-0 overflow-hidden rounded-md border-2 transition-all",
                            activeGalleryIndex === idx
                              ? "border-blue-600 ring-2 ring-blue-100"
                              : "border-slate-200 opacity-70 hover:opacity-100"
                          )}>
                          <img src={img} alt="thumbnail" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Multilingual Content & Inclusions (7 cols) */}
        <div className="space-y-5 lg:col-span-7">
          <Card className="gap-0 overflow-hidden border-slate-200/80 bg-white py-0 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 px-5 py-3.5 [.border-b]:pb-3.5">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-md bg-purple-50 text-purple-600">
                  <IconSparkles className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">
                    Multilingual Content & Features
                  </CardTitle>
                  <CardDescription className="text-[11px] text-slate-500">
                    Localized attraction description, highlights, and inclusions.
                  </CardDescription>
                </div>
              </div>

              {/* Language Selector Tabs */}
              <Tabs
                value={activeLangTab}
                onValueChange={(val: any) => setActiveLangTab(val)}
                className="w-auto">
                <TabsList className="h-8 border border-slate-200/80 bg-slate-100 p-0.5">
                  <TabsTrigger
                    value="en"
                    className="rounded-md px-2.5 py-0.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-2xs">
                    English (EN)
                  </TabsTrigger>
                  <TabsTrigger
                    value="id"
                    className="rounded-md px-2.5 py-0.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-2xs">
                    Indonesia (ID)
                  </TabsTrigger>
                  <TabsTrigger
                    value="tr"
                    className="rounded-md px-2.5 py-0.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-2xs">
                    Turkish (TR)
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              {/* ENGLISH TAB */}
              {activeLangTab === "en" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                      Attraction Name (English) <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      placeholder="e.g. Waterbom Bali Day Pass"
                      value={enName}
                      onChange={(e) => setEnName(e.target.value)}
                      className="h-9 border-slate-200 bg-slate-50/50 text-xs focus-visible:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      Description (English)
                    </Label>
                    <Textarea
                      rows={4}
                      placeholder="Write an engaging overview of this attraction..."
                      value={enDescription}
                      onChange={(e) => setEnDescription(e.target.value)}
                      className="border-slate-200 bg-slate-50/50 text-xs leading-relaxed focus-visible:ring-blue-500"
                    />
                  </div>

                  {/* Highlights (detail_tour) */}
                  <div className="space-y-2 border-t border-slate-100 pt-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-slate-700">
                        Attraction Highlights & Key Features (EN)
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddDetail("en")}
                        className="h-7 gap-1 border-blue-200 text-[11px] font-semibold text-blue-600 hover:bg-blue-50">
                        <IconPlus className="size-3" /> Add Highlight
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {enDetailTour.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Input
                            placeholder="e.g. Climax Super Slide & FlowRider"
                            value={item}
                            onChange={(e) => handleDetailChange("en", idx, e.target.value)}
                            className="h-8.5 border-slate-200 bg-slate-50/50 text-xs"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveDetail("en", idx)}
                            disabled={enDetailTour.length === 1 && !item}
                            className="size-8.5 shrink-0 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                            <IconTrash className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Inclusions / Facilities */}
                  <div className="space-y-2 border-t border-slate-100 pt-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-slate-700">
                        Ticket Inclusions & Facilities (EN)
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddFacility("en")}
                        className="h-7 gap-1 border-blue-200 text-[11px] font-semibold text-blue-600 hover:bg-blue-50">
                        <IconPlus className="size-3" /> Add Inclusion
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {enFacilities.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Input
                            placeholder="e.g. Full Day Pass, Locker Access Voucher"
                            value={item}
                            onChange={(e) => handleFacilityChange("en", idx, e.target.value)}
                            className="h-8.5 border-slate-200 bg-slate-50/50 text-xs"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveFacility("en", idx)}
                            disabled={enFacilities.length === 1 && !item}
                            className="size-8.5 shrink-0 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                            <IconTrash className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* INDONESIAN TAB */}
              {activeLangTab === "id" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      Nama Atraksi (Bahasa Indonesia)
                    </Label>
                    <Input
                      placeholder="contoh: Tiket Masuk Seharian Waterbom Bali"
                      value={idName}
                      onChange={(e) => setIdName(e.target.value)}
                      className="h-9 border-slate-200 bg-slate-50/50 text-xs focus-visible:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      Deskripsi Lengkap (Bahasa Indonesia)
                    </Label>
                    <Textarea
                      rows={4}
                      placeholder="Tulis deskripsi menarik tentang atraksi ini..."
                      value={idDescription}
                      onChange={(e) => setIdDescription(e.target.value)}
                      className="border-slate-200 bg-slate-50/50 text-xs leading-relaxed focus-visible:ring-blue-500"
                    />
                  </div>

                  {/* Highlights (ID) */}
                  <div className="space-y-2 border-t border-slate-100 pt-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-slate-700">
                        Sorotan Utama Atraksi (ID)
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddDetail("id")}
                        className="h-7 gap-1 border-blue-200 text-[11px] font-semibold text-blue-600 hover:bg-blue-50">
                        <IconPlus className="size-3" /> Tambah Sorotan
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {idDetailTour.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Input
                            placeholder="contoh: Wahana Seluncur Climax Ekstrem"
                            value={item}
                            onChange={(e) => handleDetailChange("id", idx, e.target.value)}
                            className="h-8.5 border-slate-200 bg-slate-50/50 text-xs"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveDetail("id", idx)}
                            disabled={idDetailTour.length === 1 && !item}
                            className="size-8.5 shrink-0 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                            <IconTrash className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Facilities (ID) */}
                  <div className="space-y-2 border-t border-slate-100 pt-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-slate-700">
                        Fasilitas & Tiket Termasuk (ID)
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddFacility("id")}
                        className="h-7 gap-1 border-blue-200 text-[11px] font-semibold text-blue-600 hover:bg-blue-50">
                        <IconPlus className="size-3" /> Tambah Fasilitas
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {idFacilities.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Input
                            placeholder="contoh: Tiket Masuk Seharian, Voucher Loker"
                            value={item}
                            onChange={(e) => handleFacilityChange("id", idx, e.target.value)}
                            className="h-8.5 border-slate-200 bg-slate-50/50 text-xs"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveFacility("id", idx)}
                            disabled={idFacilities.length === 1 && !item}
                            className="size-8.5 shrink-0 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                            <IconTrash className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TURKISH TAB */}
              {activeLangTab === "tr" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      Gezilecek Yer / Etkinlik Adı (Türkçe)
                    </Label>
                    <Input
                      placeholder="örneğin: Waterbom Bali Günlük Bilet"
                      value={trName}
                      onChange={(e) => setTrName(e.target.value)}
                      className="h-9 border-slate-200 bg-slate-50/50 text-xs focus-visible:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      Açıklama (Türkçe)
                    </Label>
                    <Textarea
                      rows={4}
                      placeholder="Bu cazibe merkezi hakkında detaylı açıklama yazın..."
                      value={trDescription}
                      onChange={(e) => setTrDescription(e.target.value)}
                      className="border-slate-200 bg-slate-50/50 text-xs leading-relaxed focus-visible:ring-blue-500"
                    />
                  </div>

                  {/* Highlights (TR) */}
                  <div className="space-y-2 border-t border-slate-100 pt-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-slate-700">
                        Öne Çıkan Özellikler (TR)
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddDetail("tr")}
                        className="h-7 gap-1 border-blue-200 text-[11px] font-semibold text-blue-600 hover:bg-blue-50">
                        <IconPlus className="size-3" /> Özellik Ekle
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {trDetailTour.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Input
                            placeholder="örneğin: Climax Kaydırağı ve Tembel Nehir"
                            value={item}
                            onChange={(e) => handleDetailChange("tr", idx, e.target.value)}
                            className="h-8.5 border-slate-200 bg-slate-50/50 text-xs"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveDetail("tr", idx)}
                            disabled={trDetailTour.length === 1 && !item}
                            className="size-8.5 shrink-0 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                            <IconTrash className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Facilities (TR) */}
                  <div className="space-y-2 border-t border-slate-100 pt-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-slate-700">
                        Dahil Olan Hizmetler & Olanaklar (TR)
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddFacility("tr")}
                        className="h-7 gap-1 border-blue-200 text-[11px] font-semibold text-blue-600 hover:bg-blue-50">
                        <IconPlus className="size-3" /> Hizmet Ekle
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {trFacilities.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Input
                            placeholder="örneğin: Tam Gün Giriş Bileti, Dolap Kullanımı"
                            value={item}
                            onChange={(e) => handleFacilityChange("tr", idx, e.target.value)}
                            className="h-8.5 border-slate-200 bg-slate-50/50 text-xs"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveFacility("tr", idx)}
                            disabled={trFacilities.length === 1 && !item}
                            className="size-8.5 shrink-0 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                            <IconTrash className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
