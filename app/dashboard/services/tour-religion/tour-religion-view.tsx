"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useFindAllDestinationsWithTranslationQuery } from "@/store/services/destination.service";
import {
  IconCompass,
  IconCurrencyDollar,
  IconMapPin,
  IconPackage,
  IconPlus
} from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import TourReligionDataTable, { TourReligion as TourService } from "./data-table";

export default function TourReligionView() {
  const { data: destinationsData, isLoading, error } = useFindAllDestinationsWithTranslationQuery();

  const data: TourService[] = useMemo(() => {
    if (!destinationsData?.data) return [];

    return destinationsData.data.map((dest) => {
      // Prioritize English translation, fallback to first available
      const translations = dest.translations || [];
      const translation =
        translations.find((t) => t.language_code === "en") ||
        translations.find((t) => t.language_code === "id") ||
        translations[0];

      return {
        id: dest.id || "",
        state_id: dest.state_id,
        category_destination_id: dest.category_destination_id,
        name: translation?.name || "Untitled Tour Package",
        category: dest.category_destination_name || "Religious Tour",
        price: dest.price || 0,
        location: dest.location || "Indonesia",
        status: "active",
        createdAt: translation?.createdAt || new Date().toISOString(),
        description: translation?.description,
        thumbnail: dest.thumbnail || (dest.images && dest.images.length > 0 ? dest.images[0] : "") || translation?.thumbnail || "",
        images: dest.images || translation?.image || [],
        highlights: translation?.detail_tour || [],
        facilities: translation?.facilities || [],
        translations: translations
      };
    });
  }, [destinationsData]);

  // Quick statistics
  const totalPackages = data.length;
  const avgPrice = useMemo(() => {
    if (!data.length) return 0;
    const total = data.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
    return total / data.length;
  }, [data]);

  const uniqueCategories = useMemo(() => {
    return new Set(data.map((d) => d.category)).size;
  }, [data]);

  return (
    <div className="space-y-4">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 uppercase tracking-wider">
            <IconCompass className="size-3.5" />
            <span>Tour & Destination Packages</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Religious & Pilgrimage Tours
          </h1>
          <p className="text-xs text-slate-500">
            Manage Umrah, Hajj Plus, Holy Land, and spiritual heritage tour packages.
          </p>
        </div>

        <Button
          asChild
          size="sm"
          className="h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold gap-1.5 shadow-sm hover:shadow-md transition-all w-fit">
          <Link href="/dashboard/services/tour-religion/create">
            <IconPlus className="size-4" />
            Add Tour Package
          </Link>
        </Button>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <IconPackage className="size-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Total Tour Packages</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{totalPackages}</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <IconCurrencyDollar className="size-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Average Base Price</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(avgPrice)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="flex size-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
            <IconMapPin className="size-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Active Categories</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{uniqueCategories} Categories</p>
          </div>
        </div>
      </div>

      {/* 3. Main Data Table Card */}
      <Card className="border-slate-200/80 shadow-xs bg-white py-0 gap-0 overflow-hidden">
        <CardContent className="p-4 sm:p-5">
          {isLoading ? (
            <div className="flex h-56 flex-col items-center justify-center gap-2.5 text-slate-500">
              <Loader2 className="size-7 animate-spin text-blue-600" />
              <p className="text-xs font-medium">Loading tour packages...</p>
            </div>
          ) : error ? (
            <div className="flex h-56 flex-col items-center justify-center gap-2 text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-rose-50 text-rose-600 mb-1">
                <IconPackage className="size-5" />
              </div>
              <p className="text-sm font-bold text-slate-900">Failed to load tour packages</p>
              <p className="text-xs text-slate-500 max-w-sm">
                Unable to retrieve destinations data from the server. Please check your connection and try again.
              </p>
            </div>
          ) : data.length === 0 ? (
            <div className="flex h-56 flex-col items-center justify-center gap-2.5 text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-1">
                <IconPackage className="size-5" />
              </div>
              <p className="text-sm font-bold text-slate-900">No tour packages found</p>
              <p className="text-xs text-slate-500 max-w-sm">
                Get started by creating your first pilgrimage or spiritual tour package.
              </p>
              <Button
                asChild
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold gap-1.5 mt-1">
                <Link href="/dashboard/services/tour-religion/create">
                  <IconPlus className="size-3.5" />
                  Add New Tour
                </Link>
              </Button>
            </div>
          ) : (
            <TourReligionDataTable data={data} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
