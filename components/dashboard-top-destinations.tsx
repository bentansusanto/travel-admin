import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconMapPin, IconTrendingUp } from "@tabler/icons-react";

const destinations = [
  {
    name: "Bromo Sunrise & Safari Expedition",
    location: "East Java",
    category: "Adventure",
    bookings: 86,
    revenue: "Rp 68.800.000",
    occupancy: 95,
  },
  {
    name: "Umrah Plus Turkey Platinum (12D)",
    location: "Saudi & Turkey",
    category: "Religious",
    bookings: 42,
    revenue: "Rp 147.000.000",
    occupancy: 100,
  },
  {
    name: "Bali Nusa Penida & Snorkeling Tour",
    location: "Bali",
    category: "Island",
    bookings: 74,
    revenue: "Rp 55.500.000",
    occupancy: 88,
  },
  {
    name: "Labuan Bajo Phinisi Sailing Experience",
    location: "NTT",
    category: "Luxury",
    bookings: 38,
    revenue: "Rp 45.600.000",
    occupancy: 92,
  },
  {
    name: "Japan Autumn Sakura & Mount Fuji Tour",
    location: "Tokyo - Kyoto",
    category: "International",
    bookings: 28,
    revenue: "Rp 84.000.000",
    occupancy: 82,
  },
];

export function DashboardTopDestinations() {
  return (
    <Card className="border-slate-200/80 shadow-xs bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">Top Performing Tour Packages</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Highest booking volume & gross revenue this month
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 font-semibold text-xs gap-1">
            <IconTrendingUp className="size-3.5" />
            Top 5
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-1">
        <div className="space-y-4">
          {destinations.map((item, i) => (
            <div key={i} className="flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-bold text-sm">
                  #{i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-bold text-slate-900">{item.name}</p>
                    <Badge variant="secondary" className="text-[10px] font-medium px-1.5 py-0 h-4 bg-slate-100 text-slate-600">
                      {item.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <IconMapPin className="size-3 text-slate-400" />
                      {item.location}
                    </span>
                    <span>•</span>
                    <span className="font-medium text-slate-700">{item.bookings} bookings</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-medium">{item.occupancy}% quota filled</span>
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-slate-900">{item.revenue}</p>
                <p className="text-[11px] text-slate-400 font-medium">Gross revenue</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
