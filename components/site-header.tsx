"use client";

import { appMenu } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

export function SiteHeader() {
  const pathname = usePathname();

  const activeTitle = useMemo(() => {
    const findTitle = (items: any[]): string | null => {
      for (const item of items) {
        if (item.url === pathname) return item.title;
        if (item.items) {
          const subTitle = findTitle(item.items);
          if (subTitle) return subTitle;
        }
      }
      return null;
    };
    return findTitle(appMenu.navMain) || "Dashboard";
  }, [pathname]);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <h1 className="text-base font-medium">{activeTitle}</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button asChild size="sm" className="hidden sm:flex">
            <Link
              href="https://shadcnuikit.com/"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground">
              Get Pro
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
