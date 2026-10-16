import {
  IconBus,
  IconCurrencyDollar,
  IconStar,
  IconTicket,
  IconTrendingDown,
  IconTrendingUp,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SectionCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Gross Revenue */}
      <Card className="@container/card border-slate-200/80 shadow-xs bg-white hover:border-blue-200 transition-colors">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardDescription className="text-slate-500 font-medium">Total Gross Revenue</CardDescription>
            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <IconCurrencyDollar className="size-4.5" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tabular-nums text-slate-900 @[250px]/card:text-3xl mt-1">
            Rp 248.5M
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold gap-1 text-xs">
              <IconTrendingUp className="size-3.5" />
              +18.4%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            <span>Rp 38.2M incoming this week</span>
          </div>
          <div className="text-slate-400">Vs previous month (Rp 210.3M)</div>
        </CardFooter>
      </Card>

      {/* 2. Total Bookings */}
      <Card className="@container/card border-slate-200/80 shadow-xs bg-white hover:border-blue-200 transition-colors">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardDescription className="text-slate-500 font-medium">Total Bookings & Pax</CardDescription>
            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <IconTicket className="size-4.5" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tabular-nums text-slate-900 @[250px]/card:text-3xl mt-1">
            342 Orders
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold gap-1 text-xs">
              <IconTrendingUp className="size-3.5" />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            <span>846 travelers confirmed</span>
          </div>
          <div className="text-slate-400">Average group size: 3.8 pax</div>
        </CardFooter>
      </Card>

      {/* 3. Fleet & Guides Operational Status */}
      <Card className="@container/card border-slate-200/80 shadow-xs bg-white hover:border-blue-200 transition-colors">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardDescription className="text-slate-500 font-medium">Fleet & Guide Active</CardDescription>
            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <IconBus className="size-4.5" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tabular-nums text-slate-900 @[250px]/card:text-3xl mt-1">
            28 / 32 Units
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 font-semibold gap-1 text-xs">
              87.5% Utilized
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            <span>22 Tour Guides on duty</span>
          </div>
          <div className="text-slate-400">4 vehicles scheduled for routine check</div>
        </CardFooter>
      </Card>

      {/* 4. Customer Satisfaction */}
      <Card className="@container/card border-slate-200/80 shadow-xs bg-white hover:border-blue-200 transition-colors">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardDescription className="text-slate-500 font-medium">Traveler Satisfaction</CardDescription>
            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <IconStar className="size-4.5" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tabular-nums text-slate-900 @[250px]/card:text-3xl mt-1">
            4.9 / 5.0 ★
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold gap-1 text-xs">
              <IconTrendingUp className="size-3.5" />
              +0.2 pts
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            <span>1,280 verified traveler reviews</span>
          </div>
          <div className="text-slate-400">96.8% positive feedback rate</div>
        </CardFooter>
      </Card>
    </div>
  );
}
