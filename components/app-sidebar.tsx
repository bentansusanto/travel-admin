"use client";

import {
  IconChartBar,
  IconDashboard,
  IconHotelService,
  IconInnerShadowTop,
  IconListDetails,
  IconUsers
} from "@tabler/icons-react";
import * as React from "react";

import { NavMain } from "@/components/nav-main";
// import { NavSecondary } from "@/components/nav-secondary";
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
import { useGetUserQuery } from "@/store/services/auth.service";
import { BadgeDollarSign } from "lucide-react";

export const appMenu = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
      roles: ["owner", "admin"]
    },
    {
      title: "Services",
      url: "#",
      icon: IconHotelService,
      roles: ["owner", "admin"],
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
      ]
    },
    {
      title: "Users",
      url: "/dashboard/users",
      icon: IconUsers,
      roles: ["owner", "admin"]
    },
    {
      title: "Orders",
      url: "/dashboard/orders",
      icon: BadgeDollarSign,
      roles: ["owner"]
    },
    {
      title: "Sales Report",
      url: "/dashboard/sales-report",
      icon: IconChartBar,
      roles: ["owner"]
    },
    {
      title: "Tour Orders",
      url: "/dashboard/tours",
      icon: IconListDetails,
      roles: ["owner", "admin", "guide"]
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: IconInnerShadowTop,
      roles: ["owner", "admin", "guide"]
    }
    // {
    //   title: "Login",
    //   url: "/login",
    //   icon: IconFolder,
    //   roles: ["owner", "admin"]
    // },
    // {
    //   title: "Register",
    //   url: "/register",
    //   icon: IconUsers,
    //   roles: ["owner", "admin"]
    // }
  ]
  // navSecondary: [
  //   {
  //     title: "Get Pro",
  //     url: "https://shadcnuikit.com/pricing",
  //     icon: IconCircle
  //   },
  //   {
  //     title: "Shadcn UI Kit",
  //     url: "https://shadcnuikit.com/",
  //     icon: IconCircle
  //   },
  //   {
  //     title: "Bundui Component",
  //     url: "https://bundui.io",
  //     icon: IconCircle
  //   }
  // ]
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: userData } = useGetUserQuery({});
  const userRole = userData?.data?.role?.code || "guest";

  const filteredNavMain = appMenu.navMain.filter((item: any) => {
    if (!item.roles) return true;
    return item.roles.includes(userRole);
  });

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="#">
                <img
                  src="https://shadcnuikit.com/logo.png"
                  className="size-6 rounded-sm group-data-[collapsible=icon]:size-5"
                  alt="shadcn ui kit svg logo"
                />
                <span className="text-base font-medium">Shadcn UI Kit</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
