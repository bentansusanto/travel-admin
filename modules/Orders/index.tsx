"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useFindAllOrdersQuery } from "@/store/services/orders.service";
import { Eye } from "lucide-react";
import { useState } from "react";
import { OrderDetails } from "./OrderDetails";

interface Payment {
  id: string;
  invoice_code: string;
  payment_method: string;
  status: string;
  amount: number;
  currency: string;
  created_at: string;
  book_tour_id: string;
  service_type?: string;
  book_tour?: {
    id: string;
    status: string;
  };
}

export const OrderPage = () => {
  const { data, isLoading, error } = useFindAllOrdersQuery();
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate statistics
  const payments: Payment[] = data?.data || [];

  // Pagination calculations
  const totalPages = Math.ceil(payments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPayments = payments.slice(startIndex, endIndex);
  const totalOrders = payments.length;
  const totalDelivered = payments.filter(
    (p) => p.book_tour?.status === "completed" || p.status === "success"
  ).length;
  const pendingOrders = payments.filter(
    (p) =>
      p.book_tour?.status === "pending" || p.book_tour?.status === "draft" || p.status === "pending"
  ).length;
  const ordersHold = payments.filter(
    (p) => p.book_tour?.status === "cancelled" || p.status === "failed"
  ).length;

  // Helper function to get service name from service_type or invoice_code
  const getServiceName = (payment: Payment): string => {
    // If service_type is available, use it
    if (payment.service_type) {
      const serviceMap: Record<string, string> = {
        tour: "Tour Holiday & Religion",
        rent_motor: "Rent Motor",
        entertainment: "Entertainment",
        hotel: "Hotel Booking",
        flight: "Flight Booking"
      };
      return serviceMap[payment.service_type] || payment.service_type;
    }

    // Fallback: Extract from invoice_code (e.g., "TOUR-103" -> "Tour Holiday & Religion")
    if (payment.invoice_code) {
      const prefix = payment.invoice_code.split("-")[0];
      const prefixMap: Record<string, string> = {
        TOUR: "Tour Holiday & Religion",
        MOTOR: "Rent Motor",
        RENT: "Rent Motor",
        ENTERTAINMENT: "Entertainment",
        HOTEL: "Hotel Booking",
        FLIGHT: "Flight Booking"
      };
      return prefixMap[prefix] || "Unknown Service";
    }

    return "Unknown Service";
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
      case "completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "ongoing":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "draft":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "failed":
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: currency || "IDR"
    }).format(amount);
  };

  const formatPaymentMethod = (method: string) => {
    return method.charAt(0).toUpperCase() + method.slice(1).toLowerCase();
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-lg">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-destructive text-lg">Error loading orders. Please try again.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Orders Card */}
        <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-blue-600/10">
          <CardContent className="p-4">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">Total Orders</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalOrders}</p>
              <p className="text-xs text-green-600 dark:text-green-400">+20.1%</p>
            </div>
          </CardContent>
        </Card>

        {/* Total Delivered Card */}
        <Card className="border-green-500/20 bg-gradient-to-br from-green-500/10 to-green-600/10">
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">Total Delivered</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {totalDelivered}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">+5.02%</p>
            </div>
          </CardContent>
        </Card>

        {/* Pending Orders Card */}
        <Card className="border-orange-500/20 bg-gradient-to-br from-yellow-500/10 to-yellow-600/10">
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">Pending Orders</p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {pendingOrders}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">+3.1%</p>
            </div>
          </CardContent>
        </Card>

        {/* Orders Hold Card */}
        <Card className="border-red-500/20 bg-gradient-to-br from-red-500/10 to-red-600/10">
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">Orders Hold</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{ordersHold}</p>
              <p className="text-xs text-red-600 dark:text-red-400">-3.58%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="px-4">
          <div className="mb-3">
            <h2 className="text-xl font-semibold">Orders List</h2>
            <p className="text-muted-foreground text-sm">Manage and view all customer orders</p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice Code</TableHead>
                <TableHead>Service Name</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-4 text-center">
                    <p className="text-muted-foreground">No orders found</p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.invoice_code}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {getServiceName(payment)}
                    </TableCell>
                    <TableCell>{formatPaymentMethod(payment.payment_method)}</TableCell>
                    <TableCell>
                      <Badge
                        className={getStatusColor(payment.book_tour?.status || payment.status)}>
                        {payment.book_tour?.status || payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(payment.amount, payment.currency)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedPaymentId(payment.id);
                          setIsModalOpen(true);
                        }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <div className="text-muted-foreground text-sm">
                Showing {startIndex + 1} to {Math.min(endIndex, payments.length)} of{" "}
                {payments.length} orders
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}>
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}>
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      // Show first page, last page, current page, and pages around current
                      return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                    })
                    .map((page, index, array) => (
                      <div key={page} className="flex items-center">
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="text-muted-foreground px-2">...</span>
                        )}
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="min-w-[2.5rem]">
                          {page}
                        </Button>
                      </div>
                    ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}>
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}>
                  Last
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      <OrderDetails
        paymentId={selectedPaymentId}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPaymentId(null);
        }}
      />
    </div>
  );
};
