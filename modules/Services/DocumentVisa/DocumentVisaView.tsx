"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  VisaItem,
  useFindAllVisasQuery,
} from "@/store/services/visa.service";
import {
  IconCurrencyDollar,
  IconFileCertificate,
  IconFlag,
  IconPlus,
} from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import React, { useMemo } from "react";
import VisaDataTable from "./DataTable";

export default function DocumentVisaView() {
  const {
    data: visasData,
    isLoading,
    isError,
    refetch,
  } = useFindAllVisasQuery();

  const visas: VisaItem[] = useMemo(() => {
    return visasData?.data || [];
  }, [visasData]);

  // KPI Metrics
  const totalVisas = visas.length;
  const uniqueCountries = useMemo(() => {
    const set = new Set(visas.map((v) => v.country_name));
    return set.size;
  }, [visas]);
  const avgPrice = useMemo(() => {
    if (totalVisas === 0) return 0;
    const sum = visas.reduce((acc, curr) => acc + (curr.price || 0), 0);
    return sum / totalVisas;
  }, [visas, totalVisas]);

  return (
    <div className="space-y-4">
      {/* 1. Header & Create Action */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 uppercase tracking-wider">
            <IconFileCertificate className="size-3.5" />
            <span>Immigration & Document Services</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Document & Visa
          </h1>
          <p className="text-xs text-slate-500">
            Manage international visa assistance, document translations, embassy appointments, and processing packages.
          </p>
        </div>

        <Button
          asChild
          size="sm"
          className="h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold gap-1.5 shadow-sm hover:shadow-md transition-all self-start sm:self-auto">
          <Link href="/dashboard/services/document-visa/create">
            <IconPlus className="size-4" />
            <span>New Visa Service</span>
          </Link>
        </Button>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <IconFileCertificate className="size-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Total Visa Services</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{totalVisas}</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="flex size-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
            <IconFlag className="size-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Destination Countries</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{uniqueCountries} Countries</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <IconCurrencyDollar className="size-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Average Service Fee</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              ${avgPrice.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main Content / Data Table Container */}
      <Card className="border-slate-200/80 shadow-xs bg-white py-0 gap-0 overflow-hidden">
        <CardContent className="p-3.5 sm:p-5">
          {isLoading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-2.5 text-slate-500">
              <Loader2 className="size-7 animate-spin text-blue-600" />
              <p className="text-xs font-medium">Loading visa services directory...</p>
            </div>
          ) : isError ? (
            <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
              <p className="text-sm font-bold text-slate-900">Failed to load visa services</p>
              <p className="text-xs text-slate-500 max-w-sm">
                There was a problem retrieving data. Please verify your connection or reload.
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
            <VisaDataTable data={visas} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
