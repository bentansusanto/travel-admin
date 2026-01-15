"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useFindAllSalesQuery } from "@/store/services/sales.service";
import { format, startOfDay, subDays } from "date-fns";
import { ArrowRight, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Payment {
  id: string;
  invoice_code: string;
  payment_method: string;
  status: string;
  amount: number;
  currency: string;
  service_type?: string;
  created_at: string;
  user?: {
    name: string;
    email: string;
  };
  book_tour?: {
    book_tour_items: any[];
  };
}

export const SalesReportPage = () => {
  const { data, isLoading } = useFindAllSalesQuery();
  const [currentPage, setCurrentPage] = useState(1);
  const [period, setPeriod] = useState<"weekly" | "monthly" | "yearly">("monthly");
  const itemsPerPage = 6;

  const payments: Payment[] = data?.data || [];

  // Service name mapping
  const serviceMap: Record<string, string> = {
    tour: "Tour Holiday & Religion",
    hotel: "Hotels",
    flight: "Flight",
    rent_motor: "Rent Motor",
    entertainment: "Entertainment & Attractions",
    document_visa: "Document & Visa",
    bus_shuttle: "Bus & Shuttle",
    health_tourism: "Health & Tourism"
  };

  // Get revenue data based on selected period
  const revenueData = useMemo(() => {
    const successPayments = payments.filter((p) => p.status === "success");

    if (period === "weekly") {
      // Last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = startOfDay(subDays(new Date(), 6 - i));
        return {
          date: format(date, "EEE"),
          fullDate: date,
          revenue: 0
        };
      });

      successPayments.forEach((payment) => {
        const paymentDate = startOfDay(new Date(payment.created_at));
        const dayData = last7Days.find((d) => d.fullDate.getTime() === paymentDate.getTime());
        if (dayData) {
          dayData.revenue += payment.amount;
        }
      });

      return last7Days;
    } else if (period === "monthly") {
      // Last 28 days
      const last28Days = Array.from({ length: 28 }, (_, i) => {
        const date = startOfDay(subDays(new Date(), 27 - i));
        return {
          date: format(date, "MMM d"),
          fullDate: date,
          revenue: 0
        };
      });

      successPayments.forEach((payment) => {
        const paymentDate = startOfDay(new Date(payment.created_at));
        const dayData = last28Days.find((d) => d.fullDate.getTime() === paymentDate.getTime());
        if (dayData) {
          dayData.revenue += payment.amount;
        }
      });

      return last28Days;
    } else {
      // Last 12 months
      const last12Months = Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (11 - i));
        return {
          date: format(date, "MMM yyyy"),
          month: date.getMonth(),
          year: date.getFullYear(),
          revenue: 0
        };
      });

      successPayments.forEach((payment) => {
        const paymentDate = new Date(payment.created_at);
        const monthData = last12Months.find(
          (d) => d.month === paymentDate.getMonth() && d.year === paymentDate.getFullYear()
        );
        if (monthData) {
          monthData.revenue += payment.amount;
        }
      });

      return last12Months;
    }
  }, [payments, period]);

  // Calculate statistics
  const stats = useMemo(() => {
    const successPayments = payments.filter((p) => p.status === "success");
    const totalBalance = successPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalIncome = totalBalance;
    const totalExpense = totalBalance * 0.15; // Assume 15% expenses
    const totalSalesTax = totalBalance * 0.1; // Assume 10% tax

    return {
      totalBalance,
      totalIncome,
      totalExpense,
      totalSalesTax,
      totalRevenue: Math.round(revenueData.reduce((sum, d) => sum + d.revenue, 0))
    };
  }, [payments, revenueData]);

  // Best selling services
  const bestSellingServices = useMemo(() => {
    const serviceCount: Record<string, number> = {};

    payments.forEach((payment) => {
      const serviceType = payment.service_type || "unknown";
      const itemCount = payment.book_tour?.book_tour_items?.length || 1;
      serviceCount[serviceType] = (serviceCount[serviceType] || 0) + itemCount;
    });

    return Object.entries(serviceCount)
      .map(([type, count]) => ({
        name: serviceMap[type] || type,
        count,
        type
      }))
      .sort((a, b) => b.count - a.count);
  }, [payments]);

  // Order status counts
  const statusCounts = useMemo(() => {
    return {
      newOrder: payments.filter((p) => p.status === "pending").length,
      onProgress: payments.filter((p) => p.status === "processing").length,
      completed: payments.filter((p) => p.status === "success").length,
      return: payments.filter((p) => p.status === "failed").length
    };
  }, [payments]);

  // Paginated orders
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return payments.slice(startIndex, startIndex + itemsPerPage);
  }, [payments, currentPage]);

  const totalPages = Math.ceil(payments.length / itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "processing":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "failed":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">Loading sales data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Revenue Chart and Stats */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Revenue Chart</CardTitle>
                <p className="text-muted-foreground text-sm">
                  {period === "weekly"
                    ? "Last 7 days"
                    : period === "monthly"
                      ? "Last 28 days"
                      : "Last 12 months"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={period === "weekly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPeriod("weekly")}>
                  Weekly
                </Button>
                <Button
                  variant={period === "monthly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPeriod("monthly")}>
                  Monthly
                </Button>
                <Button
                  variant={period === "yearly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPeriod("yearly")}>
                  Yearly
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ fontSize: 12 }}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="space-y-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-muted-foreground text-sm">Total Balance</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalBalance)}</p>
              <p className="flex items-center gap-1 text-xs text-green-600">
                <TrendingUp className="h-3 w-3" />
                3.6% Compare from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-muted-foreground text-sm">Total Income</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalIncome)}</p>
              <p className="flex items-center gap-1 text-xs text-green-600">
                <TrendingUp className="h-3 w-3" />
                2.5% Compare from last month
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Best Selling Services and Track Order Status */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Best Selling Services */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Best Selling Service</CardTitle>
                <p className="text-muted-foreground text-sm">Top-Selling Services at a Glance</p>
              </div>
              <Button variant="ghost" size="sm">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {bestSellingServices.map((service) => (
              <div
                key={service.type}
                className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                    <span className="text-lg">📦</span>
                  </div>
                  <span className="font-medium">{service.name}</span>
                </div>
                <span className="text-sm text-green-600">{service.count} items sold</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Track Order Status */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Track Order Status</CardTitle>
                <p className="text-muted-foreground text-sm">
                  Analyze growth and changes in visitor patterns
                </p>
              </div>
              <Button variant="outline" size="sm">
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Status Counts */}
            <div className="mb-6 grid grid-cols-4 gap-4">
              <div>
                <p className="text-3xl font-bold">{statusCounts.newOrder}</p>
                <p className="text-muted-foreground text-xs">New Order</p>
                <p className="text-xs text-green-600">↑ 0.5%</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{statusCounts.onProgress}</p>
                <p className="text-muted-foreground text-xs">On Progress</p>
                <p className="text-xs text-orange-600">↑ 0.3%</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{statusCounts.completed}</p>
                <p className="text-muted-foreground text-xs">Completed</p>
                <p className="text-xs text-green-600">↑ 0.5%</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{statusCounts.return}</p>
                <p className="text-muted-foreground text-xs">Return</p>
                <p className="text-xs text-orange-600">↑ 0.5%</p>
              </div>
            </div>

            {/* Orders Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Qty Items</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.invoice_code}</TableCell>
                    <TableCell>{order.user?.name || "-"}</TableCell>
                    <TableCell>{order.book_tour?.book_tour_items?.length || 1} Items</TableCell>
                    <TableCell>{formatCurrency(order.amount)}</TableCell>
                    <TableCell className="capitalize">{order.payment_method}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                0 of {payments.length} row(s) selected.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}>
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}>
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
