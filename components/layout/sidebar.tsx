import Link from "next/link";
import { Fragment } from "react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { page_routes } from "@/lib/routes-config";
import { useGetUserQuery } from "@/store/services/auth.service";
import { ChevronDown, LockIcon } from "lucide-react";
import Anchor from "../anchor";
import Icon from "../icon";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import Logo from "./logo";

type SidebarNavLinkProps = {
  item: {
    title: string;
    href: string;
    icon?: string;
    isComing?: boolean;
    roles?: string[];
  };
};

export const SidebarNavLink: React.FC<SidebarNavLinkProps> = ({ item }: SidebarNavLinkProps) => {
  return (
    <Anchor
      href={item.href}
      key={item.title + item.href}
      activeClassName="!bg-primary text-primary-foreground">
      {item.icon && <Icon name={item.icon} className="h-4 w-4" />}
      {item.title}
      {item.isComing && (
        <Badge className="ms-auto opacity-50" variant="outline">
          Coming
        </Badge>
      )}
    </Anchor>
  );
};

export default function Sidebar() {
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

  return (
    <div className="fixed hidden h-screen lg:block">
      <ScrollArea className="bg-background h-full w-[--sidebar-width] border-r px-4">
        <Logo />
        {filteredRoutes.map((route) => (
          <Fragment key={route.title}>
            <div className="px-2 py-4 font-medium">{route.title}</div>
            <div className="hover:*:bg-muted *:flex *:items-center *:gap-3 *:rounded-lg *:px-3 *:py-2 *:transition-all">
              {route.items.map((item, key) => {
                return (
                  <Fragment key={item.title}>
                    {item.items?.length ? (
                      <Collapsible className="group !block transition-all hover:data-[state=open]:bg-transparent">
                        <CollapsibleTrigger className="flex w-full items-center gap-3">
                          {item.icon && <Icon name={item.icon} className="h-4 w-4" />}
                          {item.title}
                          <ChevronDown className="ms-auto h-4 w-4 transition-transform group-data-[state=closed]:rotate-90" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden">
                          <div className="hover:*:bg-muted py-2 *:flex *:items-center *:gap-3 *:rounded-lg *:px-7 *:py-2 *:transition-all">
                            {item.items.map((item, key) => (
                              <SidebarNavLink key={key} item={item} />
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                      <SidebarNavLink key={key} item={item} />
                    )}
                  </Fragment>
                );
              })}
            </div>
          </Fragment>
        ))}
        <div className="sticky bottom-0 mt-10 pb-4">
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
      </ScrollArea>
    </div>
  );
}
