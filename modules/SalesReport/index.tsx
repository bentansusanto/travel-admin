"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { TablePagination } from "@/components/ui/table-pagination";
import { useFindAllSalesQuery } from "@/store/services/sales.service";
import {
  IconCheck,
  IconClock,
  IconCreditCard,
  IconCurrencyDollar,
  IconDownload,
  IconReceipt2,
  IconReportMoney,
  IconSearch,
  IconX
} from "@tabler/icons-react";
import { format, startOfDay, subDays } from "date-fns";
import { Loader2 } from "lucide-react";
import React, { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { toast } from "sonner";

interface Payment {
  id: string;
  invoice_code?: string;
  order_code?: string;
  payment_method?: string;
  status: string;
  amount: number;
  currency?: string;
  service_type?: string;
  order_type?: string;
  created_at: string;
  user?: {
    name?: string;
    email?: string;
  };
  booker?: {
    name?: string;
    email?: string;
    phone_number?: string;
  };
  book_tour?: {
    title?: string;
    book_tour_items?: any[];
  };
  book_motor?: {
    motor_name?: string;
    motor_item?: any;
  };
}

export const SalesReportPage = () => {
  const { data: salesData, isLoading, isError, refetch } = useFindAllSalesQuery();

  const [period, setPeriod] = useState<"weekly" | "monthly" | "yearly">("monthly");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const payments: Payment[] = useMemo(() => {
    return salesData?.data || (salesData as any)?.datas || [];
  }, [salesData]);

  // Currency Formatter (USD $)
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val || 0);
  };

  // Service Mapping
  const getServiceName = (p: Payment) => {
    if (p.book_tour) return "Tour Holiday & Religion";
    if (p.book_motor) return "Rent Motor";
    if (p.service_type) {
      const type = p.service_type.toLowerCase();
      if (type.includes("tour")) return "Tour Holiday & Religion";
      if (type.includes("motor")) return "Rent Motor";
      if (type.includes("attraction") || type.includes("entertainment"))
        return "Entertainment & Attractions";
      if (type.includes("visa") || type.includes("document")) return "Document & Visa";
      if (type.includes("hotel")) return "Hotels";
      if (type.includes("flight")) return "Flight";
      if (type.includes("bus")) return "Bus & Shuttle";
    }
    return p.order_type || "Travel Service";
  };

  // 1. Revenue Chart Data
  const chartData = useMemo(() => {
    const successPayments = payments.filter(
      (p) =>
        p.status?.toLowerCase() === "success" ||
        p.status?.toLowerCase() === "paid" ||
        p.status?.toLowerCase() === "completed"
    );

    if (period === "weekly") {
      const days = Array.from({ length: 7 }, (_, i) => {
        const date = startOfDay(subDays(new Date(), 6 - i));
        return {
          date: format(date, "EEE"),
          fullDate: date,
          revenue: 0,
          orders: 0
        };
      });

      successPayments.forEach((p) => {
        const pDate = startOfDay(new Date(p.created_at || Date.now()));
        const match = days.find((d) => d.fullDate.getTime() === pDate.getTime());
        if (match) {
          match.revenue += Number(p.amount) || 0;
          match.orders += 1;
        }
      });
      return days;
    } else if (period === "monthly") {
      const days = Array.from({ length: 14 }, (_, i) => {
        const date = startOfDay(subDays(new Date(), 13 - i));
        return {
          date: format(date, "MMM d"),
          fullDate: date,
          revenue: 0,
          orders: 0
        };
      });

      successPayments.forEach((p) => {
        const pDate = startOfDay(new Date(p.created_at || Date.now()));
        const match = days.find((d) => d.fullDate.getTime() === pDate.getTime());
        if (match) {
          match.revenue += Number(p.amount) || 0;
          match.orders += 1;
        }
      });
      return days;
    } else {
      const months = Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (11 - i));
        return {
          date: format(date, "MMM"),
          month: date.getMonth(),
          year: date.getFullYear(),
          revenue: 0,
          orders: 0
        };
      });

      successPayments.forEach((p) => {
        const pDate = new Date(p.created_at || Date.now());
        const match = months.find(
          (m) => m.month === pDate.getMonth() && m.year === pDate.getFullYear()
        );
        if (match) {
          match.revenue += Number(p.amount) || 0;
          match.orders += 1;
        }
      });
      return months;
    }
  }, [payments, period]);

  // 2. High-Level Summary KPI Metrics
  const metrics = useMemo(() => {
    const successList = payments.filter(
      (p) =>
        p.status?.toLowerCase() === "success" ||
        p.status?.toLowerCase() === "paid" ||
        p.status?.toLowerCase() === "completed"
    );
    const pendingList = payments.filter(
      (p) => p.status?.toLowerCase() === "pending" || p.status?.toLowerCase() === "waiting"
    );
    const processingList = payments.filter(
      (p) => p.status?.toLowerCase() === "processing" || p.status?.toLowerCase() === "in_progress"
    );
    const failedList = payments.filter(
      (p) =>
        p.status?.toLowerCase() === "failed" ||
        p.status?.toLowerCase() === "cancelled" ||
        p.status?.toLowerCase() === "expired"
    );

    const grossRevenue = successList.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const pendingAmount = pendingList.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const avgOrderValue = successList.length > 0 ? grossRevenue / successList.length : 0;

    return {
      grossRevenue,
      completedOrdersCount: successList.length,
      pendingCount: pendingList.length,
      pendingAmount,
      processingCount: processingList.length,
      failedCount: failedList.length,
      avgOrderValue,
      totalTransactions: payments.length
    };
  }, [payments]);

  // 3. Best Performing Services Breakdown
  const serviceBreakdown = useMemo(() => {
    const map: Record<string, { count: number; revenue: number }> = {};

    payments.forEach((p) => {
      const name = getServiceName(p);
      if (!map[name]) {
        map[name] = { count: 0, revenue: 0 };
      }
      map[name].count += 1;
      if (p.status?.toLowerCase() === "success" || p.status?.toLowerCase() === "paid") {
        map[name].revenue += Number(p.amount) || 0;
      }
    });

    const totalOrders = payments.length || 1;
    return Object.entries(map)
      .map(([name, stat]) => ({
        name,
        count: stat.count,
        revenue: stat.revenue,
        sharePercentage: Math.round((stat.count / totalOrders) * 100)
      }))
      .sort((a, b) => b.count - a.count);
  }, [payments]);

  // 4. Payment Method Distribution
  const paymentMethodStats = useMemo(() => {
    const map: Record<string, number> = {};
    payments.forEach((p) => {
      const method = p.payment_method || "Credit Card";
      map[method] = (map[method] || 0) + 1;
    });
    return Object.entries(map).map(([method, count]) => ({
      method,
      count,
      percentage: Math.round((count / (payments.length || 1)) * 100)
    }));
  }, [payments]);

  // 5. Filtered & Paginated Table Data
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const customerName = p.booker?.name || p.user?.name || "";
      const customerEmail = p.booker?.email || p.user?.email || "";
      const code = p.invoice_code || p.order_code || p.id;
      const sName = getServiceName(p);

      const matchesSearch =
        customerName.toLowerCase().includes(search.toLowerCase()) ||
        customerEmail.toLowerCase().includes(search.toLowerCase()) ||
        code.toLowerCase().includes(search.toLowerCase()) ||
        sName.toLowerCase().includes(search.toLowerCase());

      const status = p.status?.toLowerCase() || "";
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "completed" &&
          (status === "success" || status === "paid" || status === "completed")) ||
        (statusFilter === "pending" && (status === "pending" || status === "waiting")) ||
        (statusFilter === "processing" && (status === "processing" || status === "in_progress")) ||
        (statusFilter === "failed" &&
          (status === "failed" || status === "cancelled" || status === "expired"));

      return matchesSearch && matchesStatus;
    });
  }, [payments, search, statusFilter]);

  // Reset page when search/filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, pageSize]);

  const totalItems = filteredPayments.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const paginatedList = useMemo(() => {
    const start = (validCurrentPage - 1) * pageSize;
    return filteredPayments.slice(start, start + pageSize);
  }, [filteredPayments, validCurrentPage, pageSize]);

  // Status Badge Helper
  const renderStatusBadge = (status?: string) => {
    const s = status?.toLowerCase() || "";
    if (s === "success" || s === "paid" || s === "completed") {
      return (
        <Badge
          variant="outline"
          className="gap-1 border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
          <IconCheck className="size-3" />
          Completed
        </Badge>
      );
    }
    if (s === "pending" || s === "waiting") {
      return (
        <Badge
          variant="outline"
          className="gap-1 border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
          <IconClock className="size-3" />
          Pending
        </Badge>
      );
    }
    if (s === "processing" || s === "in_progress") {
      return (
        <Badge
          variant="outline"
          className="gap-1 border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
          <IconClock className="size-3" />
          Processing
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="gap-1 border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
        <IconX className="size-3" />
        {status || "Failed"}
      </Badge>
    );
  };

  // Export CSV Helper
  const handleExportCSV = () => {
    if (payments.length === 0) {
      toast.error("No transactions available to export");
      return;
    }

    const headers = [
      "Invoice / ID",
      "Date",
      "Customer Name",
      "Email",
      "Service",
      "Amount (USD)",
      "Payment Method",
      "Status"
    ];

    const rows = payments.map((p) => [
      `"${p.invoice_code || p.order_code || p.id}"`,
      `"${p.created_at ? format(new Date(p.created_at), "yyyy-MM-dd HH:mm") : "-"}"`,
      `"${p.booker?.name || p.user?.name || "Guest"}"`,
      `"${p.booker?.email || p.user?.email || "-"}"`,
      `"${getServiceName(p)}"`,
      Number(p.amount || 0).toFixed(2),
      `"${p.payment_method || "Online"}"`,
      `"${p.status}"`
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales-report-${format(new Date(), "yyyyMMdd-HHmm")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Sales report exported successfully");
  };

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-2.5 text-slate-500">
        <Loader2 className="size-8 animate-spin text-blue-600" />
        <p className="text-xs font-medium">Loading sales analytics and revenue data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 1. Top Action Bar & Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-blue-600 uppercase">
            <IconReportMoney className="size-3.5" />
            <span>Financial & Sales Analytics</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Sales Report & Revenue
          </h1>
          <p className="text-xs text-slate-500">
            Monitor real-time gross revenue, order volume breakdowns, service performance, and
            settled transactions.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          className="h-9 gap-1.5 self-start border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 sm:self-auto">
          <IconDownload className="size-4 text-blue-600" />
          <span>Export CSV Report</span>
        </Button>
      </div>

      {/* 2. Top Summary KPI Cards (4 Column Grid) */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <IconCurrencyDollar className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-medium text-slate-500">Gross Settled Revenue</p>
            <p className="mt-0.5 truncate text-xl font-bold text-slate-900">
              {formatCurrency(metrics.grossRevenue)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <IconCheck className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-medium text-slate-500">Completed Orders</p>
            <p className="mt-0.5 truncate text-xl font-bold text-slate-900">
              {metrics.completedOrdersCount}{" "}
              <span className="text-xs font-normal text-slate-400">Orders</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <IconClock className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-medium text-slate-500">Pending In-Pipeline</p>
            <p className="mt-0.5 truncate text-xl font-bold text-slate-900">
              {metrics.pendingCount}{" "}
              <span className="text-xs font-normal text-slate-400">
                ({formatCurrency(metrics.pendingAmount)})
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
            <IconReceipt2 className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-medium text-slate-500">
              Avg. Order Value (AOV)
            </p>
            <p className="mt-0.5 truncate text-xl font-bold text-slate-900">
              {formatCurrency(metrics.avgOrderValue)}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Revenue Chart & Financial Health (8 cols + 4 cols) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left: Revenue Chart */}
        <Card className="gap-0 overflow-hidden border-slate-200/80 bg-white py-0 shadow-xs lg:col-span-8">
          <CardHeader className="flex flex-col gap-2.5 border-b border-slate-100 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between [.border-b]:pb-3.5">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900">
                Revenue Performance Trend
              </CardTitle>
              <CardDescription className="text-[11px] text-slate-500">
                {period === "weekly"
                  ? "Showing settled earnings over the last 7 days"
                  : period === "monthly"
                    ? "Showing daily settled revenue over the last 14 days"
                    : "Showing monthly revenue performance over the past 12 months"}
              </CardDescription>
            </div>

            {/* Period Switcher Buttons */}
            <div className="flex h-8 items-center rounded-lg bg-slate-100 p-0.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setPeriod("weekly")}
                className={`h-7 rounded-md px-3 text-xs font-semibold transition-all ${
                  period === "weekly"
                    ? "bg-white text-blue-600 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}>
                7 Days
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setPeriod("monthly")}
                className={`h-7 rounded-md px-3 text-xs font-semibold transition-all ${
                  period === "monthly"
                    ? "bg-white text-blue-600 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}>
                14 Days
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setPeriod("yearly")}
                className={`h-7 rounded-md px-3 text-xs font-semibold transition-all ${
                  period === "yearly"
                    ? "bg-white text-blue-600 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}>
                12 Months
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-5">
            <div className="h-55 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    tickLine={false}
                    axisLine={{ stroke: "#e2e8f0" }}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    formatter={(val: any) => [formatCurrency(Number(val)), "Revenue"]}
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                      fontSize: "12px",
                      fontWeight: 600
                    }}
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.revenue > 0 ? "#2563eb" : "#cbd5e1"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Right: Payment Channels & Order Lifecycle */}
        <Card className="flex flex-col justify-between gap-0 overflow-hidden border-slate-200/80 bg-white py-0 shadow-xs lg:col-span-4">
          <CardHeader className="border-b border-slate-100 px-5 py-3.5 [.border-b]:pb-3.5">
            <CardTitle className="text-sm font-bold text-slate-900">
              Payment & Settlement Status
            </CardTitle>
            <CardDescription className="text-[11px] text-slate-500">
              Breakdown across payment methods & clearance.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-between space-y-3 p-4 sm:p-5">
            {/* Quick Status Badges Box */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-2.5">
                <p className="text-[10px] font-semibold text-emerald-600 uppercase">Settled</p>
                <p className="mt-0.5 text-sm font-bold text-emerald-900">
                  {metrics.completedOrdersCount} Orders
                </p>
              </div>
              <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-2.5">
                <p className="text-[10px] font-semibold text-amber-600 uppercase">Pending</p>
                <p className="mt-0.5 text-sm font-bold text-amber-900">
                  {metrics.pendingCount} Orders
                </p>
              </div>
            </div>

            {/* Payment Method Distribution List */}
            <div className="space-y-2 pt-1">
              <p className="text-xs font-bold text-slate-800">Top Payment Methods</p>
              {paymentMethodStats.length > 0 ? (
                paymentMethodStats.slice(0, 3).map((item) => (
                  <div key={item.method} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-medium text-slate-700 capitalize">
                        <IconCreditCard className="size-3.5 text-slate-400" />
                        {item.method}
                      </span>
                      <span className="font-bold text-slate-900">
                        {item.percentage}% ({item.count})
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{ width: `${Math.min(100, item.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No transaction records found.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Bottom Section: Best Selling Services (4 cols) & Live Transaction Table (8 cols) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left: Best Selling Services */}
        <Card className="gap-0 overflow-hidden border-slate-200/80 bg-white py-0 shadow-xs lg:col-span-4">
          <CardHeader className="border-b border-slate-100 px-5 py-3.5 [.border-b]:pb-3.5">
            <CardTitle className="text-sm font-bold text-slate-900">
              Service Category Breakdown
            </CardTitle>
            <CardDescription className="text-[11px] text-slate-500">
              Revenue and bookings distribution by travel service.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-4 sm:p-5">
            {serviceBreakdown.length > 0 ? (
              serviceBreakdown.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/40 p-2.5 text-xs transition-colors hover:border-slate-200/80 hover:bg-slate-50">
                  <div className="min-w-0 pr-2">
                    <p className="truncate font-bold text-slate-800">{item.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {item.count} Bookings ({item.sharePercentage}%)
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-xs font-bold text-slate-900">
                    {formatCurrency(item.revenue)}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No service booking records yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Live Transaction Table & Search Toolbar */}
        <Card className="gap-0 overflow-hidden border-slate-200/80 bg-white py-0 shadow-xs lg:col-span-8">
          <CardHeader className="flex flex-col gap-2.5 border-b border-slate-100 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between [.border-b]:pb-3.5">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900">
                Order & Transaction Logs
              </CardTitle>
              <CardDescription className="text-[11px] text-slate-500">
                Detailed transaction histories, customer contacts, and payment confirmations.
              </CardDescription>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="flex items-center gap-2">
              <div className="relative min-w-45">
                <IconSearch className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search invoice / name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 rounded-lg border-slate-200 bg-slate-50/50 pl-8 text-xs"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 w-32.5 border-slate-200 bg-slate-50/50 text-xs shadow-2xs">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-slate-200/60 bg-slate-50/80">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="px-4 py-2.5 text-xs font-semibold text-slate-600">
                      Invoice / ID
                    </TableHead>
                    <TableHead className="px-4 py-2.5 text-xs font-semibold text-slate-600">
                      Customer
                    </TableHead>
                    <TableHead className="px-4 py-2.5 text-xs font-semibold text-slate-600">
                      Service
                    </TableHead>
                    <TableHead className="px-4 py-2.5 text-xs font-semibold text-slate-600">
                      Amount
                    </TableHead>
                    <TableHead className="px-4 py-2.5 text-center text-xs font-semibold text-slate-600">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-28 text-center text-xs text-slate-400">
                        No transactions found matching your criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedList.map((order) => {
                      const customerName =
                        order.booker?.name || order.user?.name || "Guest Customer";
                      const customerEmail = order.booker?.email || order.user?.email || "";
                      const invoice = order.invoice_code || order.order_code || order.id;
                      const sName = getServiceName(order);

                      return (
                        <TableRow
                          key={order.id}
                          className="border-b border-slate-100 text-xs transition-colors hover:bg-slate-50/80">
                          {/* Invoice / ID & Date */}
                          <TableCell className="px-4 py-2.5 font-mono text-[11px] font-semibold text-slate-800">
                            <div>
                              <span>{invoice}</span>
                              <p className="mt-0.5 font-sans text-[10px] font-normal text-slate-400">
                                {order.created_at
                                  ? format(new Date(order.created_at), "MMM d, yyyy")
                                  : "-"}
                              </p>
                            </div>
                          </TableCell>

                          {/* Customer Name & Email */}
                          <TableCell className="px-4 py-2.5">
                            <div className="flex max-w-37.5 min-w-0 flex-col">
                              <span className="truncate font-bold text-slate-900">
                                {customerName}
                              </span>
                              <span className="truncate text-[11px] text-slate-400">
                                {customerEmail}
                              </span>
                            </div>
                          </TableCell>

                          {/* Service Type */}
                          <TableCell className="px-4 py-2.5 text-slate-700">
                            <span className="block max-w-35 truncate">{sName}</span>
                          </TableCell>

                          {/* Amount */}
                          <TableCell className="px-4 py-2.5 font-mono font-bold text-slate-900">
                            {formatCurrency(Number(order.amount) || 0)}
                          </TableCell>

                          {/* Status */}
                          <TableCell className="px-4 py-2.5 text-center">
                            {renderStatusBadge(order.status)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Standardized Table Pagination Footer */}
            <TablePagination
              currentPage={validCurrentPage}
              pageSize={pageSize}
              totalItems={totalItems}
              itemName="transactions"
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              className="border-t border-slate-100 bg-transparent px-4 pt-2 pb-3"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
