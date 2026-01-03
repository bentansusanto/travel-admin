"use client";

import { Input } from "@/components/ui/input";
import { page_routes } from "@/lib/routes-config";
import { CommandIcon, SearchIcon, icons } from "lucide-react";
import React, { useEffect, useState } from "react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from "@/components/ui/command";
import { useGetUserQuery } from "@/store/services/auth.service";
import { useRouter } from "next/navigation";

type CommandItemProps = {
  item: {
    title: string;
    href: string;
    icon?: string;
  };
};

export default function Search() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { data: userData } = useGetUserQuery({});
  const userRole = userData?.data?.role?.code || "guest";

  const filteredRoutes = page_routes
    .map((route) => ({
      ...route,
      items: route.items.filter((item) => {
        if (!item.roles) return true;
        return item.roles.includes(userRole);
      })
    }))
    .filter((route) => route.items.length > 0);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const CommandItemComponent: React.FC<CommandItemProps> = ({ item }) => {
    // @ts-expect-error
    const LucideIcon = icons[item.icon];

    return (
      <CommandItem
        onSelect={() => {
          setOpen(false);
          router.push(item.href);
        }}>
        {item.icon && <LucideIcon className="me-2 !h-4 !w-4" />}
        <span>{item.title}</span>
      </CommandItem>
    );
  };

  return (
    <div>
      <div className="relative max-w-sm flex-1">
        <SearchIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-500 dark:text-neutral-400" />
        <Input
          className="bg-muted h-9 w-full cursor-pointer rounded-md border pr-4 pl-10 text-sm shadow-sm"
          placeholder="Search..."
          type="search"
          onFocus={() => setOpen(true)}
        />
        <div className="absolute top-1/2 right-2 hidden -translate-y-1/2 items-center gap-0.5 rounded-sm bg-zinc-200 p-1 font-mono text-xs font-medium sm:flex dark:bg-neutral-700">
          <CommandIcon className="h-3 w-3" />
          <span>k</span>
        </div>
      </div>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {filteredRoutes.map((route) => (
            <React.Fragment key={route.title}>
              <CommandGroup heading={route.title}>
                {route.items.map((item, key) => (
                  <CommandItemComponent key={key} item={item} />
                ))}
              </CommandGroup>
              <CommandSeparator />
            </React.Fragment>
          ))}
        </CommandList>
      </CommandDialog>
    </div>
  );
}
