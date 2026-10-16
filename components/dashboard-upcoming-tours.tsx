import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconClock, IconUserCheck, IconUsers } from "@tabler/icons-react";

const upcomingTours = [
  {
    id: "TR-8901",
    title: "Bromo Midnight Sunrise Explorer",
    departureTime: "Today, 23:00 WIB",
    guide: "Rahmat Hidayat",
    pax: "18 Pax",
    fleet: "Isuzu Elf Long (B 7890 PAC)",
    status: "Ready for Departure",
    statusVariant: "ready",
  },
  {
    id: "TR-8902",
    title: "Nusa Penida West Coast Island Trip",
    departureTime: "Tomorrow, 07:30 WITA",
    guide: "Made Sudira",
    pax: "12 Pax",
    fleet: "Speedboat Fast Ferry #04",
    status: "Briefing Completed",
    statusVariant: "completed",
  },
  {
    id: "TR-8903",
    title: "Dieng Plateau Golden Sunrise Tour",
    departureTime: "28 Aug, 01:00 WIB",
    guide: "Bambang Santoso",
    pax: "24 Pax",
    fleet: "Medium Bus Executive",
    status: "Manifest Finalized",
    statusVariant: "ready",
  },
  {
    id: "TR-8904",
    title: "Labuan Bajo Komodo Phinisi Tour (3D2N)",
    departureTime: "29 Aug, 09:00 WITA",
    guide: "Capt. Fransiscus",
    pax: "16 Pax",
    fleet: "KLM Phinisi Pacific Pearl",
    status: "Airport Pickup Scheduled",
    statusVariant: "scheduled",
  },
];

export function DashboardUpcomingTours() {
  return (
    <Card className="border-slate-200/80 shadow-xs bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">Upcoming Tour Departures</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Live schedule and operational status for this week
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700 font-semibold text-xs">
            4 Scheduled
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-1">
        <div className="space-y-3.5">
          {upcomingTours.map((tour) => (
            <div
              key={tour.id}
              className="flex flex-col gap-2 p-3.5 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
                    {tour.id}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 truncate">{tour.title}</h4>
                </div>
                <Badge
                  variant="outline"
                  className="text-[11px] font-semibold border-emerald-200 bg-emerald-50 text-emerald-700 shrink-0"
                >
                  {tour.status}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 pt-1">
                <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <IconClock className="size-3.5 text-blue-500 shrink-0" />
                  <span className="truncate">{tour.departureTime}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <IconUserCheck className="size-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">Guide: {tour.guide}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <IconUsers className="size-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{tour.pax} ({tour.fleet})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
