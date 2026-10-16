"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TablePagination } from "@/components/ui/table-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatMultilingual } from "@/lib/utils";
import {
  useFindAllOrdersQuery,
  useFindAllBookDocumentVisasQuery,
} from "@/store/services/orders.service";
import {
  IconCheck,
  IconClock,
  IconCurrencyDollar,
  IconEye,
  IconFileCertificate,
  IconFilter,
  IconMotorbike,
  IconPackage,
  IconReceipt,
  IconRefresh,
  IconSearch,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import React, { useMemo, useState } from "react";
import { OrderDetailsModal } from "./OrderDetailsModal";

export interface PaymentOrder {
  id: string;
  invoice_code: string;
  user_id?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
  booker?: {
    name?: string;
    email?: string;
    phone_number?: string;
  };
  total_tourists?: number;
  amount: number | string;
  currency: string;
  service_type?: string;
  transaction_id?: string;
  payment_method: string;
  payer_email?: string;
  status: string;
  created_at: string;
  updated_at?: string;
  book_tour_id?: string;
  book_motor_id?: string;
  book_document_visa_id?: string;
  book_document_visa?: any;
  is_direct_visa_booking?: boolean;
  book_tour?: {
    id: string;
    code?: string;
    status?: string;
    booker?: {
      id?: string;
      name?: string;
      email?: string;
      phone_number?: string;
    } | null;
    tourists?: any[];
    book_tour_items?: any[];
  } | null;
  book_motor?: {
    id: string;
    status?: string;
    book_motor_items?: any[];
  } | null;
}

export const OrderPage = () => {
  const {
    data: ordersData,
    isLoading: isLoadingOrders,
    error: ordersError,
    refetch: refetchOrders,
    isFetching: isFetchingOrders,
  } = useFindAllOrdersQuery();

  const {
    data: visaData,
    isLoading: isLoadingVisas,
    error: visasError,
    refetch: refetchVisas,
    isFetching: isFetchingVisas,
  } = useFindAllBookDocumentVisasQuery();

  const isLoading = isLoadingOrders || isLoadingVisas;
  const isFetching = isFetchingOrders || isFetchingVisas;
  const error = ordersError && visasError ? ordersError : null;

  const refetch = () => {
    refetchOrders();
    refetchVisas();
  };

  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Raw orders array: merged from /payments/admin and /book-document-visas
  const rawOrders: PaymentOrder[] = useMemo(() => {
    const list: PaymentOrder[] = [];
    const paymentsList = ordersData?.data || (ordersData as any)?.datas || [];
    const visasList = visaData?.data || (visaData as any)?.datas || [];

    const processedVisaIds = new Set<string>();

    paymentsList.forEach((p: any) => {
      list.push(p);
      if (p.book_document_visa_id) {
        processedVisaIds.add(p.book_document_visa_id);
      }
      if (p.book_document_visa?.id) {
        processedVisaIds.add(p.book_document_visa.id);
      }
    });

    // Merge direct visa bookings not yet tracked in payment records
    visasList.forEach((v: any) => {
      if (!processedVisaIds.has(v.id)) {
        list.push({
          id: `visa_${v.id}`,
          invoice_code: v.id.startsWith("INV-") ? v.id : `VISA-${v.id.slice(0, 8).toUpperCase()}`,
          amount: Number(v.total_price || 0),
          currency: "USD",
          service_type: "document_visa",
          payment_method: "Direct Booking",
          status: v.status || "pending",
          created_at: v.created_at || v.createdAt || new Date().toISOString(),
          total_tourists: v.applicant_count || v.applicants?.length || 1,
          book_document_visa_id: v.id,
          book_document_visa: v,
          booker: {
            name: v.booker?.name || v.customer?.name || v.user?.name || "Visa Applicant",
            email: v.booker?.email || v.customer?.email || v.user?.email || "-",
            phone_number: v.booker?.phone_number || v.customer?.phone_number || "-",
          },
          user: v.user ? { id: v.user.id, name: v.user.name, email: v.user.email } : null,
          is_direct_visa_booking: true,
        });
      }
    });

    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [ordersData, visaData]);

  // Statistics calculation
  const totalOrdersCount = rawOrders.length;
  const completedOrdersCount = rawOrders.filter(
    (p) => p.status?.toLowerCase() === "success" || p.status?.toLowerCase() === "paid" || p.book_tour?.status === "completed"
  ).length;
  const pendingOrdersCount = rawOrders.filter(
    (p) =>
      p.status?.toLowerCase() === "pending" ||
      p.status?.toLowerCase() === "waiting" ||
      p.book_tour?.status === "pending" ||
      p.book_tour?.status === "draft"
  ).length;

  const totalGrossRevenue = useMemo(() => {
    return rawOrders
      .filter((p) => p.status?.toLowerCase() === "success" || p.status?.toLowerCase() === "paid")
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [rawOrders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return rawOrders.filter((order) => {
      // Search matches
      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        order.invoice_code?.toLowerCase().includes(query) ||
        order.user?.name?.toLowerCase().includes(query) ||
        order.user?.email?.toLowerCase().includes(query) ||
        order.booker?.name?.toLowerCase().includes(query) ||
        order.booker?.email?.toLowerCase().includes(query) ||
        order.book_document_visa?.booker?.name?.toLowerCase().includes(query) ||
        order.book_document_visa?.booker?.email?.toLowerCase().includes(query) ||
        order.book_document_visa?.customer_name?.toLowerCase().includes(query) ||
        order.book_document_visa?.customer_email?.toLowerCase().includes(query) ||
        order.payer_email?.toLowerCase().includes(query) ||
        order.transaction_id?.toLowerCase().includes(query) ||
        order.service_type?.toLowerCase().includes(query);

      // Service filter
      const matchService =
        serviceFilter === "all" ||
        (order.service_type || "").toLowerCase() === serviceFilter.toLowerCase() ||
        (serviceFilter === "document_visa" &&
          ((order.service_type || "").toLowerCase() === "visa" ||
            (order.service_type || "").toLowerCase() === "document_visa" ||
            Boolean(order.is_direct_visa_booking)));

      // Status filter
      const orderStatus = (order.status || "").toLowerCase();
      const matchStatus =
        statusFilter === "all" ||
        orderStatus === statusFilter.toLowerCase() ||
        (statusFilter === "success" &&
          (orderStatus === "paid" || orderStatus === "completed" || orderStatus === "approved")) ||
        (statusFilter === "pending" &&
          (orderStatus === "draft" ||
            orderStatus === "waiting" ||
            orderStatus === "under_review" ||
            orderStatus === "documents_submitted" ||
            orderStatus === "revision_required" ||
            orderStatus === "appointment_scheduled" ||
            orderStatus === "submitted_to_embassy")) ||
        (statusFilter === "cancelled" &&
          (orderStatus === "rejected" || orderStatus === "failed"));

      return matchSearch && matchService && matchStatus;
    });
  }, [rawOrders, searchQuery, serviceFilter, statusFilter]);

  // Reset page when search/filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, serviceFilter, statusFilter, pageSize]);

  // Paginated records
  const totalFiltered = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedOrders = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, safeCurrentPage, pageSize]);

  // Helpers
  const getServiceBadge = (serviceType?: any, invoiceCode?: string) => {
    const sType = formatMultilingual(serviceType);
    if (sType === "tour" || invoiceCode?.startsWith("TOUR-")) {
      return {
        label: "Tour & Religion",
        icon: <IconPackage className="size-3.5 mr-1 text-blue-600" />,
        className: "bg-blue-50 text-blue-700 border-blue-200"
      };
    }
    if (sType === "rent_motor" || invoiceCode?.startsWith("MOTOR-")) {
      return {
        label: "Rent Motor",
        icon: <IconMotorbike className="size-3.5 mr-1 text-amber-600" />,
        className: "bg-amber-50 text-amber-700 border-amber-200"
      };
    }
    if (
      sType === "document_visa" ||
      sType === "visa" ||
      invoiceCode?.includes("DOCVISA") ||
      invoiceCode?.startsWith("VISA-")
    ) {
      return {
        label: "Document & Visa",
        icon: <IconFileCertificate className="size-3.5 mr-1 text-purple-600" />,
        className: "bg-purple-50 text-purple-700 border-purple-200"
      };
    }
    return {
      label: sType || "Service Order",
      icon: <IconPackage className="size-3.5 mr-1 text-slate-500" />,
      className: "bg-slate-50 text-slate-700 border-slate-200"
    };
  };

  const getStatusBadge = (status?: any) => {
    const s = formatMultilingual(status)?.toLowerCase();
    switch (s) {
      case "success":
      case "paid":
        return {
          label: "Paid",
          className: "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold"
        };
      case "completed":
        return {
          label: "Completed",
          className: "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold"
        };
      case "approved":
        return {
          label: "Approved",
          className: "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold"
        };
      case "appointment_scheduled":
        return {
          label: "Appointment",
          className: "bg-blue-50 text-blue-700 border-blue-200 font-semibold"
        };
      case "submitted_to_embassy":
        return {
          label: "At Embassy",
          className: "bg-purple-50 text-purple-700 border-purple-200 font-semibold"
        };
      case "under_review":
        return {
          label: "Under Review",
          className: "bg-sky-50 text-sky-700 border-sky-200 font-semibold"
        };
      case "documents_submitted":
        return {
          label: "Docs Submitted",
          className: "bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold"
        };
      case "revision_required":
        return {
          label: "Revision Req.",
          className: "bg-amber-50 text-amber-700 border-amber-200 font-semibold"
        };
      case "pending":
      case "waiting":
      case "draft":
        return {
          label: "Pending",
          className: "bg-amber-50 text-amber-700 border-amber-200 font-semibold"
        };
      case "processing":
        return {
          label: "Processing",
          className: "bg-blue-50 text-blue-700 border-blue-200 font-semibold"
        };
      case "rejected":
        return {
          label: "Rejected",
          className: "bg-rose-50 text-rose-700 border-rose-200 font-semibold"
        };
      case "cancelled":
      case "failed":
        return {
          label: "Cancelled",
          className: "bg-rose-50 text-rose-700 border-rose-200 font-semibold"
        };
      default:
        return {
          label: formatMultilingual(status) || "Unknown",
          className: "bg-slate-50 text-slate-700 border-slate-200 font-semibold"
        };
    }
  };

  const formatCurrency = (amount: number | string, currency: string = "USD") => {
    const num = Number(amount) || 0;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      return new Intl.DateTimeFormat("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date(dateString));
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Header & Title Section */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 uppercase tracking-wider">
            <IconReceipt className="size-3.5" />
            <span>Booking & Transaction Management</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Customer Orders & Bookings
          </h1>
          <p className="text-xs text-slate-500">
            Monitor real-time reservations, payment verifications, and travel package fulfillment.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 text-xs font-semibold gap-1.5 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs">
            <IconRefresh className={cn("size-3.5", isFetching && "animate-spin text-blue-600")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* 2. Top KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Orders */}
        <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0">
            <IconReceipt className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-slate-500 font-medium truncate">Total Orders</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5 truncate">{totalOrdersCount}</p>
          </div>
        </div>

        {/* Completed Bookings */}
        <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
            <IconCheck className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-slate-500 font-medium truncate">Completed Bookings</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5 truncate">{completedOrdersCount}</p>
          </div>
        </div>

        {/* Pending Fulfillment */}
        <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="flex size-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 shrink-0">
            <IconClock className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-slate-500 font-medium truncate">Pending Orders</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5 truncate">{pendingOrdersCount}</p>
          </div>
        </div>

        {/* Gross Revenue */}
        <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0">
            <IconCurrencyDollar className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-slate-500 font-medium truncate">Gross Revenue (USD)</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5 truncate">
              {formatCurrency(totalGrossRevenue, "USD")}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Filter Toolbar Card */}
      <Card className="border-slate-200/80 shadow-xs bg-white py-0 gap-0 overflow-hidden">
        <CardContent className="p-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
            {/* Search Input */}
            <div className="relative min-w-[240px] max-w-sm flex-1">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                placeholder="Search by invoice, customer, email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 h-9 text-xs bg-slate-50/50 border-slate-200 rounded-lg focus-visible:ring-blue-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <IconX className="size-3.5" />
                </button>
              )}
            </div>

            {/* Dropdown Filters */}
            <div className="flex items-center gap-2">
              {/* Service Filter */}
              <Select
                value={serviceFilter}
                onValueChange={(val) => {
                  setServiceFilter(val);
                  setCurrentPage(1);
                }}>
                <SelectTrigger className="h-9 text-xs w-[140px] bg-slate-50/50 border-slate-200 shadow-2xs">
                  <SelectValue placeholder="All Services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All Services</SelectItem>
                  <SelectItem value="tour" className="text-xs">Tour & Religion</SelectItem>
                  <SelectItem value="rent_motor" className="text-xs">Rent Motor</SelectItem>
                  <SelectItem value="document_visa" className="text-xs">Document & Visa</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val);
                  setCurrentPage(1);
                }}>
                <SelectTrigger className="h-9 text-xs w-[130px] bg-slate-50/50 border-slate-200 shadow-2xs">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All Statuses</SelectItem>
                  <SelectItem value="success" className="text-xs">Success</SelectItem>
                  <SelectItem value="pending" className="text-xs">Pending</SelectItem>
                  <SelectItem value="cancelled" className="text-xs">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              {(searchQuery || serviceFilter !== "all" || statusFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setServiceFilter("all");
                    setStatusFilter("all");
                    setCurrentPage(1);
                  }}
                  className="h-9 text-xs text-slate-500 hover:text-slate-900 gap-1 px-2.5">
                  <IconFilter className="size-3.5" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Main Orders Table */}
      <Card className="border-slate-200/80 shadow-xs bg-white py-0 gap-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80 border-b border-slate-200/60">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-slate-600 px-4 py-2.5">Invoice & Order</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 px-4 py-2.5">Customer & Booker</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 px-4 py-2.5">Service</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 px-4 py-2.5">Amount</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 px-4 py-2.5">Payment</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 px-4 py-2.5 text-center">Status</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 px-4 py-2.5">Order Date</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 px-4 py-2.5 text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-56 text-center">
                    <div className="flex flex-col items-center justify-center gap-2.5 text-slate-500">
                      <Loader2 className="size-7 animate-spin text-blue-600" />
                      <p className="text-xs font-medium">Loading orders data...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-56 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-center text-slate-500">
                      <p className="text-sm font-bold text-rose-600">Failed to load orders</p>
                      <p className="text-xs text-slate-500 max-w-sm">
                        Unable to retrieve order transactions from the server.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        className="mt-2 text-xs h-8">
                        Try Again
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-28 text-center text-xs text-slate-400">
                    {searchQuery || serviceFilter !== "all" || statusFilter !== "all"
                      ? "No order records matched your active filter criteria."
                      : "New customer booking transactions will appear here."}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedOrders.map((order) => {
                  const serviceInfo = getServiceBadge(order.service_type, order.invoice_code);
                  const statusInfo = getStatusBadge(order.status);
                  const customerName =
                    formatMultilingual(
                      order.book_document_visa?.booker?.name ||
                      order.book_document_visa?.customer_name ||
                      order.book_tour?.booker?.name ||
                      order.booker?.name ||
                      order.user?.name
                    ) || "Guest Customer";
                  const customerEmail =
                    formatMultilingual(
                      order.book_document_visa?.booker?.email ||
                      order.book_document_visa?.customer_email ||
                      order.book_tour?.booker?.email ||
                      order.booker?.email ||
                      order.user?.email
                    ) || "-";

                  return (
                    <TableRow
                      key={order.id}
                      className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 text-xs">
                      {/* Invoice & Order */}
                      <TableCell className="px-4 py-2.5 font-mono">
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPaymentId(order.id);
                              setIsModalOpen(true);
                            }}
                            className="font-bold text-xs text-blue-600 bg-blue-50/80 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200/60 w-fit transition-colors text-left">
                            {formatMultilingual(order.invoice_code || order.id)}
                          </button>
                          {order.transaction_id && (
                            <span className="text-[10px] text-slate-400 font-sans">
                              TX: {formatMultilingual(order.transaction_id)}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Customer */}
                      <TableCell className="px-4 py-2.5">
                        <div className="flex flex-col min-w-0 max-w-[170px]">
                          <span className="font-bold text-xs text-slate-900 truncate">{customerName}</span>
                          <span className="text-[11px] text-slate-400 truncate">{customerEmail}</span>
                          {order.total_tourists || order.book_document_visa?.applicant_count ? (
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                              <IconUsers className="size-3" />
                              <span>
                                {order.total_tourists || order.book_document_visa?.applicant_count}{" "}
                                {order.service_type === "document_visa" || order.is_direct_visa_booking
                                  ? "applicants"
                                  : "guests"}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </TableCell>

                      {/* Service */}
                      <TableCell className="px-4 py-2.5">
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] font-semibold flex items-center w-fit px-1.5 py-0.5", serviceInfo.className)}>
                          {serviceInfo.icon}
                          {serviceInfo.label}
                        </Badge>
                      </TableCell>

                      {/* Amount */}
                      <TableCell className="px-4 py-2.5">
                        <span className="font-bold text-xs font-mono text-slate-900 tabular-nums">
                          {formatCurrency(order.amount, formatMultilingual(order.currency) || "USD")}
                        </span>
                      </TableCell>

                      {/* Payment Method */}
                      <TableCell className="px-4 py-2.5">
                        <span className="text-xs font-medium text-slate-700 capitalize">
                          {formatMultilingual(order.payment_method) || "Online"}
                        </span>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="px-4 py-2.5 text-center">
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] px-2 py-0.5 font-semibold", statusInfo.className)}>
                          {statusInfo.label}
                        </Badge>
                      </TableCell>

                      {/* Order Date */}
                      <TableCell className="px-4 py-2.5">
                        <span className="text-xs text-slate-600 whitespace-nowrap">
                          {formatDate(order.created_at)}
                        </span>
                      </TableCell>

                      {/* Action */}
                      <TableCell className="px-4 py-2.5 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedPaymentId(order.id);
                            setIsModalOpen(true);
                          }}
                          className="size-7 text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                          <IconEye className="size-4" />
                          <span className="sr-only">View Order</span>
                        </Button>
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
          currentPage={safeCurrentPage}
          pageSize={pageSize}
          totalItems={totalFiltered}
          itemName="orders"
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          className="pt-2 border-t border-slate-100 bg-transparent px-4 pb-3"
        />
      </Card>

      {/* Order Details Modal Popup */}
      <OrderDetailsModal
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
