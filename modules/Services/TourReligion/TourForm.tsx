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
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Destination,
  useCreateDestinationMutation,
  useFindAllCategoryDestinationsQuery,
  useFindAllCountriesQuery,
  useUpdateDestinationMutation,
} from "@/store/services/destination.service";
import {
  IconArrowLeft,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconCompass,
  IconCurrencyDollar,
  IconInfoCircle,
  IconMapPin,
  IconPhoto,
  IconPlus,
  IconSelector,
  IconSparkles,
  IconTrash,
} from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface TourFormProps {
  initialData?: Destination | null;
  isEdit?: boolean;
}

export default function TourForm({ initialData, isEdit = false }: TourFormProps) {
  const router = useRouter();

  const [createDestination, { isLoading: isCreating }] = useCreateDestinationMutation();
  const [updateDestination, { isLoading: isUpdating }] = useUpdateDestinationMutation();
  const isSubmitting = isCreating || isUpdating;

  const { data: countriesData } = useFindAllCountriesQuery();
  const { data: categoriesData } = useFindAllCategoryDestinationsQuery();

  const [openLocationCombobox, setOpenLocationCombobox] = useState(false);

  // Form State
  const [stateId, setStateId] = useState("");
  const [categoryDestinationId, setCategoryDestinationId] = useState("");
  const [price, setPrice] = useState<number | string>("");
  const [thumbnail, setThumbnail] = useState("");
  const [images, setImages] = useState<string[]>([""]);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  const validGalleryImages = React.useMemo(() => {
    return images.filter((img) => img && img.trim() !== "");
  }, [images]);

  // Translation State (EN, ID, TR)
  const [activeLangTab, setActiveLangTab] = useState<"en" | "id" | "tr">("en");

  const [enName, setEnName] = useState("");
  const [enDescription, setEnDescription] = useState("");
  const [enDetailTour, setEnDetailTour] = useState<string[]>([""]);
  const [enFacilities, setEnFacilities] = useState<string[]>([""]);

  const [idName, setIdName] = useState("");
  const [idDescription, setIdDescription] = useState("");
  const [idDetailTour, setIdDetailTour] = useState<string[]>([""]);
  const [idFacilities, setIdFacilities] = useState<string[]>([""]);

  const [trName, setTrName] = useState("");
  const [trDescription, setTrDescription] = useState("");
  const [trDetailTour, setTrDetailTour] = useState<string[]>([""]);
  const [trFacilities, setTrFacilities] = useState<string[]>([""]);

  const categories = React.useMemo(() => {
    return categoriesData?.data || (categoriesData as any)?.datas || [];
  }, [categoriesData]);

  // Populate data when editing
  useEffect(() => {
    if (initialData) {
      const initialStId =
        initialData.state_id ||
        (initialData as any)?.state?.id ||
        "";
      if (initialStId) setStateId(initialStId);

      const initialCatId =
        initialData.category_destination_id ||
        (initialData as any)?.category_destination?.id ||
        (initialData as any)?.category_id ||
        "";
      if (initialCatId) {
        setCategoryDestinationId(initialCatId);
      } else if (categories.length > 0 && ((initialData as any)?.category || (initialData as any)?.category_destination_name)) {
        const catName = ((initialData as any)?.category || (initialData as any)?.category_destination_name)?.toLowerCase();
        const found = categories.find((c: any) => c.name?.toLowerCase() === catName);
        if (found) setCategoryDestinationId(found.id);
      }

      setPrice(initialData.price != null ? initialData.price : "");
      setThumbnail(initialData.thumbnail || "");
      setImages(
        initialData.images && initialData.images.length > 0
          ? initialData.images
          : [""]
      );

      const translations = initialData.translations || [];
      const enTrans = translations.find((t) => t.language_code === "en");
      const idTrans = translations.find((t) => t.language_code === "id");
      const trTrans = translations.find((t) => t.language_code === "tr");

      if (enTrans) {
        setEnName(enTrans.name || "");
        setEnDescription(enTrans.description || "");
        setEnDetailTour(
          enTrans.detail_tour && enTrans.detail_tour.length > 0
            ? enTrans.detail_tour
            : [""]
        );
        setEnFacilities(
          enTrans.facilities && enTrans.facilities.length > 0
            ? enTrans.facilities
            : [""]
        );
      }

      if (idTrans) {
        setIdName(idTrans.name || "");
        setIdDescription(idTrans.description || "");
        setIdDetailTour(
          idTrans.detail_tour && idTrans.detail_tour.length > 0
            ? idTrans.detail_tour
            : [""]
        );
        setIdFacilities(
          idTrans.facilities && idTrans.facilities.length > 0
            ? idTrans.facilities
            : [""]
        );
      }

      if (trTrans) {
        setTrName(trTrans.name || "");
        setTrDescription(trTrans.description || "");
        setTrDetailTour(
          trTrans.detail_tour && trTrans.detail_tour.length > 0
            ? trTrans.detail_tour
            : [""]
        );
        setTrFacilities(
          trTrans.facilities && trTrans.facilities.length > 0
            ? trTrans.facilities
            : [""]
        );
      }
    }
  }, [initialData, categories]);

  const countriesList = React.useMemo(() => {
    const raw = countriesData?.data || (countriesData as any)?.datas || [];
    return raw.map((c: any) => ({
      ...c,
      states: c.states || c.cities || [],
    }));
  }, [countriesData]);

  // Handle location label with initialData fallback
  const selectedLocationLabel = React.useMemo(() => {
    if (stateId && countriesList.length > 0) {
      for (const country of countriesList) {
        const state = country.states?.find((s: any) => s.id === stateId);
        if (state) {
          return `${state.name}, ${country.name}`;
        }
      }
    }
    if (initialData?.location) {
      return initialData.location;
    }
    return "Select destination state / city";
  }, [stateId, countriesList, initialData]);

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

  // Itinerary helpers
  const handleAddDetail = (lang: "en" | "id" | "tr") => {
    if (lang === "en") setEnDetailTour([...enDetailTour, ""]);
    else if (lang === "id") setIdDetailTour([...idDetailTour, ""]);
    else setTrDetailTour([...trDetailTour, ""]);
  };
  const handleRemoveDetail = (lang: "en" | "id" | "tr", index: number) => {
    if (lang === "en") {
      setEnDetailTour(enDetailTour.length === 1 ? [""] : enDetailTour.filter((_, i) => i !== index));
    } else if (lang === "id") {
      setIdDetailTour(idDetailTour.length === 1 ? [""] : idDetailTour.filter((_, i) => i !== index));
    } else {
      setTrDetailTour(trDetailTour.length === 1 ? [""] : trDetailTour.filter((_, i) => i !== index));
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

  // Facilities helpers
  const handleAddFacility = (lang: "en" | "id" | "tr") => {
    if (lang === "en") setEnFacilities([...enFacilities, ""]);
    else if (lang === "id") setIdFacilities([...idFacilities, ""]);
    else setTrFacilities([...trFacilities, ""]);
  };
  const handleRemoveFacility = (lang: "en" | "id" | "tr", index: number) => {
    if (lang === "en") {
      setEnFacilities(enFacilities.length === 1 ? [""] : enFacilities.filter((_, i) => i !== index));
    } else if (lang === "id") {
      setIdFacilities(idFacilities.length === 1 ? [""] : idFacilities.filter((_, i) => i !== index));
    } else {
      setTrFacilities(trFacilities.length === 1 ? [""] : trFacilities.filter((_, i) => i !== index));
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
      toast.error("Please select a destination location/state");
      return;
    }
    if (!categoryDestinationId) {
      toast.error("Please select a destination category");
      return;
    }
    if (!enName.trim() && !idName.trim() && !trName.trim()) {
      toast.error("Please provide at least a package name in English, Indonesian, or Turkish");
      return;
    }

    const numPrice = Number(price) || 0;
    if (numPrice <= 0) {
      toast.error("Base price (USD) must be greater than zero");
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
        facilities: cleanedEnFacilities,
      });
    }

    // ID Translation
    if (idName.trim()) {
      translations.push({
        language_code: "id",
        name: idName.trim(),
        description: idDescription.trim(),
        detail_tour: cleanedIdDetail,
        facilities: cleanedIdFacilities,
      });
    }

    // TR Translation
    if (trName.trim()) {
      translations.push({
        language_code: "tr",
        name: trName.trim(),
        description: trDescription.trim(),
        detail_tour: cleanedTrDetail,
        facilities: cleanedTrFacilities,
      });
    }

    const payload = {
      state_id: stateId,
      category_destination_id: categoryDestinationId,
      price: numPrice,
      thumbnail: thumbnail.trim() || undefined,
      images: cleanedImages,
      translations,
    };

    try {
      if (isEdit && initialData?.id) {
        await updateDestination({ id: initialData.id, data: payload }).unwrap();
        toast.success("Tour package updated successfully");
      } else {
        await createDestination(payload).unwrap();
        toast.success("Tour package created successfully");
      }
      router.push("/dashboard/services/tour-religion");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save tour package");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-12">
      {/* 1. Header Action Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-3.5 sm:px-5 sm:py-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            asChild
            className="size-8.5 rounded-lg border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-2xs">
            <Link href="/dashboard/services/tour-religion">
              <IconArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                Tour Management
              </span>
              <Badge
                variant="outline"
                className={`text-[10px] font-semibold px-2 py-0.5 ${
                  isEdit
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}>
                {isEdit ? "Update Mode" : "New Package"}
              </Badge>
            </div>
            <h1 className="text-xl font-bold text-slate-900 leading-snug pt-0.5">
              {isEdit ? `Edit Tour Package: ${enName || idName || "Details"}` : "Create New Tour Package"}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            asChild
            className="h-8.5 text-xs font-semibold text-slate-700 border-slate-200 bg-white hover:bg-slate-50">
            <Link href="/dashboard/services/tour-religion">Cancel</Link>
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting}
            className="h-8.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold gap-1.5 shadow-sm hover:shadow-md transition-all min-w-[130px]">
            {isSubmitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <IconCheck className="size-4" />
                <span>{isEdit ? "Save Changes" : "Publish Tour Package"}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 2. Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: General Details & Media (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Card 1: General Details */}
          <Card className="border-slate-200/80 shadow-xs bg-white py-0 gap-0 overflow-hidden">
            <CardHeader className="px-5 py-3.5 border-b border-slate-100 [.border-b]:pb-3.5 flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                <IconCompass className="size-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">General Information</CardTitle>
                <CardDescription className="text-[11px] text-slate-500">
                  Configure destination location, category, and pricing.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-3.5">
              {/* Location Combobox */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  Location / State <span className="text-rose-500">*</span>
                </Label>
                <Popover open={openLocationCombobox} onOpenChange={setOpenLocationCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openLocationCombobox}
                      className={cn(
                        "w-full h-9 justify-between text-xs font-normal bg-slate-50/50 border-slate-200",
                        !stateId && "text-slate-400"
                      )}>
                      <span className="truncate">{selectedLocationLabel}</span>
                      <IconSelector className="size-4 text-slate-400 shrink-0 ml-1" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[320px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search state or city..." className="h-8.5 text-xs" />
                      <CommandList className="max-h-60 overflow-y-auto">
                        <CommandEmpty className="py-2 text-center text-xs text-slate-500">No location found.</CommandEmpty>
                        {countriesList.map((country: any) => (
                          <CommandGroup
                            key={country.id}
                            heading={country.name}
                            className="p-1 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:text-slate-500 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider">
                            {country.states?.map((state: any) => (
                              <CommandItem
                                key={state.id}
                                value={`${state.name}, ${country.name}`}
                                onSelect={() => {
                                  setStateId(state.id);
                                  setOpenLocationCombobox(false);
                                }}
                                className="cursor-pointer text-xs font-normal text-slate-700 hover:text-slate-900 py-1.5">
                                <IconCheck
                                  className={cn(
                                    "mr-2 size-3.5",
                                    state.id === stateId ? "opacity-100 text-blue-600" : "opacity-0"
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
                <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  Category <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={categoryDestinationId || ""}
                  onValueChange={setCategoryDestinationId}>
                  <SelectTrigger className="h-9 text-xs bg-slate-50/50 border-slate-200">
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

              {/* Base Price (USD) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  Base Price (USD) <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">$</span>
                  <Input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="pl-8 h-9 text-xs font-mono font-bold bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Visuals & Media */}
          <Card className="border-slate-200/80 shadow-xs bg-white py-0 gap-0 overflow-hidden">
            <CardHeader className="px-5 py-3.5 border-b border-slate-100 [.border-b]:pb-3.5 flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-amber-50 text-amber-600">
                <IconPhoto className="size-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">Media & Visuals</CardTitle>
                <CardDescription className="text-[11px] text-slate-500">
                  Primary thumbnail and destination photo gallery URLs.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-3.5">
              {/* Primary Thumbnail */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Primary Thumbnail URL</Label>
                <Input
                  placeholder="https://images.unsplash.com/..."
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  className="h-9 text-xs bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500"
                />
                {thumbnail && (
                  <div className="relative mt-2 aspect-video w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-2xs">
                    <img
                      src={thumbnail}
                      alt="Thumbnail Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=600&q=80";
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Gallery Images */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-slate-700">Gallery Media</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddImage}
                    className="h-7 text-xs font-semibold text-purple-700 border-purple-200 bg-purple-50/50 hover:bg-purple-100 gap-1 shadow-2xs">
                    <IconPlus className="size-3" />
                    Add Image
                  </Button>
                </div>

                {/* Carousel Preview if Images exist */}
                {validGalleryImages.length > 0 && (
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100 mb-2">
                    <img
                      src={validGalleryImages[activeGalleryIndex] || validGalleryImages[0]}
                      alt="Gallery Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=600&q=80";
                      }}
                    />
                    {validGalleryImages.length > 1 && (
                      <div className="absolute inset-0 flex items-center justify-between p-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          onClick={() =>
                            setActiveGalleryIndex((prev) =>
                              prev === 0 ? validGalleryImages.length - 1 : prev - 1
                            )
                          }
                          className="size-7 rounded-full bg-white/80 backdrop-blur-xs text-slate-700 hover:bg-white">
                          <IconChevronLeft className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          onClick={() =>
                            setActiveGalleryIndex((prev) =>
                              prev === validGalleryImages.length - 1 ? 0 : prev + 1
                            )
                          }
                          className="size-7 rounded-full bg-white/80 backdrop-blur-xs text-slate-700 hover:bg-white">
                          <IconChevronRight className="size-4" />
                        </Button>
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 rounded-md bg-slate-900/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs">
                      {activeGalleryIndex + 1} / {validGalleryImages.length}
                    </div>
                  </div>
                )}

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {images.map((img, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder={`Gallery Image URL #${index + 1}`}
                        value={img}
                        onChange={(e) => handleImageChange(index, e.target.value)}
                        className="h-9 text-xs bg-slate-50/50 border-slate-200 flex-1 focus-visible:ring-blue-500"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveImage(index)}
                        className="size-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50">
                        <IconTrash className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Multi-Language Content & Itinerary (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          <Card className="border-slate-200/80 shadow-xs bg-white py-0 gap-0 overflow-hidden">
            <CardHeader className="px-5 py-3.5 border-b border-slate-100 [.border-b]:pb-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-md bg-purple-50 text-purple-600">
                  <IconSparkles className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">Localized Tour Content</CardTitle>
                  <CardDescription className="text-[11px] text-slate-500">
                    Provide package titles, descriptions, detailed itinerary, and benefits across languages.
                  </CardDescription>
                </div>
              </div>

              {/* Multi-Language Tabs: EN, ID, TR */}
              <Tabs value={activeLangTab} onValueChange={(val) => setActiveLangTab(val as "en" | "id" | "tr")} className="w-fit">
                <TabsList className="bg-slate-100 p-0.5 rounded-lg h-7.5">
                  <TabsTrigger
                    value="en"
                    className="text-xs font-semibold px-2.5 py-0.5 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-2xs rounded-md">
                    English (EN)
                  </TabsTrigger>
                  <TabsTrigger
                    value="id"
                    className="text-xs font-semibold px-2.5 py-0.5 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-2xs rounded-md">
                    Indonesia (ID)
                  </TabsTrigger>
                  <TabsTrigger
                    value="tr"
                    className="text-xs font-semibold px-2.5 py-0.5 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-2xs rounded-md">
                    Turkish (TR)
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              {/* 1. English Tab */}
              {activeLangTab === "en" && (
                <div className="space-y-4 animate-in fade-in-50 duration-150">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      Package Name (English) <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      placeholder="e.g. Umrah Plus Turkey Platinum (12 Days)"
                      value={enName}
                      onChange={(e) => setEnName(e.target.value)}
                      className="h-9 text-xs bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      Full Description (English)
                    </Label>
                    <Textarea
                      placeholder="Describe the spiritual journey, hotel accommodations, airline details, and package overview..."
                      rows={3}
                      value={enDescription}
                      onChange={(e) => setEnDescription(e.target.value)}
                      className="text-xs bg-slate-50/50 border-slate-200 leading-relaxed resize-y focus-visible:ring-blue-500"
                    />
                  </div>

                  {/* Itinerary / Highlights */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconSparkles className="size-4 text-blue-600" />
                        <Label className="text-xs font-bold text-slate-900">Itinerary / Tour Highlights</Label>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddDetail("en")}
                        className="h-7 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 gap-1">
                        <IconPlus className="size-3" /> Add Day / Highlight
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {enDetailTour.map((detail, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-bold text-xs">
                            {idx + 1}
                          </span>
                          <Input
                            placeholder={`e.g. Day ${idx + 1}: Departure from Jakarta & Arrival in Madinah`}
                            value={detail}
                            onChange={(e) => handleDetailChange("en", idx, e.target.value)}
                            className="h-9 text-xs bg-slate-50/50 border-slate-200 flex-1 focus-visible:ring-blue-500"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveDetail("en", idx)}
                            className="size-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50">
                            <IconTrash className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconCheck className="size-4 text-emerald-600" />
                        <Label className="text-xs font-bold text-slate-900">Benefits</Label>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddFacility("en")}
                        className="h-7 text-[11px] font-semibold text-emerald-600 hover:bg-emerald-50 gap-1">
                        <IconPlus className="size-3" /> Add Benefit
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {enFacilities.map((facility, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Input
                            placeholder="e.g. 5-Star Hotel Pullman Zamzam, Full Board Meals, Visa & Insurance"
                            value={facility}
                            onChange={(e) => handleFacilityChange("en", idx, e.target.value)}
                            className="h-9 text-xs bg-slate-50/50 border-slate-200 flex-1 focus-visible:ring-blue-500"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveFacility("en", idx)}
                            className="size-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50">
                            <IconTrash className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Indonesia Tab */}
              {activeLangTab === "id" && (
                <div className="space-y-4 animate-in fade-in-50 duration-150">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      Nama Paket (Bahasa Indonesia) <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      placeholder="contoh: Paket Umrah Plus Turki Platinum (12 Hari)"
                      value={idName}
                      onChange={(e) => setIdName(e.target.value)}
                      className="h-9 text-xs bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      Deskripsi Lengkap (Bahasa Indonesia)
                    </Label>
                    <Textarea
                      placeholder="Jelaskan rincian perjalanan ibadah, fasilitas hotel bintang 5, penerbangan langsung, dan keunggulan paket..."
                      rows={3}
                      value={idDescription}
                      onChange={(e) => setIdDescription(e.target.value)}
                      className="text-xs bg-slate-50/50 border-slate-200 leading-relaxed resize-y focus-visible:ring-blue-500"
                    />
                  </div>

                  {/* Itinerary / Highlights */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconSparkles className="size-4 text-blue-600" />
                        <Label className="text-xs font-bold text-slate-900">Itinerary / Jadwal Rencana Perjalanan</Label>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddDetail("id")}
                        className="h-7 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 gap-1">
                        <IconPlus className="size-3" /> Tambah Jadwal Hari
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {idDetailTour.map((detail, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-bold text-xs">
                            {idx + 1}
                          </span>
                          <Input
                            placeholder={`contoh: Hari ${idx + 1}: Keberangkatan dari Jakarta menuju Madinah`}
                            value={detail}
                            onChange={(e) => handleDetailChange("id", idx, e.target.value)}
                            className="h-9 text-xs bg-slate-50/50 border-slate-200 flex-1 focus-visible:ring-blue-500"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveDetail("id", idx)}
                            className="size-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50">
                            <IconTrash className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconCheck className="size-4 text-emerald-600" />
                        <Label className="text-xs font-bold text-slate-900">Benefits</Label>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddFacility("id")}
                        className="h-7 text-[11px] font-semibold text-emerald-600 hover:bg-emerald-50 gap-1">
                        <IconPlus className="size-3" /> Tambah Benefit
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {idFacilities.map((facility, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Input
                            placeholder="contoh: Tiket Pesawat PP, Hotel Bintang 5, Visa Umrah, Handling & Asuransi"
                            value={facility}
                            onChange={(e) => handleFacilityChange("id", idx, e.target.value)}
                            className="h-9 text-xs bg-slate-50/50 border-slate-200 flex-1 focus-visible:ring-blue-500"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveFacility("id", idx)}
                            className="size-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50">
                            <IconTrash className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Turkish Tab */}
              {activeLangTab === "tr" && (
                <div className="space-y-4 animate-in fade-in-50 duration-150">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      Paket Adı (Türkçe) <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      placeholder="Örn: 12 Günlük Umre & Türkiye Kültür Turu"
                      value={trName}
                      onChange={(e) => setTrName(e.target.value)}
                      className="h-9 text-xs bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      Tam Açıklama (Türkçe)
                    </Label>
                    <Textarea
                      placeholder="Manevi yolculuk detaylarını, 5 yıldızlı otel konaklamalarını, uçuş ve rehberlik hizmetlerini açıklayınız..."
                      rows={3}
                      value={trDescription}
                      onChange={(e) => setTrDescription(e.target.value)}
                      className="text-xs bg-slate-50/50 border-slate-200 leading-relaxed resize-y focus-visible:ring-blue-500"
                    />
                  </div>

                  {/* Itinerary / Highlights */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconSparkles className="size-4 text-blue-600" />
                        <Label className="text-xs font-bold text-slate-900">Tur Programı & Öne Çıkanlar</Label>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddDetail("tr")}
                        className="h-7 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 gap-1">
                        <IconPlus className="size-3" /> Gün / Program Ekle
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {trDetailTour.map((detail, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-bold text-xs">
                            {idx + 1}
                          </span>
                          <Input
                            placeholder={`Örn: ${idx + 1}. Gün: İstanbul'dan Hareket ve Medine'ye Varış`}
                            value={detail}
                            onChange={(e) => handleDetailChange("tr", idx, e.target.value)}
                            className="h-9 text-xs bg-slate-50/50 border-slate-200 flex-1 focus-visible:ring-blue-500"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveDetail("tr", idx)}
                            className="size-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50">
                            <IconTrash className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconCheck className="size-4 text-emerald-600" />
                        <Label className="text-xs font-bold text-slate-900">Avantajlar (Benefits)</Label>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddFacility("tr")}
                        className="h-7 text-[11px] font-semibold text-emerald-600 hover:bg-emerald-50 gap-1">
                        <IconPlus className="size-3" /> Avantaj Ekle
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {trFacilities.map((facility, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Input
                            placeholder="Örn: 5 Yıldızlı Otel, Gidiş-Dönüş Uçak Bileti, Vize, Transfer & Rehberlik"
                            value={facility}
                            onChange={(e) => handleFacilityChange("tr", idx, e.target.value)}
                            className="h-9 text-xs bg-slate-50/50 border-slate-200 flex-1 focus-visible:ring-blue-500"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveFacility("tr", idx)}
                            className="size-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50">
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
