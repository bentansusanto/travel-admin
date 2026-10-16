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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useFindAllCountriesQuery } from "@/store/services/destination.service";
import {
  Motor,
  useCreateMerekMutation,
  useCreateMotorMutation,
  useFindAllMereksQuery,
  useUpdateMotorMutation,
} from "@/store/services/motor.service";
import { MerekModal } from "@/components/motors/MerekModal";
import {
  IconArrowLeft,
  IconCheck,
  IconCurrencyDollar,
  IconEngine,
  IconLanguage,
  IconPalette,
  IconPhoto,
  IconPlus,
  IconSelector,
  IconTrash,
} from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface MotorFormProps {
  initialData?: Motor | null;
  isEdit?: boolean;
}

export default function MotorForm({ initialData, isEdit = false }: MotorFormProps) {
  const router = useRouter();

  const [createMotor, { isLoading: isCreating }] = useCreateMotorMutation();
  const [updateMotor, { isLoading: isUpdating }] = useUpdateMotorMutation();
  const [createMerek] = useCreateMerekMutation();
  const isSubmitting = isCreating || isUpdating;

  const { data: mereksData, isLoading: isLoadingMereks } = useFindAllMereksQuery();
  const { data: countriesData } = useFindAllCountriesQuery();

  const mereks = useMemo(() => {
    return mereksData?.data || (mereksData as any)?.datas || [];
  }, [mereksData]);

  const [openLocationCombobox, setOpenLocationCombobox] = useState(false);
  const [isMerekModalOpen, setIsMerekModalOpen] = useState(false);

  const handleCreateBrand = async (data: { name_merek: string }) => {
    const res = await createMerek(data).unwrap();
    const createdId = res?.data?.id || (res as any)?.id;
    if (createdId) {
      setMerekId(createdId);
    }
  };

  // Helper to extract initial translations and prices
  const initialEn = initialData?.translations?.find((t) => t.language_code === "en");
  const initialId = initialData?.translations?.find((t) => t.language_code === "id");
  const initialTr = initialData?.translations?.find((t) => t.language_code === "tr");

  const initialPrices = initialData?.motor_prices || initialData?.prices || [];
  const initialDaily = initialPrices.find((p) => p.price_type === "daily")?.price;
  const initialWeekly = initialPrices.find((p) => p.price_type === "weekly")?.price;

  // Form State initialized directly from initialData
  const [merekId, setMerekId] = useState<string>(() => initialData?.merek_id || initialData?.merek?.id || "");
  const [stateId, setStateId] = useState<string>(() => initialData?.state_id || initialData?.state?.id || "");
  const [engineCc, setEngineCc] = useState<number | string>(() => (initialData?.engine_cc != null ? initialData.engine_cc : ""));
  const [thumbnail, setThumbnail] = useState<string>(() => initialData?.thumbnail || "");
  const [isAvailable, setIsAvailable] = useState<boolean>(() => initialData?.is_available ?? true);

  // Translations
  const [activeLangTab, setActiveLangTab] = useState<"en" | "id" | "tr">("en");
  const [enName, setEnName] = useState<string>(() => initialEn?.name_motor || "");
  const [enDescription, setEnDescription] = useState<string>(() => initialEn?.description || "");
  const [idName, setIdName] = useState<string>(() => initialId?.name_motor || "");
  const [idDescription, setIdDescription] = useState<string>(() => initialId?.description || "");
  const [trName, setTrName] = useState<string>(() => initialTr?.name_motor || "");
  const [trDescription, setTrDescription] = useState<string>(() => initialTr?.description || "");

  // Color Variants
  const [variants, setVariants] = useState<string[]>(() => {
    if (initialData?.variants && initialData.variants.length > 0) {
      return initialData.variants.map((v) => v.color);
    }
    return ["Matte Black"];
  });

  // Pricing (USD)
  const [dailyPrice, setDailyPrice] = useState<number | string>(() => (initialDaily != null ? initialDaily : ""));
  const [weeklyPrice, setWeeklyPrice] = useState<number | string>(() => (initialWeekly != null ? initialWeekly : ""));

  // Computed brand display name
  const selectedBrandName = useMemo(() => {
    if (merekId) {
      const found = mereks.find((m: any) => m.id === merekId);
      if (found) return found.name_merek;
    }
    if (initialData?.merek?.name_merek) return initialData.merek.name_merek;
    return undefined;
  }, [mereks, merekId, initialData]);

  // Populate data in edit mode when initialData changes
  useEffect(() => {
    if (initialData && isEdit) {
      setMerekId(initialData.merek_id || initialData.merek?.id || "");
      setStateId(initialData.state_id || initialData.state?.id || "");
      setEngineCc(initialData.engine_cc != null ? initialData.engine_cc : "");
      setThumbnail(initialData.thumbnail || "");
      setIsAvailable(initialData.is_available ?? true);

      // Translations
      const enTrans = initialData.translations?.find((t) => t.language_code === "en");
      const idTrans = initialData.translations?.find((t) => t.language_code === "id");
      const trTrans = initialData.translations?.find((t) => t.language_code === "tr");

      setEnName(enTrans?.name_motor || "");
      setEnDescription(enTrans?.description || "");
      setIdName(idTrans?.name_motor || "");
      setIdDescription(idTrans?.description || "");
      setTrName(trTrans?.name_motor || "");
      setTrDescription(trTrans?.description || "");

      // Variants
      if (initialData.variants && initialData.variants.length > 0) {
        setVariants(initialData.variants.map((v) => v.color));
      } else {
        setVariants(["Matte Black"]);
      }

      // Prices
      const prices = initialData.motor_prices || initialData.prices || [];
      const dPrice = prices.find((p) => p.price_type === "daily")?.price;
      const wPrice = prices.find((p) => p.price_type === "weekly")?.price;

      if (dPrice != null) setDailyPrice(dPrice);
      if (wPrice != null) setWeeklyPrice(wPrice);
    }
  }, [initialData, isEdit]);

  // Sync / Match brand ID when brands list finishes loading
  useEffect(() => {
    if (initialData && isEdit && mereks.length > 0) {
      const rawMerekId = initialData.merek_id || initialData.merek?.id || "";
      const rawMerekName = initialData.merek?.name_merek || "";

      const matchedById = mereks.find((m: any) => m.id === rawMerekId);
      if (matchedById) {
        setMerekId(matchedById.id);
      } else if (rawMerekName) {
        const matchedByName = mereks.find(
          (m: any) => m.name_merek?.toLowerCase() === rawMerekName.toLowerCase()
        );
        if (matchedByName) {
          setMerekId(matchedByName.id);
        }
      } else if (rawMerekId) {
        const matchedByName = mereks.find(
          (m: any) => m.name_merek?.toLowerCase() === rawMerekId.toLowerCase()
        );
        if (matchedByName) {
          setMerekId(matchedByName.id);
        }
      }
    }
  }, [initialData, isEdit, mereks]);

  // Sync / Match location ID when countries list finishes loading
  useEffect(() => {
    if (initialData && isEdit && countriesData?.data) {
      const rawStateId = initialData.state_id || initialData.state?.id || "";
      const rawStateName = initialData.state?.name || "";

      if (rawStateId) {
        setStateId(rawStateId);
      } else if (rawStateName) {
        for (const country of countriesData.data) {
          const items = country.states || country.cities || [];
          const found = items.find(
            (s: any) => s.name?.toLowerCase() === rawStateName.toLowerCase()
          );
          if (found) {
            setStateId(found.id);
            break;
          }
        }
      }
    }
  }, [initialData, isEdit, countriesData]);

  // Variant Helpers
  const addVariant = () => {
    setVariants((prev) => [...prev, ""]);
  };

  const updateVariant = (index: number, value: string) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const removeVariant = (index: number) => {
    if (variants.length <= 1) {
      setVariants([""]);
      return;
    }
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  // Find location label
  const locationLabel = useMemo(() => {
    if (!stateId || !countriesData?.data) return "";
    for (const country of countriesData.data) {
      const items = country.states || country.cities || [];
      const found = items.find((s: any) => s.id === stateId);
      if (found) {
        return `${found.name}, ${country.name}`;
      }
    }
    return "";
  }, [stateId, countriesData]);

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!enName.trim()) {
      toast.error("Motorcycle name (English) is required");
      setActiveLangTab("en");
      return;
    }

    if (!merekId) {
      toast.error("Please select a motorcycle brand");
      return;
    }

    if (!stateId) {
      toast.error("Please select a location");
      return;
    }

    if (!thumbnail.trim()) {
      toast.error("Thumbnail image URL is required");
      return;
    }

    const cleanVariants = variants
      .map((v) => v.trim())
      .filter((v) => v !== "");

    const numEngineCc = Number(engineCc) || 0;
    if (numEngineCc <= 0) {
      toast.error("Engine displacement (CC) is required");
      return;
    }

    const numDailyPrice = Number(dailyPrice) || 0;
    const numWeeklyPrice = Number(weeklyPrice) || 0;

    if (numDailyPrice <= 0) {
      toast.error("Daily rental price (USD) must be greater than zero");
      return;
    }

    const payload: any = {
      merek_id: merekId,
      state_id: stateId,
      engine_cc: numEngineCc,
      thumbnail: thumbnail.trim(),
      is_available: isAvailable,
      translations: [
        {
          language_code: "en",
          name_motor: enName.trim(),
          description: enDescription.trim() || enName.trim(),
        },
        {
          language_code: "id",
          name_motor: (idName.trim() || enName.trim()),
          description: (idDescription.trim() || enDescription.trim() || enName.trim()),
        },
        {
          language_code: "tr",
          name_motor: (trName.trim() || enName.trim()),
          description: (trDescription.trim() || enDescription.trim() || enName.trim()),
        },
      ],
      variants: cleanVariants.map((color) => ({ color })),
      prices: [
        {
          price_type: "daily",
          price: numDailyPrice,
        },
        ...(numWeeklyPrice > 0
          ? [
              {
                price_type: "weekly",
                price: numWeeklyPrice,
              },
            ]
          : []),
      ],
    };

    try {
      if (isEdit && initialData?.id) {
        await updateMotor({ id: initialData.id, data: payload }).unwrap();
        toast.success("Motorcycle updated successfully!");
      } else {
        await createMotor(payload).unwrap();
        toast.success("Motorcycle added successfully!");
      }
      router.push("/dashboard/services/rent-motor");
    } catch (err: any) {
      console.error("Failed to save motorcycle:", err);
      toast.error(err?.data?.message || "Failed to save motorcycle. Please verify input fields.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-12">
      {/* 1. Header Action Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-3.5 sm:px-5 sm:py-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-3">
          <Button
            asChild
            type="button"
            variant="outline"
            size="icon"
            className="size-8.5 text-slate-600 bg-white hover:bg-slate-100 border-slate-200 shadow-2xs">
            <Link href="/dashboard/services/rent-motor">
              <IconArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                Fleet Management
              </span>
              <Badge
                variant="outline"
                className={`text-[10px] font-semibold px-2 py-0.5 ${
                  isEdit
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}>
                {isEdit ? "Update Mode" : "New Vehicle"}
              </Badge>
            </div>
            <h1 className="text-xl font-bold text-slate-900 leading-snug pt-0.5">
              {isEdit ? `Edit Motorcycle: ${enName || "Details"}` : "Add New Motorcycle to Fleet"}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            asChild
            type="button"
            variant="outline"
            size="sm"
            className="h-8.5 text-xs font-semibold text-slate-700 border-slate-200 bg-white hover:bg-slate-50">
            <Link href="/dashboard/services/rent-motor">Cancel</Link>
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
                <span>{isEdit ? "Save Changes" : "Create Motorcycle"}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 2. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Localized Info, Color Variants, and Pricing (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Card 1: Localized Content (EN, ID, TR) */}
          <Card className="border-slate-200/80 shadow-xs bg-white py-0 gap-0 overflow-hidden">
            <CardHeader className="px-5 py-3.5 border-b border-slate-100 [.border-b]:pb-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                  <IconLanguage className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">
                    Vehicle Information & Overview
                  </CardTitle>
                  <CardDescription className="text-[11px] text-slate-500">
                    Provide localized names and descriptions for customer booking pages.
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

            <CardContent className="p-5 space-y-3.5">
              {/* 1. English Tab */}
              {activeLangTab === "en" && (
                <div className="space-y-3.5 animate-in fade-in-50 duration-150">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      Motorcycle Name (EN) <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      placeholder="e.g. Honda PCX 160cc ABS (2024)"
                      value={enName}
                      onChange={(e) => setEnName(e.target.value)}
                      className="h-9 text-xs bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      Description & Features (EN)
                    </Label>
                    <Textarea
                      placeholder="e.g. Premium maxi-scooter with smooth acceleration, keyless smart system, comfortable dual-seat, and large luggage trunk. Ideal for city tours and longer countryside rides."
                      value={enDescription}
                      onChange={(e) => setEnDescription(e.target.value)}
                      rows={3}
                      className="text-xs bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500 resize-y"
                    />
                  </div>
                </div>
              )}

              {/* 2. Indonesian Tab */}
              {activeLangTab === "id" && (
                <div className="space-y-3.5 animate-in fade-in-50 duration-150">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      Nama Motor (ID)
                    </Label>
                    <Input
                      placeholder="e.g. Honda PCX 160cc ABS (2024)"
                      value={idName}
                      onChange={(e) => setIdName(e.target.value)}
                      className="h-9 text-xs bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      Deskripsi & Keunggulan (ID)
                    </Label>
                    <Textarea
                      placeholder="e.g. Skuter matik premium dengan akselerasi halus, sistem smart key, bagasi luas, dan posisi berkendara ergonomis yang sangat nyaman untuk berkeliling."
                      value={idDescription}
                      onChange={(e) => setIdDescription(e.target.value)}
                      rows={3}
                      className="text-xs bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500 resize-y"
                    />
                  </div>
                </div>
              )}

              {/* 3. Turkish Tab */}
              {activeLangTab === "tr" && (
                <div className="space-y-3.5 animate-in fade-in-50 duration-150">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      Motosiklet Adı (TR)
                    </Label>
                    <Input
                      placeholder="e.g. Honda PCX 160cc ABS (2024)"
                      value={trName}
                      onChange={(e) => setTrName(e.target.value)}
                      className="h-9 text-xs bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      Açıklama & Özellikler (TR)
                    </Label>
                    <Textarea
                      placeholder="e.g. Şehir turları ve konforlu sürüş için ideal, anahtarsız akıllı çalıştırma sistemine ve geniş bagaj hacmine sahip premium maxi-scooter."
                      value={trDescription}
                      onChange={(e) => setTrDescription(e.target.value)}
                      rows={3}
                      className="text-xs bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500 resize-y"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 2: Color Variants */}
          <Card className="border-slate-200/80 shadow-xs bg-white py-0 gap-0 overflow-hidden">
            <CardHeader className="px-5 py-3.5 border-b border-slate-100 [.border-b]:pb-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-md bg-purple-50 text-purple-600">
                  <IconPalette className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">
                    Color Variants
                  </CardTitle>
                  <CardDescription className="text-[11px] text-slate-500">
                    Specify available color choices for this motorcycle model.
                  </CardDescription>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addVariant}
                className="h-7.5 text-xs font-semibold text-purple-700 border-purple-200 bg-purple-50/50 hover:bg-purple-100 gap-1 shadow-2xs">
                <IconPlus className="size-3.5" />
                Add Color
              </Button>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              <div className="space-y-2">
                {variants.map((color, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Input
                        placeholder="e.g. Matte Black, Pearl White, Candy Red"
                        value={color}
                        onChange={(e) => updateVariant(index, e.target.value)}
                        className="h-9 text-xs bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500"
                      />
                    </div>
                    {variants.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeVariant(index)}
                        className="size-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50">
                        <IconTrash className="size-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Preview Chips */}
              <div className="pt-2 flex flex-wrap items-center gap-1.5 border-t border-slate-100">
                <span className="text-[11px] font-medium text-slate-400 mr-1">Preview Chips:</span>
                {variants
                  .filter((v) => v.trim() !== "")
                  .map((v, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {v}
                    </span>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Rental Pricing Details */}
          <Card className="border-slate-200/80 shadow-xs bg-white py-0 gap-0 overflow-hidden">
            <CardHeader className="px-5 py-3.5 border-b border-slate-100 [.border-b]:pb-3.5 flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
                <IconCurrencyDollar className="size-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">
                  Rental Rates & Pricing
                </CardTitle>
                <CardDescription className="text-[11px] text-slate-500">
                  Set daily standard rate and optional discounted weekly pricing (USD).
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Daily Price */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    Daily Rate (USD) <span className="text-rose-500">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      $
                    </span>
                    <Input
                      type="number"
                      min={0}
                      step="any"
                      placeholder="0.00"
                      value={dailyPrice}
                      onChange={(e) => setDailyPrice(e.target.value)}
                      className="pl-8 h-9 text-xs font-mono font-bold bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">Standard rate per 24 hours.</p>
                </div>

                {/* Weekly Price */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Weekly Rate (USD) <span className="text-slate-400 font-normal">(Optional)</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      $
                    </span>
                    <Input
                      type="number"
                      min={0}
                      step="any"
                      placeholder="0.00"
                      value={weeklyPrice}
                      onChange={(e) => setWeeklyPrice(e.target.value)}
                      className="pl-8 h-9 text-xs font-mono font-bold bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">Discounted rate for 7 days rental.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Fleet Specification, Live Status, and Thumbnail (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Card 4: Vehicle Specification & Identification */}
          <Card className="border-slate-200/80 shadow-xs bg-white py-0 gap-0 overflow-hidden">
            <CardHeader className="px-5 py-3.5 border-b border-slate-100 [.border-b]:pb-3.5 flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                <IconEngine className="size-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">
                  Specifications & Brand
                </CardTitle>
                <CardDescription className="text-[11px] text-slate-500">
                  Brand registry, engine capacity, and rental location.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-3.5">
              {/* Brand Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    Brand / Manufacturer <span className="text-rose-500">*</span>
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMerekModalOpen(true)}
                    className="h-6 text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-1.5 gap-1 transition-colors">
                    <IconPlus className="size-3" />
                    <span>New Brand</span>
                  </Button>
                </div>
                <Select value={merekId || undefined} onValueChange={setMerekId}>
                  <SelectTrigger className="h-9 text-xs bg-slate-50/50 border-slate-200">
                    <SelectValue placeholder={isLoadingMereks ? "Loading brands..." : "Select Brand (e.g. Honda, Yamaha)"}>
                      {selectedBrandName}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {mereks.length === 0 && !isLoadingMereks ? (
                      <div className="py-2 px-3 text-xs text-slate-400 text-center">No brands available</div>
                    ) : (
                      mereks.map((m: any) => (
                        <SelectItem key={m.id} value={m.id} className="text-xs">
                          {m.name_merek}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Location Combobox */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  Base Location (City, Country) <span className="text-rose-500">*</span>
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
                      <span className="truncate">{locationLabel || "Search & select city location..."}</span>
                      <IconSelector className="size-4 text-slate-400 shrink-0 ml-1" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[320px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search city or country..." className="h-8.5 text-xs" />
                      <CommandList className="max-h-60 overflow-y-auto">
                        <CommandEmpty className="py-2 text-center text-xs text-slate-500">
                          No location found.
                        </CommandEmpty>
                        {countriesData?.data?.map((country) => (
                          <CommandGroup key={country.id} heading={country.name} className="text-xs font-bold">
                            {(country.states || country.cities || []).map((state: any) => (
                              <CommandItem
                                key={state.id}
                                value={`${state.name}, ${country.name}`}
                                onSelect={() => {
                                  setStateId(state.id);
                                  setOpenLocationCombobox(false);
                                }}
                                className="text-xs cursor-pointer">
                                <IconCheck
                                  className={cn(
                                    "mr-2 size-3.5 text-blue-600",
                                    state.id === stateId ? "opacity-100" : "opacity-0"
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
              </div>

              {/* Engine CC */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  Engine Displacement (CC) <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    min={50}
                    max={2000}
                    placeholder="e.g. 150"
                    value={engineCc}
                    onChange={(e) => setEngineCc(e.target.value)}
                    className="h-9 text-xs font-mono font-semibold bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500 pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                    cc
                  </span>
                </div>
              </div>

              {/* Availability Toggle */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/60">
                <div className="space-y-0.5">
                  <Label htmlFor="available-toggle" className="text-xs font-bold text-slate-900 cursor-pointer">
                    Live Rental Availability
                  </Label>
                  <p className="text-[10px] text-slate-500">
                    {isAvailable ? "Ready for bookings & dispatch" : "Marked as unavailable / under maintenance"}
                  </p>
                </div>
                <Switch
                  id="available-toggle"
                  checked={isAvailable}
                  onCheckedChange={setIsAvailable}
                  className="data-[state=checked]:bg-emerald-600"
                />
              </div>
            </CardContent>
          </Card>

          {/* Card 5: Media & Thumbnail Image */}
          <Card className="border-slate-200/80 shadow-xs bg-white py-0 gap-0 overflow-hidden">
            <CardHeader className="px-5 py-3.5 border-b border-slate-100 [.border-b]:pb-3.5 flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-amber-50 text-amber-600">
                <IconPhoto className="size-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">
                  Vehicle Visuals & Thumbnail
                </CardTitle>
                <CardDescription className="text-[11px] text-slate-500">
                  High resolution vehicle photo for catalog listings.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-3.5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  Thumbnail Image URL <span className="text-rose-500">*</span>
                </Label>
                <Input
                  placeholder="https://images.unsplash.com/... or cloud storage URL"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  className="h-9 text-xs bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500"
                />
              </div>

              {/* Real-time Image Preview */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600">Visual Preview</Label>
                <div className="relative aspect-video w-full rounded-lg border border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center">
                  {thumbnail.trim() ? (
                    <img
                      src={thumbnail}
                      alt={enName || "Motor Preview"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&q=80";
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 gap-1 p-4">
                      <IconPhoto className="size-8 stroke-[1.5]" />
                      <span className="text-xs font-medium">Enter a valid image URL to preview</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Add Brand Modal */}
      <MerekModal
        isOpen={isMerekModalOpen}
        onClose={() => setIsMerekModalOpen(false)}
        onSubmit={handleCreateBrand}
        title="Add New Motorcycle Brand"
      />
    </form>
  );
}
