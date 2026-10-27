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
  AttractionItem,
  AttractionTicket,
  CreateEntertainmentPayload,
  useCreateEntertainmentMutation,
  useFindAllEntertainmentCategoriesQuery,
  useFindAllLocationsQuery,
  useUpdateEntertainmentMutation,
} from "@/store/services/entertainment.service";
import {
  IconArrowLeft,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconCurrencyDollar,
  IconLanguage,
  IconMoodSmile,
  IconPhoto,
  IconPlus,
  IconSelector,
  IconTicket,
  IconTrash,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface AttractionFormProps {
  initialData?: AttractionItem | null;
  isEdit?: boolean;
}

interface CustomTicketState {
  id?: string;
  name: string;
  price: number | string;
  min_age?: number | string;
  max_age?: number | string;
  description?: string;
}

export default function AttractionForm({ initialData, isEdit = false }: AttractionFormProps) {
  const router = useRouter();

  const [createEntertainment, { isLoading: isCreating }] = useCreateEntertainmentMutation();
  const [updateEntertainment, { isLoading: isUpdating }] = useUpdateEntertainmentMutation();
  const isSubmitting = isCreating || isUpdating;

  const { data: categoriesData } = useFindAllEntertainmentCategoriesQuery();
  const { data: locationsData } = useFindAllLocationsQuery();

  const [openLocationCombobox, setOpenLocationCombobox] = useState(false);

  // ─── 1. General Info State ──────────────────────────────────────────
  const [countryId, setCountryId] = useState<string>(() => initialData?.country_id || "");
  const [stateId, setStateId] = useState<string>(() => initialData?.state_id || "");
  const [cityId, setCityId] = useState<string>(() => initialData?.city_id || "");
  const [categoryDestinationId, setCategoryDestinationId] = useState<string>(
    () =>
      initialData?.category_destination_id ||
      (initialData as any)?.category_destination?.id ||
      initialData?.category_id ||
      ""
  );
  const [dailyQuota, setDailyQuota] = useState<number | string>(() =>
    initialData?.daily_quota != null ? initialData.daily_quota : ""
  );

  // ─── 2. Ticket Pricing Model State ──────────────────────────────────
  const initialTickets = useMemo(() => initialData?.tickets || [], [initialData]);
  const isTieredInitial = useMemo(() => {
    if (!initialTickets || initialTickets.length === 0) return false;
    if (initialTickets.length > 1) return true;
    return initialTickets.some((t) => t.ticket_type === "package");
  }, [initialTickets]);

  const [pricingType, setPricingType] = useState<"flat" | "tiered">(() =>
    isTieredInitial ? "tiered" : "flat"
  );

  // Model A: Flat Ticket
  const flatInitial = useMemo(() => {
    if (!isTieredInitial && initialTickets.length > 0) return initialTickets[0];
    return null;
  }, [isTieredInitial, initialTickets]);

  const [flatTicketId, setFlatTicketId] = useState<string>(() => flatInitial?.id || "");
  const [flatTicketName, setFlatTicketName] = useState<string>(
    () => flatInitial?.name || "General Admission (All Ages)"
  );
  const [flatTicketPrice, setFlatTicketPrice] = useState<number | string>(
    () => flatInitial?.price ?? (initialData?.price != null ? initialData.price : "")
  );
  const [flatTicketDesc, setFlatTicketDesc] = useState<string>(
    () => flatInitial?.description || "Berlaku untuk semua usia"
  );

  // Model B: Tiered Tickets (Dewasa & Anak-Anak)
  const adultInitial = useMemo(() => {
    return (
      initialTickets.find(
        (t) =>
          t.name.toLowerCase().includes("dewasa") ||
          t.name.toLowerCase().includes("adult")
      ) || (isTieredInitial ? initialTickets[0] : null)
    );
  }, [initialTickets, isTieredInitial]);

  const childInitial = useMemo(() => {
    return (
      initialTickets.find(
        (t) =>
          (t.name.toLowerCase().includes("anak") ||
            t.name.toLowerCase().includes("child")) &&
          t.id !== adultInitial?.id
      ) || (isTieredInitial && initialTickets.length > 1 ? initialTickets[1] : null)
    );
  }, [initialTickets, isTieredInitial, adultInitial]);

  const extraInitial = useMemo(() => {
    return initialTickets.filter(
      (t) => t.id !== adultInitial?.id && t.id !== childInitial?.id
    );
  }, [initialTickets, adultInitial, childInitial]);

  // Adult ticket state
  const [adultTicketId, setAdultTicketId] = useState<string>(() => adultInitial?.id || "");
  const [adultTicketName, setAdultTicketName] = useState<string>(
    () => adultInitial?.name || "Dewasa (Adult Pass)"
  );
  const [adultPrice, setAdultPrice] = useState<number | string>(
    () => adultInitial?.price ?? ""
  );
  const [adultMinAge, setAdultMinAge] = useState<number | string>(
    () => (adultInitial?.min_age != null ? adultInitial.min_age : 12)
  );
  const [adultDesc, setAdultDesc] = useState<string>(
    () => adultInitial?.description || "Usia 12+ tahun"
  );

  // Child ticket state
  const [childTicketId, setChildTicketId] = useState<string>(() => childInitial?.id || "");
  const [childTicketName, setChildTicketName] = useState<string>(
    () => childInitial?.name || "Anak-Anak (Child Pass)"
  );
  const [childPrice, setChildPrice] = useState<number | string>(
    () => childInitial?.price ?? ""
  );
  const [childMinAge, setChildMinAge] = useState<number | string>(
    () => (childInitial?.min_age != null ? childInitial.min_age : 2)
  );
  const [childMaxAge, setChildMaxAge] = useState<number | string>(
    () => (childInitial?.max_age != null ? childInitial.max_age : 11)
  );
  const [childDesc, setChildDesc] = useState<string>(
    () => childInitial?.description || "Usia 2 - 11 tahun"
  );

  // Custom extra tiers
  const [customTickets, setCustomTickets] = useState<CustomTicketState[]>(() =>
    extraInitial.map((t) => ({
      id: t.id,
      name: t.name,
      price: t.price,
      min_age: t.min_age ?? "",
      max_age: t.max_age ?? "",
      description: t.description || "",
    }))
  );

  const handleAddCustomTicket = () => {
    setCustomTickets([
      ...customTickets,
      {
        name: "",
        price: "",
        min_age: "",
        max_age: "",
        description: "",
      },
    ]);
  };

  const handleRemoveCustomTicket = (index: number) => {
    setCustomTickets(customTickets.filter((_, i) => i !== index));
  };

  const handleCustomTicketChange = (
    index: number,
    field: keyof CustomTicketState,
    val: any
  ) => {
    const updated = [...customTickets];
    updated[index] = { ...updated[index], [field]: val };
    setCustomTickets(updated);
  };

  // ─── 3. Visuals & Media State ───────────────────────────────────────
  const [thumbnail, setThumbnail] = useState<string>(() => initialData?.thumbnail || "");
  const [images, setImages] = useState<string[]>(() =>
    initialData?.images && initialData.images.length > 0 ? initialData.images : [""]
  );
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  const validGalleryImages = useMemo(() => {
    return images.filter((img) => img && img.trim() !== "");
  }, [images]);

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

  // ─── 4. Multilingual Translation State (EN, ID, TR) ─────────────────
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

  const [idName, setIdName] = useState<string>(() => idTransInitial?.name || "");
  const [idDescription, setIdDescription] = useState<string>(
    () => idTransInitial?.description || ""
  );

  const [trName, setTrName] = useState<string>(() => trTransInitial?.name || "");
  const [trDescription, setTrDescription] = useState<string>(
    () => trTransInitial?.description || ""
  );

  // ─── Helpers & Combobox ─────────────────────────────────────────────
  const categories = useMemo(() => {
    return categoriesData?.data || (categoriesData as any)?.datas || [];
  }, [categoriesData]);

  const countriesList = useMemo(() => {
    return locationsData?.data || [];
  }, [locationsData]);

  // Auto-resolve countryId from stateId if countryId was not saved initially
  useEffect(() => {
    if (stateId && !countryId && countriesList.length > 0) {
      for (const c of countriesList) {
        if (c.states?.some((s: any) => s.id === stateId)) {
          setCountryId(c.id);
          break;
        }
      }
    }
  }, [stateId, countryId, countriesList]);

  const selectedLocationLabel = useMemo(() => {
    if (initialData?.location && !stateId) return initialData.location;
    for (const c of countriesList) {
      const foundState = c.states?.find((s: any) => s.id === stateId);
      if (foundState) {
        return `${foundState.name}, ${c.name}`;
      }
    }
    return stateId ? "Selected State" : "Pilih Lokasi Atraksi";
  }, [countriesList, stateId, initialData]);

  // ─── Submit Handler ─────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stateId) {
      toast.error("Silakan pilih lokasi / provinsi atraksi terlebih dahulu");
      return;
    }
    if (!categoryDestinationId) {
      toast.error("Silakan pilih kategori atraksi");
      return;
    }
    if (!enName.trim() && !idName.trim() && !trName.trim()) {
      toast.error("Judul atraksi minimal harus diisi dalam salah satu bahasa (EN, ID, atau TR)");
      return;
    }

    // Build tickets payload based on selected pricing model
    const ticketsPayload: AttractionTicket[] = [];

    if (pricingType === "flat") {
      const numFlatPrice = Number(flatTicketPrice);
      if (isNaN(numFlatPrice) || numFlatPrice <= 0) {
        toast.error("Harga Tiket Masuk Flat (USD) harus lebih besar dari 0");
        return;
      }

      ticketsPayload.push({
        id: flatTicketId || undefined,
        name: flatTicketName.trim() || "General Admission (All Ages)",
        ticket_type: "flat",
        price: numFlatPrice,
        pax_count: 1,
        description: flatTicketDesc.trim() || "Berlaku untuk semua usia",
      });
    } else {
      // Tiered: Dewasa & Anak-Anak
      const numAdultPrice = Number(adultPrice);
      const numChildPrice = Number(childPrice);

      if (isNaN(numAdultPrice) || numAdultPrice <= 0) {
        toast.error("Harga Tiket Dewasa (USD) harus lebih besar dari 0");
        return;
      }
      if (isNaN(numChildPrice) || numChildPrice <= 0) {
        toast.error("Harga Tiket Anak-Anak (USD) harus lebih besar dari 0");
        return;
      }

      // Adult Ticket
      ticketsPayload.push({
        id: adultTicketId || undefined,
        name: adultTicketName.trim() || "Dewasa (Adult Pass)",
        ticket_type: "package",
        price: numAdultPrice,
        pax_count: 1,
        min_age:
          adultMinAge !== "" && !isNaN(Number(adultMinAge)) ? Number(adultMinAge) : 12,
        max_age: null,
        description: adultDesc.trim() || "Usia 12+ tahun",
      });

      // Child Ticket
      ticketsPayload.push({
        id: childTicketId || undefined,
        name: childTicketName.trim() || "Anak-Anak (Child Pass)",
        ticket_type: "package",
        price: numChildPrice,
        pax_count: 1,
        min_age:
          childMinAge !== "" && !isNaN(Number(childMinAge)) ? Number(childMinAge) : 2,
        max_age:
          childMaxAge !== "" && !isNaN(Number(childMaxAge)) ? Number(childMaxAge) : 11,
        description: childDesc.trim() || "Usia 2 - 11 tahun",
      });

      // Extra custom tiers
      for (const ct of customTickets) {
        if (!ct.name.trim()) continue;
        const numCtPrice = Number(ct.price);
        if (isNaN(numCtPrice) || numCtPrice < 0) {
          toast.error(`Harga tiket tambahan "${ct.name}" harus berupa angka valid (USD)`);
          return;
        }

        ticketsPayload.push({
          id: ct.id || undefined,
          name: ct.name.trim(),
          ticket_type: "package",
          price: numCtPrice,
          pax_count: 1,
          min_age:
            ct.min_age !== "" && ct.min_age !== undefined && !isNaN(Number(ct.min_age))
              ? Number(ct.min_age)
              : null,
          max_age:
            ct.max_age !== "" && ct.max_age !== undefined && !isNaN(Number(ct.max_age))
              ? Number(ct.max_age)
              : null,
          description: ct.description?.trim() || undefined,
        });
      }
    }

    const calculatedPrice = Math.min(...ticketsPayload.map((t) => t.price));
    const cleanedImages = images.filter((img) => img.trim() !== "");

    // Build translations
    const translations: { language_code: string; name: string; description: string }[] = [];

    if (enName.trim()) {
      translations.push({
        language_code: "en",
        name: enName.trim(),
        description: enDescription.trim() || enName.trim(),
      });
    }

    if (idName.trim()) {
      translations.push({
        language_code: "id",
        name: idName.trim(),
        description: idDescription.trim() || idName.trim(),
      });
    }

    if (trName.trim()) {
      translations.push({
        language_code: "tr",
        name: trName.trim(),
        description: trDescription.trim() || trName.trim(),
      });
    }

    const payload: CreateEntertainmentPayload = {
      country_id: countryId || undefined,
      state_id: stateId,
      city_id: cityId || undefined,
      category_destination_id: categoryDestinationId,
      price: calculatedPrice,
      daily_quota:
        dailyQuota !== "" && dailyQuota !== null && !isNaN(Number(dailyQuota))
          ? Number(dailyQuota)
          : null,
      thumbnail: thumbnail.trim() || undefined,
      images: cleanedImages,
      translations,
      tickets: ticketsPayload,
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
              {isEdit ? `Edit: ${enName || idName || "Attraction"}` : "Create New Attraction"}
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
                <span>{isEdit ? "Saving..." : "Creating..."}</span>
              </>
            ) : (
              <>
                <IconCheck className="size-4" />
                <span>{isEdit ? "Save Changes" : "Create Attraction"}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 2. Main Two-Column Layout (Consistent with Rent Motor & Tour Packages) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Left Column: Localized Info & Ticket Pricing (7 cols) */}
        <div className="space-y-5 lg:col-span-7">
          {/* Card 1: Localized Content (EN, ID, TR) */}
          <Card className="gap-0 overflow-hidden border-slate-200/80 bg-white py-0 shadow-xs">
            <CardHeader className="flex flex-col gap-2 border-b border-slate-100 px-5 py-3.5 [.border-b]:pb-3.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                  <IconLanguage className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">
                    Attraction Information & Overview
                  </CardTitle>
                  <CardDescription className="text-[11px] text-slate-500">
                    Provide localized names and descriptions for customer booking pages.
                  </CardDescription>
                </div>
              </div>

              {/* Multi-Language Tabs: EN, ID, TR (Consistent with create motor) */}
              <Tabs
                value={activeLangTab}
                onValueChange={(val) => setActiveLangTab(val as "en" | "id" | "tr")}
                className="w-fit">
                <TabsList className="h-7.5 rounded-lg bg-slate-100 p-0.5">
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
              {/* 1. English Tab */}
              {activeLangTab === "en" && (
                <div className="space-y-3.5 animate-in fade-in-50 duration-150">
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                      Attraction Name (EN) <span className="text-rose-500">*</span>
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
                      Description & Overview (EN)
                    </Label>
                    <Textarea
                      rows={4}
                      placeholder="Write an engaging overview of this attraction..."
                      value={enDescription}
                      onChange={(e) => setEnDescription(e.target.value)}
                      className="border-slate-200 bg-slate-50/50 text-xs leading-relaxed focus-visible:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* 2. Indonesian Tab */}
              {activeLangTab === "id" && (
                <div className="space-y-3.5 animate-in fade-in-50 duration-150">
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                      Nama Atraksi (ID)
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
                      Deskripsi Lengkap (ID)
                    </Label>
                    <Textarea
                      rows={4}
                      placeholder="Tulis ringkasan atau detail menarik tentang atraksi ini..."
                      value={idDescription}
                      onChange={(e) => setIdDescription(e.target.value)}
                      className="border-slate-200 bg-slate-50/50 text-xs leading-relaxed focus-visible:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* 3. Turkish Tab */}
              {activeLangTab === "tr" && (
                <div className="space-y-3.5 animate-in fade-in-50 duration-150">
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                      Gezilecek Yer / Etkinlik Adı (TR)
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
                      Açıklama (TR)
                    </Label>
                    <Textarea
                      rows={4}
                      placeholder="Bu cazibe merkezi hakkında detaylı açıklama yazın..."
                      value={trDescription}
                      onChange={(e) => setTrDescription(e.target.value)}
                      className="border-slate-200 bg-slate-50/50 text-xs leading-relaxed focus-visible:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 2: Dual-Mode Ticket Pricing (Flat vs. Dewasa & Anak-Anak) */}
          <Card className="gap-0 overflow-hidden border-slate-200/80 bg-white py-0 shadow-xs">
            <CardHeader className="flex items-center gap-2 border-b border-slate-100 px-5 py-3.5 [.border-b]:pb-3.5">
              <div className="flex size-7 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
                <IconCurrencyDollar className="size-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">
                  Model & Konfigurasi Harga Tiket
                </CardTitle>
                <CardDescription className="text-[11px] text-slate-500">
                  Pilih skema harga flat untuk semua usia atau paket berjenjang Dewasa & Anak-Anak.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              {/* Pricing Model Selector Cards */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Option 1: Flat Ticket */}
                <div
                  onClick={() => setPricingType("flat")}
                  className={cn(
                    "cursor-pointer rounded-xl border p-3.5 transition-all",
                    pricingType === "flat"
                      ? "border-blue-600 bg-blue-50/40 ring-1 ring-blue-600 shadow-2xs"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                  )}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "flex size-7 items-center justify-center rounded-md",
                          pricingType === "flat"
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        )}>
                        <IconTicket className="size-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-900">Tiket Flat (Single)</span>
                    </div>
                    <div
                      className={cn(
                        "size-4 rounded-full border flex items-center justify-center",
                        pricingType === "flat"
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-300"
                      )}>
                      {pricingType === "flat" && <div className="size-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">
                    Satu harga tiket masuk berlaku untuk seluruh pengunjung dari segala usia.
                  </p>
                </div>

                {/* Option 2: Dewasa & Anak-Anak (Tiered Package) */}
                <div
                  onClick={() => setPricingType("tiered")}
                  className={cn(
                    "cursor-pointer rounded-xl border p-3.5 transition-all",
                    pricingType === "tiered"
                      ? "border-blue-600 bg-blue-50/40 ring-1 ring-blue-600 shadow-2xs"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                  )}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "flex size-7 items-center justify-center rounded-md",
                          pricingType === "tiered"
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        )}>
                        <IconUsers className="size-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-900">
                        Tiket Dewasa & Anak-Anak
                      </span>
                    </div>
                    <div
                      className={cn(
                        "size-4 rounded-full border flex items-center justify-center",
                        pricingType === "tiered"
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-300"
                      )}>
                      {pricingType === "tiered" && (
                        <div className="size-1.5 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">
                    Harga tiket terpisah berdasarkan usia (Dewasa 12+ tahun, Anak-anak 2-11 tahun).
                  </p>
                </div>
              </div>

              {/* MODE 1: FLAT TICKET FORM */}
              {pricingType === "flat" && (
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-[10px] font-semibold">
                        Tiket Masuk Flat
                      </Badge>
                      <span className="text-xs font-medium text-slate-600">
                        General Admission
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">
                        Nama Tiket <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        placeholder="Contoh: Tiket Masuk (General Admission)"
                        value={flatTicketName}
                        onChange={(e) => setFlatTicketName(e.target.value)}
                        className="h-8.5 bg-white border-slate-200 text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">
                        Harga Tiket (USD) <span className="text-rose-500">*</span>
                      </Label>
                      <div className="relative">
                        <span className="absolute top-1/2 left-3 -translate-y-1/2 text-xs font-bold text-slate-400">
                          $
                        </span>
                        <Input
                          type="number"
                          step="any"
                          min="0"
                          placeholder="25.00"
                          value={flatTicketPrice}
                          onChange={(e) => setFlatTicketPrice(e.target.value)}
                          className="h-8.5 bg-white border-slate-200 pl-8 font-mono text-xs font-bold focus-visible:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      Keterangan Tiket
                    </Label>
                    <Input
                      placeholder="Contoh: Berlaku untuk semua usia"
                      value={flatTicketDesc}
                      onChange={(e) => setFlatTicketDesc(e.target.value)}
                      className="h-8.5 bg-white border-slate-200 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* MODE 2: TIERED (DEWASA & ANAK-ANAK) FORM */}
              {pricingType === "tiered" && (
                <div className="space-y-3.5">
                  {/* Adult Ticket Card */}
                  <div className="rounded-xl border border-blue-200/90 bg-blue-50/20 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex size-6 items-center justify-center rounded-md bg-blue-600 text-white">
                          <IconUser className="size-3.5" />
                        </div>
                        <span className="text-xs font-bold text-slate-900">
                          Tiket Dewasa (Adult Pass)
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-blue-200 bg-blue-50 text-[10px] font-semibold text-blue-700">
                        Kategori Wajib
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="space-y-1.5 sm:col-span-1">
                        <Label className="text-xs font-semibold text-slate-700">
                          Nama Tiket <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          placeholder="Dewasa (Adult Pass)"
                          value={adultTicketName}
                          onChange={(e) => setAdultTicketName(e.target.value)}
                          className="h-8.5 bg-white border-slate-200 text-xs font-medium"
                        />
                      </div>

                      <div className="space-y-1.5 sm:col-span-1">
                        <Label className="text-xs font-semibold text-slate-700">
                          Harga Tiket (USD) <span className="text-rose-500">*</span>
                        </Label>
                        <div className="relative">
                          <span className="absolute top-1/2 left-3 -translate-y-1/2 text-xs font-bold text-slate-400">
                            $
                          </span>
                          <Input
                            type="number"
                            step="any"
                            min="0"
                            placeholder="35.00"
                            value={adultPrice}
                            onChange={(e) => setAdultPrice(e.target.value)}
                            className="h-8.5 bg-white border-slate-200 pl-8 font-mono text-xs font-bold focus-visible:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 sm:col-span-1">
                        <Label className="text-xs font-semibold text-slate-700">
                          Batas Usia Min (Tahun)
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          placeholder="12"
                          value={adultMinAge}
                          onChange={(e) => setAdultMinAge(e.target.value)}
                          className="h-8.5 bg-white border-slate-200 text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">
                        Keterangan Tiket Dewasa
                      </Label>
                      <Input
                        placeholder="Contoh: Usia 12+ tahun"
                        value={adultDesc}
                        onChange={(e) => setAdultDesc(e.target.value)}
                        className="h-8.5 bg-white border-slate-200 text-xs"
                      />
                    </div>
                  </div>

                  {/* Child Ticket Card */}
                  <div className="rounded-xl border border-amber-200/90 bg-amber-50/20 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex size-6 items-center justify-center rounded-md bg-amber-500 text-white">
                          <IconMoodSmile className="size-3.5" />
                        </div>
                        <span className="text-xs font-bold text-slate-900">
                          Tiket Anak-Anak (Child Pass)
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-amber-200 bg-amber-50 text-[10px] font-semibold text-amber-700">
                        Kategori Wajib
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label className="text-xs font-semibold text-slate-700">
                          Nama Tiket <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          placeholder="Anak-Anak (Child Pass)"
                          value={childTicketName}
                          onChange={(e) => setChildTicketName(e.target.value)}
                          className="h-8.5 bg-white border-slate-200 text-xs font-medium"
                        />
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <Label className="text-xs font-semibold text-slate-700">
                          Harga Tiket (USD) <span className="text-rose-500">*</span>
                        </Label>
                        <div className="relative">
                          <span className="absolute top-1/2 left-3 -translate-y-1/2 text-xs font-bold text-slate-400">
                            $
                          </span>
                          <Input
                            type="number"
                            step="any"
                            min="0"
                            placeholder="25.00"
                            value={childPrice}
                            onChange={(e) => setChildPrice(e.target.value)}
                            className="h-8.5 bg-white border-slate-200 pl-8 font-mono text-xs font-bold focus-visible:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <Label className="text-xs font-semibold text-slate-700">
                          Minimal Usia (Tahun)
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          placeholder="2"
                          value={childMinAge}
                          onChange={(e) => setChildMinAge(e.target.value)}
                          className="h-8.5 bg-white border-slate-200 text-xs"
                        />
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <Label className="text-xs font-semibold text-slate-700">
                          Maksimal Usia (Tahun)
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          placeholder="11"
                          value={childMaxAge}
                          onChange={(e) => setChildMaxAge(e.target.value)}
                          className="h-8.5 bg-white border-slate-200 text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">
                        Keterangan Tiket Anak
                      </Label>
                      <Input
                        placeholder="Contoh: Usia 2 - 11 tahun"
                        value={childDesc}
                        onChange={(e) => setChildDesc(e.target.value)}
                        className="h-8.5 bg-white border-slate-200 text-xs"
                      />
                    </div>
                  </div>

                  {/* Extra Custom Tiers */}
                  {customTickets.length > 0 && (
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">
                          Kategori Tiket Tambahan (Opsional)
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {customTickets.length} Kategori Tambahan
                        </span>
                      </div>

                      {customTickets.map((ct, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800">
                              Tiket Tambahan #{idx + 1}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveCustomTicket(idx)}
                              className="h-7 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700">
                              <IconTrash className="mr-1 size-3.5" /> Hapus
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-4">
                            <div className="space-y-1 sm:col-span-2">
                              <Label className="text-[11px] font-semibold text-slate-600">
                                Nama Tiket
                              </Label>
                              <Input
                                placeholder="Contoh: Balita / Lansia / VIP Pass"
                                value={ct.name}
                                onChange={(e) =>
                                  handleCustomTicketChange(idx, "name", e.target.value)
                                }
                                className="h-8 bg-slate-50/50 text-xs"
                              />
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                              <Label className="text-[11px] font-semibold text-slate-600">
                                Harga Tiket (USD)
                              </Label>
                              <div className="relative">
                                <span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-xs font-bold text-slate-400">
                                  $
                                </span>
                                <Input
                                  type="number"
                                  step="any"
                                  min="0"
                                  placeholder="0.00"
                                  value={ct.price}
                                  onChange={(e) =>
                                    handleCustomTicketChange(idx, "price", e.target.value)
                                  }
                                  className="h-8 bg-slate-50/50 pl-6.5 font-mono text-xs font-bold"
                                />
                              </div>
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                              <Label className="text-[11px] font-semibold text-slate-600">
                                Min Usia (Tahun)
                              </Label>
                              <Input
                                type="number"
                                min="0"
                                placeholder="Opsional"
                                value={ct.min_age ?? ""}
                                onChange={(e) =>
                                  handleCustomTicketChange(idx, "min_age", e.target.value)
                                }
                                className="h-8 bg-slate-50/50 text-xs"
                              />
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                              <Label className="text-[11px] font-semibold text-slate-600">
                                Max Usia (Tahun)
                              </Label>
                              <Input
                                type="number"
                                min="0"
                                placeholder="Opsional"
                                value={ct.max_age ?? ""}
                                onChange={(e) =>
                                  handleCustomTicketChange(idx, "max_age", e.target.value)
                                }
                                className="h-8 bg-slate-50/50 text-xs"
                              />
                            </div>
                            <div className="space-y-1 sm:col-span-4">
                              <Label className="text-[11px] font-semibold text-slate-600">
                                Deskripsi Tiket
                              </Label>
                              <Input
                                placeholder="Keterangan persyaratan atau fasilitas khusus tiket ini..."
                                value={ct.description || ""}
                                onChange={(e) =>
                                  handleCustomTicketChange(idx, "description", e.target.value)
                                }
                                className="h-8 bg-slate-50/50 text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Button to add extra ticket tier */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddCustomTicket}
                    className="w-full h-8.5 border-dashed border-slate-300 text-xs font-semibold text-slate-700 hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-600">
                    <IconPlus className="mr-1.5 size-3.5" /> Tambah Kategori Tiket Lainnya (VIP,
                    Lansia, dsb)
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: General Specifications & Media (5 cols) */}
        <div className="space-y-5 lg:col-span-5">
          {/* Card 1: General Details */}
          <Card className="gap-0 overflow-hidden border-slate-200/80 bg-white py-0 shadow-xs">
            <CardHeader className="flex items-center gap-2 border-b border-slate-100 px-5 py-3.5 [.border-b]:pb-3.5">
              <div className="flex size-7 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                <IconTicket className="size-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">
                  Informasi Dasar Atraksi
                </CardTitle>
                <CardDescription className="text-[11px] text-slate-500">
                  Pilih lokasi wilayah, kategori, dan kuota harian pengunjung.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3.5 p-5">
              {/* Location Combobox */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                  Lokasi Wilayah / State <span className="text-rose-500">*</span>
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
                        placeholder="Cari provinsi / wilayah..."
                        className="h-8.5 text-xs"
                      />
                      <CommandList className="max-h-60 overflow-y-auto">
                        <CommandEmpty className="py-2 text-center text-xs text-slate-500">
                          Lokasi tidak ditemukan.
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
                                  setCountryId(country.id);
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
                  Kategori Atraksi <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={categoryDestinationId || ""}
                  onValueChange={setCategoryDestinationId}>
                  <SelectTrigger className="w-full h-9 border-slate-200 bg-slate-50/50 text-xs">
                    <SelectValue placeholder="Pilih Kategori" />
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

              {/* Daily Quota */}
              <div className="space-y-1.5 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-slate-700">
                    Kuota Pengunjung Harian (Daily Quota)
                  </Label>
                  <span className="text-[11px] text-slate-400">Opsional</span>
                </div>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Contoh: 500 (kosongkan jika tanpa batas)"
                  value={dailyQuota}
                  onChange={(e) => setDailyQuota(e.target.value)}
                  className="h-9 border-slate-200 bg-slate-50/50 text-xs focus-visible:ring-blue-500"
                />
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
                <CardTitle className="text-sm font-bold text-slate-900">
                  Media & Foto Atraksi
                </CardTitle>
                <CardDescription className="text-[11px] text-slate-500">
                  URL Thumbnail utama dan galeri foto atraksi.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3.5 p-5">
              {/* Primary Thumbnail */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">
                  URL Thumbnail Utama
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
                  <Label className="text-xs font-semibold text-slate-700">Foto Galeri</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddImage}
                    className="h-7 gap-1 border-blue-200 text-[11px] font-semibold text-blue-600 hover:bg-blue-50">
                    <IconPlus className="size-3" /> Tambah Foto
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
      </div>
    </form>
  );
}
