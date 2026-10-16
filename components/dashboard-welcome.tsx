"use client";

import { Button } from "@/components/ui/button";
import { useGetUserQuery } from "@/store/services/auth.service";
import { IconCalendarEvent, IconDownload, IconPlus } from "@tabler/icons-react";
import Link from "next/link";

export function DashboardWelcome() {
  const { data: userData } = useGetUserQuery({});
  const name = userData?.data?.name || "Admin";

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
          <IconCalendarEvent className="size-4" />
          <span>{today}</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
          Welcome back, {name} 👋
        </h1>
        <p className="text-sm text-slate-500">
          Here is your executive business summary, fleet status, and booking performance overview.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="h-10 text-xs font-semibold text-slate-700 hover:bg-slate-50 gap-1.5 shadow-2xs">
          <IconDownload className="size-4 text-slate-500" />
          Export Report
        </Button>
        <Button asChild size="sm" className="h-10 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold gap-1.5 shadow-sm hover:shadow-md transition-all">
          <Link href="/dashboard/orders">
            <IconPlus className="size-4" />
            New Booking
          </Link>
        </Button>
      </div>
    </div>
  );
}
