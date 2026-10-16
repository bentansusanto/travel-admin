import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IconChevronRight, IconCreditCard, IconEye } from "@tabler/icons-react";
import Link from "next/link";

const recentBookings = [
  {
    orderId: "ORD-8921",
    customer: "Siti Rahmawati",
    email: "siti.rahmawati@gmail.com",
    service: "Umrah Plus Turkey Platinum (12D)",
    pax: "2 Pax",
    date: "15 Sep 2026",
    amount: "Rp 70.000.000",
    status: "Paid",
    statusVariant: "paid",
  },
  {
    orderId: "ORD-8920",
    customer: "David Johnson",
    email: "david.j@outlook.com",
    service: "Labuan Bajo Phinisi Sailing Tour",
    pax: "4 Pax",
    date: "04 Sep 2026",
    amount: "Rp 18.400.000",
    status: "Paid",
    statusVariant: "paid",
  },
  {
    orderId: "ORD-8919",
    customer: "PT Mitra Prima Mandiri",
    email: "finance@mitraprima.co.id",
    service: "Corporate Gathering & Bromo Tour",
    pax: "35 Pax",
    date: "18 Sep 2026",
    amount: "Rp 42.500.000",
    status: "Down Payment (50%)",
    statusVariant: "dp",
  },
  {
    orderId: "ORD-8918",
    customer: "Hendrik Wijaya",
    email: "hendrik.wijaya@yahoo.com",
    service: "Bali Nusa Penida Explorer + Snorkeling",
    pax: "2 Pax",
    date: "01 Sep 2026",
    amount: "Rp 3.600.000",
    status: "Paid",
    statusVariant: "paid",
  },
  {
    orderId: "ORD-8917",
    customer: "Maya Kartika",
    email: "maya.kartika@gmail.com",
    service: "Japan Autumn Tokyo & Kyoto (7D6N)",
    pax: "2 Pax",
    date: "12 Oct 2026",
    amount: "Rp 46.000.000",
    status: "Pending Payment",
    statusVariant: "pending",
  },
];

export function DashboardRecentOrders() {
  return (
    <Card className="border-slate-200/80 shadow-xs bg-white">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">Recent Customer Bookings & Orders</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Live booking transactions and payment status across all services
            </CardDescription>
          </div>
          <Button asChild variant="outline" size="sm" className="h-8 text-xs font-semibold text-blue-600 border-blue-200 bg-blue-50/50 hover:bg-blue-100 hover:text-blue-700 gap-1 w-fit">
            <Link href="/dashboard/orders">
              <span>View All Orders</span>
              <IconChevronRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/75 border-y border-slate-200/60">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-slate-600 px-4 py-3">Order ID</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 px-4 py-3">Traveler Name</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 px-4 py-3">Service / Tour Package</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 px-4 py-3">Departure Date</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 px-4 py-3 text-right">Amount</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 px-4 py-3 text-center">Payment Status</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 px-4 py-3 text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentBookings.map((order) => (
                <TableRow key={order.orderId} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100">
                  <TableCell className="px-4 py-3 font-semibold text-xs text-blue-600">
                    {order.orderId}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-semibold text-xs text-slate-900">{order.customer}</span>
                      <span className="text-[11px] text-slate-400">{order.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-slate-800">{order.service}</span>
                      <span className="text-[11px] text-slate-400 font-normal">{order.pax}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                    {order.date}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-xs font-bold text-slate-900 text-right whitespace-nowrap">
                    {order.amount}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center whitespace-nowrap">
                    {order.statusVariant === "paid" && (
                      <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold text-[11px]">
                        Paid
                      </Badge>
                    )}
                    {order.statusVariant === "dp" && (
                      <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 font-semibold text-[11px]">
                        DP 50%
                      </Badge>
                    )}
                    {order.statusVariant === "pending" && (
                      <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-700 font-semibold text-[11px]">
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    <Button asChild variant="ghost" size="icon" className="size-7 text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                      <Link href={`/dashboard/orders`}>
                        <IconEye className="size-4" />
                        <span className="sr-only">View Order</span>
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
