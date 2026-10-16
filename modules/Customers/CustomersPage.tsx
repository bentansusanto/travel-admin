"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CustomerItem,
  useFindAllCustomersQuery,
} from "@/store/services/customer.service";
import {
  IconCheck,
  IconClock,
  IconRoute,
  IconUserCheck,
  IconUserExclamation,
  IconUserHeart,
  IconUsers,
} from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import React, { useMemo } from "react";
import { CustomersDataTable } from "./CustomersDataTable";

export function CustomersPage() {
  const { data: customersData, isLoading, isError, error, refetch } = useFindAllCustomersQuery();

  const customers: CustomerItem[] = useMemo(() => {
    return customersData?.data || [];
  }, [customersData]);

  // Summary Metrics
  const totalCustomers = customers.length;
  const verifiedCustomers = useMemo(() => {
    return customers.filter((c) => c.is_verified).length;
  }, [customers]);
  const pendingCustomers = totalCustomers - verifiedCustomers;
  const totalBookers = useMemo(() => {
    return customers.reduce((acc, curr) => acc + (curr.bookersCount || curr.bookers?.length || 0), 0);
  }, [customers]);

  return (
    <div className="space-y-4">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 uppercase tracking-wider">
            <IconUserHeart className="size-3.5" />
            <span>Customer Directory & CRM</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Customers & Travelers
          </h1>
          <p className="text-xs text-slate-500">
            View registered customers, manage account verifications, and inspect traveler profiles.
          </p>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <IconUsers className="size-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Total Registered Customers</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{totalCustomers}</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <IconUserCheck className="size-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Verified Accounts</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{verifiedCustomers}</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="flex size-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
            <IconRoute className="size-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Saved Booker Profiles</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{totalBookers} Profiles</p>
          </div>
        </div>
      </div>

      {/* 3. Main Data Table Container */}
      {isLoading ? (
        <Card className="border-slate-200/80 shadow-xs bg-white py-0 gap-0 overflow-hidden">
          <CardContent className="p-8">
            <div className="flex h-56 flex-col items-center justify-center gap-2.5 text-slate-500">
              <Loader2 className="size-7 animate-spin text-blue-600" />
              <p className="text-xs font-medium">Loading customers directory...</p>
            </div>
          </CardContent>
        </Card>
      ) : isError ? (
        <Card className="border-slate-200/80 shadow-xs bg-white py-0 gap-0 overflow-hidden">
          <CardContent className="p-8">
            <div className="flex h-56 flex-col items-center justify-center gap-2 text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-rose-50 text-rose-600 mb-1">
                <IconUserExclamation className="size-5" />
              </div>
              <p className="text-sm font-bold text-slate-900">Failed to load customers</p>
              <p className="text-xs text-slate-500 max-w-sm">
                Unable to retrieve customer data from the server. Please check your connection or reload.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="mt-2 h-8 text-xs font-semibold">
                Retry Loading
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <CustomersDataTable customers={customers} />
      )}
    </div>
  );
}
