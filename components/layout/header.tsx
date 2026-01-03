import { appMenu } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useGetUserQuery } from "@/store/services/auth.service";
import { LockIcon, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useMemo } from "react";
import Logo from "./logo";
import Search from "./search";
import { SidebarNavLink } from "./sidebar";

export default function Header() {
  const { data: userData } = useGetUserQuery({});
  const userRole = userData?.data?.role?.code || "guest";
  const pathname = usePathname();

  const filteredRoutes = useMemo(() => {
    return appMenu.navMain.filter((item: any) => {
      if (!item.roles) return true;
      return item.roles.includes(userRole);
    });
  }, [userRole]);

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
    return findTitle(filteredRoutes) || "Dashboard";
  }, [pathname, filteredRoutes]);

  return (
    <div className="sticky top-0 z-50 flex flex-col">
      <header className="bg-background flex h-14 items-center gap-4 border-b px-4 lg:h-[60px]">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 lg:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col overflow-auto">
            <Logo className="px-0" />
            <nav className="grid gap-2 text-lg font-medium">
              {filteredRoutes.map((item: any) => (
                <Fragment key={item.title}>
                  {item.items ? (
                    <>
                      <div className="px-2 py-4 font-medium">{item.title}</div>
                      <nav className="hover:*:bg-muted *:flex *:items-center *:gap-3 *:rounded-lg *:px-3 *:py-2 *:transition-all">
                        {item.items.map((subItem: any, key: number) => (
                          <SidebarNavLink
                            key={key}
                            item={{
                              title: subItem.title,
                              href: subItem.url,
                              roles: item.roles
                            }}
                          />
                        ))}
                      </nav>
                    </>
                  ) : (
                    <nav className="hover:*:bg-muted *:flex *:items-center *:gap-3 *:rounded-lg *:px-3 *:py-2 *:transition-all">
                      <SidebarNavLink
                        item={{
                          title: item.title,
                          href: item.url,
                          icon: item.icon,
                          roles: item.roles
                        }}
                      />
                    </nav>
                  )}
                </Fragment>
              ))}
            </nav>
            <div className="mt-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Get Shadcn UI Kit Pro</CardTitle>
                  <CardDescription>
                    Need more pages and components? Then you can get the pro.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    size="sm"
                    className="w-full items-center bg-gradient-to-r from-indigo-700 via-purple-500 to-pink-700 hover:opacity-90"
                    asChild>
                    <Link href="https://shadcnuikit.com/pricing" target="_blank">
                      <LockIcon className="me-2 h-4 w-4" /> Get Pro
                    </Link>
                  </Button>
                  <Button size="sm" className="w-full" variant="outline" asChild>
                    <Link href="https://shadcnuikit.com/" target="_blank">
                      Learn More
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex flex-1 items-center gap-4">
          <h1 className="text-lg font-semibold md:text-xl">{activeTitle}</h1>
          <div className="ml-auto hidden w-full max-w-sm md:block">
            <Search />
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <figure className="cursor-pointer">
              <img src={`/images/avatars/1.png`} className="h-10 w-10" alt="..." />
            </figure>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
    </div>
  );
}
