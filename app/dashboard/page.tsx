import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DashboardRecentOrders } from "@/components/dashboard-recent-orders";
import { DashboardTopDestinations } from "@/components/dashboard-top-destinations";
import { DashboardUpcomingTours } from "@/components/dashboard-upcoming-tours";
import { DashboardWelcome } from "@/components/dashboard-welcome";
import { SectionCards } from "@/components/section-cards";

import { generateMeta } from "@/lib/utils";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "Executive Dashboard",
    description: "Pacific Travelindo - Business Overview & Operations Dashboard",
  });
}

export default function Page() {
  return (
    <div className="space-y-6">
      {/* 1. Header & Welcome Bar */}
      <DashboardWelcome />

      {/* 2. Executive Travel KPI Cards */}
      <SectionCards />

      {/* 3. Passenger Volume & Traffic Analytics Chart */}
      <ChartAreaInteractive />

      {/* 4. Operational Insights Grid (Top Packages & Live Departures) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DashboardTopDestinations />
        <DashboardUpcomingTours />
      </div>

      {/* 5. Live Booking Transactions & Orders */}
      <DashboardRecentOrders />
    </div>
  );
}
