"use client";

import { type Icon } from "@tabler/icons-react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from "@/components/ui/sidebar";

export function NavMain({
  items
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {
            const hasChildren = Boolean(item.items && item.items.length > 0);

            const isItemActive =
              item.url === pathname ||
              (item.url !== "#" && item.url !== "/dashboard" && pathname.startsWith(item.url));

            const hasActiveChild = hasChildren && item.items?.some(
              (sub) => sub.url === pathname || pathname.startsWith(sub.url + "/")
            );

            const isOpen = isItemActive || hasActiveChild || item.isActive;

            if (hasChildren) {
              return (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={isOpen}
                  className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        isActive={hasActiveChild}
                        className="data-[active=true]:bg-blue-50 data-[active=true]:text-blue-600 data-[active=true]:font-semibold hover:bg-slate-100 hover:text-slate-900 transition-colors">
                        {item.icon && <item.icon className="size-4" />}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items!.map((subItem) => {
                          const isSubActive =
                            pathname === subItem.url ||
                            pathname.startsWith(subItem.url + "/") ||
                            (subItem.url === "/dashboard/services/rent-car" &&
                              pathname.startsWith("/dashboard/services/rental-mobil"));
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isSubActive}
                                className="data-[active=true]:text-blue-600 data-[active=true]:font-semibold hover:text-slate-900">
                                <Link href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            }

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={isItemActive}
                  asChild
                  className="data-[active=true]:bg-blue-50 data-[active=true]:text-blue-600 data-[active=true]:font-semibold hover:bg-slate-100 hover:text-slate-900 transition-colors">
                  <Link href={item.url}>
                    {item.icon && <item.icon className="size-4" />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
