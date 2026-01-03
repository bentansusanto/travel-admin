type PageRoutesType = {
  title: string;
  items: PageRoutesItemType;
};

type PageRoutesItemType = {
  title: string;
  href: string;
  icon?: string;
  isComing?: boolean;
  roles?: string[];
  items?: PageRoutesItemType;
}[];

export const page_routes: PageRoutesType[] = [
  {
    title: "Menu",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: "PieChart",
        roles: ["owner", "admin", "guide"]
      },
      {
        title: "Users",
        href: "/dashboard/pages/users",
        icon: "Users",
        roles: ["owner", "admin"]
      },
      {
        title: "Sales Report",
        href: "/dashboard/sales",
        icon: "ChartBar",
        roles: ["owner"]
      },
      {
        title: "Tour Orders",
        href: "/dashboard/tours",
        icon: "ListDetails",
        roles: ["owner", "admin", "guide"]
      },
      {
        title: "Settings",
        href: "/dashboard/pages/settings",
        icon: "Settings",
        roles: ["owner", "admin", "guide"]
      },
      {
        title: "Authentication",
        href: "/",
        icon: "Fingerprint",
        roles: ["owner", "admin"],
        items: [
          { title: "Login", href: "/login" },
          { title: "Register", href: "/register" }
        ]
      },
      {
        title: "Error Pages",
        href: "/",
        icon: "Fingerprint",
        roles: ["owner", "admin", "guide"],
        items: [
          { title: "404", href: "/pages/error/404" },
          { title: "500", href: "/pages/error/500" }
        ]
      }
    ]
  }
];
