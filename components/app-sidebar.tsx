"use client";

import {
  IconChartBar,
  IconCurrencyDollar,
  IconDashboard,
  IconHotelService,
  IconInnerShadowTop,
  IconListDetails,
  IconUsers
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";
import { usePermission } from "@/hooks/usePermission";

export const appMenu = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
      roles: ["owner", "admin", "developer"]
    },
    {
      title: "Services",
      url: "#",
      icon: IconHotelService,
      roles: ["owner", "admin", "developer"],
      items: [
        {
          title: "Tour Holiday & Religion",
          url: "/dashboard/services/tour-religion"
        },
        {
          title: "Flight",
          url: "/dashboard/services/flight"
        },
        {
          title: "Hotels",
          url: "/dashboard/services/hotels"
        },
        {
          title: "Document & Visa",
          url: "/dashboard/services/document-visa"
        },
        {
          title: "Rent Motor",
          url: "/dashboard/services/rent-motor"
        },
        {
          title: "Entertainment & Attractions",
          url: "/dashboard/services/entertainment-attractions"
        },
        {
          title: "Bus & Shuttle",
          url: "/dashboard/services/bus-shuttle"
        },
        {
          title: "Health & Tourism",
          url: "/dashboard/services/health-tourism"
        },
        {
          title: "Add ons",
          url: "/dashboard/services/add-ons"
        }
      ]
    },
    {
      title: "User Management",
      url: "/dashboard/users",
      icon: IconUsers,
      roles: ["owner", "admin", "developer"]
    },
    {
      title: "Orders",
      url: "/dashboard/orders",
      icon: IconCurrencyDollar,
      roles: ["owner", "admin", "developer"]
    },
    {
      title: "Sales Report",
      url: "/dashboard/sales-report",
      icon: IconChartBar,
      roles: ["owner"]
    },
    {
      title: "Customers",
      url: "/dashboard/customers",
      icon: IconListDetails,
      roles: ["owner", "admin", "guide"]
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: IconInnerShadowTop,
      roles: ["owner", "admin", "guide"]
    }
  ]
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { hasRole } = usePermission();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const filteredNavMain = React.useMemo(() => {
    if (!mounted) return appMenu.navMain;
    return appMenu.navMain.filter((item: any) => {
      if (!item.roles) return true;
      return hasRole(...item.roles);
    });
  }, [mounted, hasRole]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" className="data-[slot=sidebar-menu-button]:!p-1.5 hover:bg-transparent">
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
                  <Image
                    src="/images/logo-pacific-travelindo.svg"
                    width={22}
                    height={22}
                    className="size-5 brightness-0 invert"
                    alt="Pacific Travelindo Logo"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold text-slate-900">Pacific Travelindo</span>
                  <span className="truncate text-xs text-slate-500 font-medium">Admin Portal</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
