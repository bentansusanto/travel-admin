"use client";

import Icon from "@/components/icon";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  useFindOrderByIdQuery,
  useUpdateStatusBookTourMutation
} from "@/store/services/orders.service";
import { Calendar, ChevronDown, MapPin, User } from "lucide-react";
import { useState } from "react";

interface OrderDetailsProps {
  paymentId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderDetails = ({ paymentId, isOpen, onClose }: OrderDetailsProps) => {
  const { data, isLoading, refetch } = useFindOrderByIdQuery(paymentId || "", {
    skip: !paymentId
  });

  const payment = data?.data;
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({});
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [updateStatus, { isLoading: isUpdating }] = useUpdateStatusBookTourMutation();

  const handleStatusChange = async (newStatus: string) => {
    if (!payment?.book_tour?.id) return;

    try {
      await updateStatus({
        id: payment.book_tour.id,
        status: newStatus
      }).unwrap();

      // Show success message
      console.log("Status updated successfully to:", newStatus);
      setIsStatusDropdownOpen(false);

      // Refetch the order data
      refetch();
    } catch (error: any) {
      console.error("Failed to update status:", error);
      // Optionally show error message
    }
  };

  const toggleDay = (day: number) => {
    setExpandedDays((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: currency || "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    try {
      return new Date(date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    } catch {
      return "-";
    }
  };

  const formatPaymentMethod = (method: string) => {
    return method?.charAt(0).toUpperCase() + method?.slice(1).toLowerCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[90vh] flex-col p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 border-b p-6">
          <DialogTitle>Detail Pesanan</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground text-lg">Loading order details...</div>
          </div>
        ) : !payment ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-destructive text-lg">Order not found</div>
          </div>
        ) : (
          <>
            {/* Fixed Payment Info Section */}
            <div className="shrink-0 border-b bg-gray-50/30 p-6">
              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-bold text-gray-900">Informasi Pembayaran</h3>
                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Invoice:</span>
                    <span className="font-mono font-medium text-blue-600">
                      {payment.invoice_code}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Metode:</span>
                    <span className="font-medium">
                      {formatPaymentMethod(payment.payment_method)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                        payment.status?.toLowerCase() === "success"
                          ? "bg-green-100 text-green-700"
                          : payment.status?.toLowerCase() === "pending"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                      )}>
                      {payment.status}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-100 pt-2">
                    <span className="font-semibold text-gray-900">Total Dibayar:</span>
                    <span className="font-bold text-blue-600">
                      {formatCurrency(payment.amount, payment.currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Booking Status */}
              {payment.book_tour?.status && (
                <div className="relative mt-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4 shadow-sm">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-blue-900">Booking Status</span>
                      <button
                        onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                        className="rounded p-0.5 transition-colors hover:bg-blue-100">
                        <Icon name="Pencil" className="h-3.5 w-3.5 text-blue-600" />
                      </button>
                    </div>
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                        payment.book_tour.status?.toLowerCase() === "completed" ||
                          payment.book_tour.status?.toLowerCase() === "ongoing"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      )}>
                      {payment.book_tour.status}
                    </span>
                  </div>

                  {/* Status Dropdown */}
                  {isStatusDropdownOpen && (
                    <div className="absolute top-full right-0 left-0 z-10 mt-2 rounded-lg border border-gray-200 bg-white shadow-lg">
                      <div className="p-2">
                        <p className="mb-2 px-2 text-xs font-semibold text-gray-500">
                          Change Status
                        </p>
                        {["draft", "pending", "ongoing", "completed", "cancelled"].map((status) => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(status)}
                            className={cn(
                              "w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-gray-100",
                              payment.book_tour?.status?.toLowerCase() === status &&
                                "bg-blue-50 font-medium text-blue-700"
                            )}>
                            <div className="flex items-center justify-between">
                              <span className="capitalize">{status}</span>
                              {payment.book_tour?.status?.toLowerCase() === status && (
                                <Icon name="Check" className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              {/* Customer Information */}
              {payment.user && (
                <div className="rounded-xl border border-gray-100 p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900">
                    <User className="h-4 w-4" />
                    Informasi Customer
                  </h3>
                  <div className="grid gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Nama:</span>
                      <span className="font-medium">{payment.user.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email:</span>
                      <span className="font-medium">{payment.user.email}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tour Itinerary */}
              {payment.service_type === "tour" &&
                payment.book_tour?.book_tour_items?.length > 0 && (
                  <div className="rounded-xl border border-gray-100 p-4">
                    <h3 className="mb-4 text-sm font-bold text-gray-900">
                      Detail Itinerary ({payment.book_tour.book_tour_items.length} Destinasi)
                    </h3>
                    <div className="space-y-0">
                      {payment.book_tour.book_tour_items.map((item: any, index: number) => {
                        const dayNumber = index + 1;
                        const isExpanded = expandedDays[dayNumber];
                        const isLast = index === payment.book_tour.book_tour_items.length - 1;

                        return (
                          <div key={item.id} className="relative border-l-2 border-blue-300 pl-6">
                            {/* Timeline dot */}
                            <div className="absolute top-0 -left-[9px] h-4 w-4 rounded-full border-2 border-blue-500 bg-white"></div>

                            {/* Itinerary item */}
                            <div className={!isLast ? "pb-6" : ""}>
                              {/* Header - Always visible */}
                              <button
                                onClick={() => toggleDay(dayNumber)}
                                className="-ml-3 w-full rounded-lg p-3 text-left transition-colors hover:bg-gray-50">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    {/* Day number */}
                                    <div className="mb-1 text-[10px] font-bold tracking-wider text-blue-500 uppercase">
                                      Day {dayNumber}
                                    </div>

                                    {/* Destination name */}
                                    <h4 className="mb-1 text-sm font-bold text-gray-900">
                                      {item.destination?.name || "Destination"}
                                    </h4>

                                    <div className="flex flex-col gap-1">
                                      {item.destination?.location && (
                                        <p className="flex items-center text-[11px] text-gray-500">
                                          <MapPin className="mr-1 h-3.5 w-3.5 text-gray-400" />
                                          {item.destination.location}
                                        </p>
                                      )}
                                      <p className="flex items-center text-[11px] text-gray-400">
                                        <Calendar className="mr-1 h-3.5 w-3.5" />
                                        {formatDate(item.visit_date)}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Chevron icon */}
                                  <ChevronDown
                                    className={`h-5 w-5 flex-shrink-0 text-gray-400 transition-transform ${
                                      isExpanded ? "rotate-180" : ""
                                    }`}
                                  />
                                </div>
                              </button>

                              {/* Expandable Detail Tour */}
                              {isExpanded &&
                                item.destination?.detail_tour &&
                                item.destination.detail_tour.length > 0 && (
                                  <div className="mt-3 rounded-lg border border-blue-100/50 bg-blue-50/50 p-4">
                                    <p className="mb-3 text-xs font-bold text-blue-800">
                                      Detail Rencana Perjalanan:
                                    </p>
                                    <ul className="space-y-2">
                                      {item.destination.detail_tour.map(
                                        (detail: string, idx: number) => (
                                          <li
                                            key={idx}
                                            className="flex items-start gap-2 text-xs text-gray-700">
                                            <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                              <span className="text-[8px] font-bold">
                                                {idx + 1}
                                              </span>
                                            </div>
                                            <span className="leading-relaxed">{detail}</span>
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* Travelers Information */}
              {payment.book_tour?.tourists && payment.book_tour.tourists.length > 0 && (
                <div className="rounded-xl border border-gray-100 p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900">
                    <User className="h-4 w-4" />
                    Data Traveler ({payment.book_tour.tourists.length} Orang)
                  </h3>
                  <div className="space-y-3">
                    {payment.book_tour.tourists.map((tourist: any, index: number) => (
                      <div
                        key={tourist.id}
                        className="rounded-lg border border-gray-100 bg-gray-50/30 p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <h5 className="text-sm font-semibold">Traveler {index + 1}</h5>
                          <Badge variant="outline" className="text-xs">
                            {tourist.gender}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-gray-500">Nama:</p>
                            <p className="font-medium">{tourist.name}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Nationality:</p>
                            <p className="font-medium">{tourist.nationality}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Passport:</p>
                            <p className="font-medium">{tourist.passport_number}</p>
                          </div>
                          {tourist.phone_number && (
                            <div>
                              <p className="text-gray-500">Phone:</p>
                              <p className="font-medium">{tourist.phone_number}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
