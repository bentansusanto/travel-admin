"use client";

import { Button } from "@/components/ui/button";
import {
  AttractionItem,
  useFindAllEntertainmentsQuery,
} from "@/store/services/entertainment.service";
import {
  IconBuildingCarousel,
  IconCategory,
  IconCurrencyDollar,
  IconPlus,
  IconTicket,
} from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import React, { useMemo } from "react";
import AttractionsDataTable from "./DataTable";

export default function EntertainmentAttractionsView() {
  const {
    data: entertainmentsData,
    isLoading,
    isError,
    refetch,
  } = useFindAllEntertainmentsQuery();

  const formattedData: AttractionItem[] = useMemo(() => {
    return entertainmentsData?.data || (entertainmentsData as any)?.datas || [];
  }, [entertainmentsData]);

  // KPI Metrics
  const totalAttractions = formattedData.length;
  const uniqueCategories = useMemo(() => {
    const set = new Set(
      formattedData.map(
        (d) =>
          d.category_destination_name ||
          d.category ||
          (d as any)?.category_destination?.name ||
          "General"
      )
    );
    return set.size;
  }, [formattedData]);

  const avgPrice = useMemo(() => {
    if (totalAttractions === 0) return 0;
    const sum = formattedData.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
    return sum / totalAttractions;
  }, [formattedData, totalAttractions]);

  return (
    <div className="space-y-4">
      {/* 1. Header & Create Action */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 uppercase tracking-wider">
            <IconBuildingCarousel className="size-3.5" />
            <span>Attractions & Experience Services</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Entertainment & Attractions
          </h1>
          <p className="text-xs text-slate-500">
            Manage theme park admissions, cultural attractions, adventure activities, and ticket packages.
          </p>
        </div>

        <Button
          asChild
          size="sm"
          className="h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold gap-1.5 shadow-sm hover:shadow-md transition-all self-start sm:self-auto">
          <Link href="/dashboard/services/entertainment-attractions/create">
            <IconPlus className="size-4" />
            <span>New Attraction</span>
          </Link>
        </Button>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <IconTicket className="size-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Total Listed Attractions</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{totalAttractions}</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="flex size-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
            <IconCategory className="size-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Attraction Categories</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{uniqueCategories}</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <IconCurrencyDollar className="size-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Average Ticket Price</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              ${avgPrice.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main Data Table & Toolbar (handled inside DataTable with decoupled clean cards) */}
      {isLoading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2.5 text-slate-500 rounded-xl border border-slate-200/80 bg-white">
          <Loader2 className="size-7 animate-spin text-blue-600" />
          <p className="text-xs font-medium">Loading attractions catalogue...</p>
        </div>
      ) : isError ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2 text-center rounded-xl border border-slate-200/80 bg-white p-6">
          <p className="text-sm font-bold text-slate-900">Failed to load attractions</p>
          <p className="text-xs text-slate-500 max-w-sm">
            There was a problem retrieving data from the backend. Please verify your connection or retry.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="mt-2 h-8 text-xs font-semibold">
            Retry Loading
          </Button>
        </div>
      ) : (
        <AttractionsDataTable data={formattedData} />
      )}
    </div>
  );
}
