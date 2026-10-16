"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, formatMultilingual } from "@/lib/utils";
import {
  useFindOrderByIdQuery,
  useUpdateStatusBookMotorMutation,
  useUpdateStatusBookTourMutation,
  useFindBookDocumentVisaByIdQuery,
  useUpdateStatusBookDocumentVisaMutation,
  useReviewApplicantFileMutation
} from "@/store/services/orders.service";
import {
  IconAlertTriangle,
  IconCalendar,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconClock,
  IconCreditCard,
  IconExternalLink,
  IconFileCertificate,
  IconFileText,
  IconMail,
  IconMapPin,
  IconMotorbike,
  IconPackage,
  IconPhone,
  IconPrinter,
  IconReceipt,
  IconTruck,
  IconUser,
  IconUsers,
  IconX
} from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface OrderDetailsModalProps {
  paymentId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderDetailsModal = ({
  paymentId,
  isOpen,
  onClose
}: OrderDetailsModalProps) => {
  const isDirectVisa = paymentId?.startsWith("visa_") ?? false;
  const directVisaId = isDirectVisa ? paymentId!.replace("visa_", "") : null;

  // 1. Fetch Payment (if not direct visa)
  const {
    data: paymentData,
    isLoading: isLoadingPayment,
    refetch: refetchPayment
  } = useFindOrderByIdQuery(paymentId || "", {
    skip: !paymentId || isDirectVisa
  });

  const payment = paymentData?.data;

  // 2. Determine Visa Booking ID (from direct booking or payment record)
  const finalVisaId = isDirectVisa
    ? directVisaId
    : payment?.book_document_visa_id || payment?.book_document_visa?.id || null;

  // 3. Fetch Visa Details (if visa order)
  const {
    data: visaQueryData,
    isLoading: isLoadingVisa,
    refetch: refetchVisa
  } = useFindBookDocumentVisaByIdQuery(finalVisaId || "", {
    skip: !finalVisaId
  });

  const visaDetail = visaQueryData?.data || payment?.book_document_visa;
  const isVisaOrder = Boolean(
    isDirectVisa ||
    payment?.service_type === "document_visa" ||
    payment?.service_type === "visa" ||
    finalVisaId
  );

  // Status mutations
  const [updateTourStatus, { isLoading: isUpdatingTour }] = useUpdateStatusBookTourMutation();
  const [updateMotorStatus, { isLoading: isUpdatingMotor }] = useUpdateStatusBookMotorMutation();
  const [updateVisaStatus, { isLoading: isUpdatingVisa }] = useUpdateStatusBookDocumentVisaMutation();
  const [reviewApplicantFile, { isLoading: isReviewingFile }] = useReviewApplicantFileMutation();

  // Local state
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({});
  const [isLogisticsOpen, setIsLogisticsOpen] = useState(false);
  const [rejectingFileId, setRejectingFileId] = useState<string | null>(null);
  const [fileRejectionNote, setFileRejectionNote] = useState("");

  const [visaFormState, setVisaFormState] = useState({
    status: "",
    appointment_date: "",
    appointment_location: "",
    embassy_application_id: "",
    tracking_number: "",
    admin_notes: "",
    rejection_reason: ""
  });

  const isPaymentPaid =
    payment?.status?.toLowerCase() === "success" ||
    payment?.status?.toLowerCase() === "paid";

  const rawVisaStatus = formatMultilingual(visaDetail?.status)?.toLowerCase();

  // If the payment succeeded, visa booking should not remain stuck in draft, pending, or stale cancelled
  const isStaleVisaStatus =
    !rawVisaStatus ||
    rawVisaStatus === "draft" ||
    rawVisaStatus === "pending" ||
    (rawVisaStatus === "cancelled" && !visaDetail?.rejection_reason);

  const effectiveVisaStatus =
    isPaymentPaid && isStaleVisaStatus
      ? "paid"
      : rawVisaStatus || (isPaymentPaid ? "paid" : "pending");

  useEffect(() => {
    if (visaDetail || payment) {
      setVisaFormState({
        status: effectiveVisaStatus,
        appointment_date: visaDetail?.appointment_date
          ? new Date(visaDetail.appointment_date).toISOString().slice(0, 10)
          : "",
        appointment_location: formatMultilingual(visaDetail?.appointment_location) || "",
        embassy_application_id: formatMultilingual(visaDetail?.embassy_application_id) || "",
        tracking_number: formatMultilingual(visaDetail?.tracking_number) || "",
        admin_notes: formatMultilingual(visaDetail?.admin_notes) || "",
        rejection_reason: formatMultilingual(visaDetail?.rejection_reason) || ""
      });
    }
  }, [visaDetail, payment, effectiveVisaStatus]);

  const currentBookingStatus = isVisaOrder
    ? effectiveVisaStatus
    : payment?.service_type === "tour"
    ? formatMultilingual(payment?.book_tour?.status)
    : payment?.service_type === "rent_motor"
    ? formatMultilingual(payment?.book_motor?.status)
    : formatMultilingual(payment?.status);

  // Handlers for tour/motor status
  const handleStatusChange = async (newStatus: string) => {
    try {
      if (payment?.service_type === "tour" && payment?.book_tour?.id) {
        await updateTourStatus({
          id: payment.book_tour.id,
          status: newStatus
        }).unwrap();
        toast.success(`Booking status updated to ${newStatus}`);
      } else if (payment?.service_type === "rent_motor" && payment?.book_motor?.id) {
        await updateMotorStatus({
          id: payment.book_motor.id,
          status: newStatus
        }).unwrap();
        toast.success(`Motor rental status updated to ${newStatus}`);
      }
      refetchPayment();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update status");
    }
  };

  // Handlers for visa status
  const handleVisaStatusChange = async (newStatus: string) => {
    if (!finalVisaId) return;

    setVisaFormState((prev) => ({ ...prev, status: newStatus }));

    if (
      newStatus === "appointment_scheduled" ||
      newStatus === "submitted_to_embassy" ||
      newStatus === "revision_required" ||
      newStatus === "rejected"
    ) {
      setIsLogisticsOpen(true);
    }

    try {
      await updateVisaStatus({
        id: finalVisaId,
        status: newStatus
      }).unwrap();
      toast.success(`Visa booking status updated to ${newStatus.replace("_", " ")}`);
      refetchVisa();
      if (!isDirectVisa) refetchPayment();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update visa status");
    }
  };

  const handleSaveVisaDetails = async () => {
    if (!finalVisaId) return;
    try {
      await updateVisaStatus({
        id: finalVisaId,
        status: visaFormState.status || effectiveVisaStatus || "pending",
        appointment_date: visaFormState.appointment_date || undefined,
        appointment_location: visaFormState.appointment_location || undefined,
        embassy_application_id: visaFormState.embassy_application_id || undefined,
        tracking_number: visaFormState.tracking_number || undefined,
        admin_notes: visaFormState.admin_notes || undefined,
        rejection_reason: visaFormState.rejection_reason || undefined
      }).unwrap();
      toast.success("Embassy & tracking details saved successfully");
      setIsLogisticsOpen(false);
      refetchVisa();
      if (!isDirectVisa) refetchPayment();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save visa details");
    }
  };

  const handleReviewFile = async (
    fileId: string,
    reviewStatus: "verified" | "rejected",
    note?: string
  ) => {
    try {
      await reviewApplicantFile({
        fileId,
        review_status: reviewStatus,
        rejection_note: note
      }).unwrap();
      toast.success(`Requirement file marked as ${reviewStatus}`);
      setRejectingFileId(null);
      setFileRejectionNote("");
      refetchVisa();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update file review status");
    }
  };

  const toggleDay = (day: number) => {
    setExpandedDays((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  const formatCurrency = (amount: number | string, currency: string = "USD") => {
    const num = Number(amount) || 0;
    const curr = formatMultilingual(currency);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: curr.toUpperCase() === "IDR" ? "IDR" : "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const formatSimpleDate = (dateString?: string | Date) => {
    if (!dateString) return "-";
    try {
      return new Intl.DateTimeFormat("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric"
      }).format(new Date(dateString));
    } catch {
      return String(dateString);
    }
  };

  const getStatusBadge = (status?: any) => {
    const s = formatMultilingual(status)?.toLowerCase();
    switch (s) {
      case "success":
      case "paid":
        return { label: "Paid", className: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "completed":
        return { label: "Completed", className: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "approved":
        return { label: "Approved", className: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "appointment_scheduled":
        return { label: "Appointment Scheduled", className: "bg-blue-50 text-blue-700 border-blue-200" };
      case "submitted_to_embassy":
        return { label: "Submitted to Embassy", className: "bg-purple-50 text-purple-700 border-purple-200" };
      case "under_review":
        return { label: "Under Review", className: "bg-sky-50 text-sky-700 border-sky-200" };
      case "documents_submitted":
        return { label: "Documents Submitted", className: "bg-indigo-50 text-indigo-700 border-indigo-200" };
      case "revision_required":
        return { label: "Revision Required", className: "bg-amber-50 text-amber-700 border-amber-200" };
      case "confirmed":
        return { label: "Confirmed", className: "bg-blue-50 text-blue-700 border-blue-200" };
      case "pending":
      case "draft":
        return { label: "Pending", className: "bg-amber-50 text-amber-700 border-amber-200" };
      case "ongoing":
        return { label: "Ongoing", className: "bg-blue-50 text-blue-700 border-blue-200" };
      case "rejected":
        return { label: "Rejected", className: "bg-rose-50 text-rose-700 border-rose-200" };
      case "cancelled":
      case "failed":
        return { label: "Cancelled", className: "bg-rose-50 text-rose-700 border-rose-200" };
      default:
        return { label: formatMultilingual(status) || "Unknown", className: "bg-slate-50 text-slate-700 border-slate-200" };
    }
  };

  const isLoading = isDirectVisa ? isLoadingVisa : isLoadingPayment;
  const hasData = isDirectVisa ? Boolean(visaDetail) : Boolean(payment || visaDetail);

  // Derived Info
  const invoiceCode = formatMultilingual(
    payment?.invoice_code ||
    (isDirectVisa && finalVisaId
      ? finalVisaId.startsWith("INV-")
        ? finalVisaId
        : `VISA-${finalVisaId.slice(0, 8).toUpperCase()}`
      : "-")
  );

  const customerName = isVisaOrder
    ? formatMultilingual(
        visaDetail?.booker_name ||
        visaDetail?.customer_name ||
        visaDetail?.user_name ||
        payment?.booker?.name ||
        payment?.user?.name
      ) || "Guest Customer"
    : formatMultilingual(
        payment?.book_tour?.booker?.name ||
        payment?.booker?.name ||
        payment?.user?.name
      ) || "Guest Customer";

  const customerEmail = isVisaOrder
    ? formatMultilingual(
        visaDetail?.booker_email ||
        visaDetail?.customer_email ||
        payment?.booker?.email ||
        payment?.user?.email
      ) || "-"
    : formatMultilingual(
        payment?.book_tour?.booker?.email ||
        payment?.booker?.email ||
        payment?.user?.email
      ) || "-";

  const customerPhone = isVisaOrder
    ? formatMultilingual(visaDetail?.booker_phone || payment?.booker?.phone_number) || "-"
    : formatMultilingual(payment?.book_tour?.booker?.phone_number || payment?.booker?.phone_number) || "-";

  const totalAmount = isVisaOrder
    ? visaDetail?.total_price || payment?.amount || 0
    : payment?.amount || 0;

  const paymentMethod = formatMultilingual(payment?.payment_method) || (isDirectVisa ? "Direct Booking" : "Online");

  const totalTravelers = isVisaOrder
    ? visaDetail?.applicant_count || visaDetail?.applicants?.length || 1
    : payment?.total_tourists || payment?.book_tour?.tourists?.length || 1;

  const orderDate = isVisaOrder
    ? visaDetail?.created_at || payment?.created_at
    : payment?.created_at;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-xl md:max-w-3xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden bg-white border-slate-200 shadow-2xl rounded-2xl">
        {/* Modal Header */}
        <DialogHeader className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-slate-200 bg-slate-50/70 shrink-0 text-left items-start">
          <div className="flex items-start gap-3 w-full text-left">
            <div
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-lg text-white shadow-xs mt-0.5",
                isVisaOrder ? "bg-purple-600" : "bg-blue-600"
              )}>
              {isVisaOrder ? (
                <IconFileCertificate className="size-4.5" />
              ) : (
                <IconReceipt className="size-4.5" />
              )}
            </div>
            <div className="flex-1 min-w-0 space-y-1.5 text-left">
              <div className="text-left">
                <DialogTitle className="text-sm font-bold text-slate-900 leading-tight text-left">
                  {isVisaOrder ? "Document & Visa Order Details" : "Order Details"}
                </DialogTitle>
                <DialogDescription className="text-[11px] text-slate-500 mt-0.5 text-left">
                  {isVisaOrder
                    ? "Transaction overview, visa applicant manifest, and document requirement verification."
                    : "Transaction overview, itinerary, and passenger manifest."}
                </DialogDescription>
              </div>

              <div className="flex items-center gap-1.5 pt-0.5 justify-start">
                {invoiceCode && invoiceCode !== "-" && (
                  <span className="font-mono text-[10px] sm:text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 whitespace-nowrap">
                    {invoiceCode}
                  </span>
                )}
                {currentBookingStatus && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[9px] sm:text-[10px] font-semibold whitespace-nowrap py-0 h-5",
                      getStatusBadge(currentBookingStatus).className
                    )}>
                    {getStatusBadge(currentBookingStatus).label}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Modal Body */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-500">
            <Loader2 className="size-7 animate-spin text-blue-600" />
            <p className="text-xs font-medium">Loading order details...</p>
          </div>
        ) : !hasData ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-center text-slate-500">
            <IconAlertTriangle className="size-7 text-rose-500" />
            <p className="text-sm font-bold text-slate-900">Order record not found</p>
            <p className="text-xs text-slate-500">Unable to retrieve the requested record.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Top Quick Overview Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
              <div>
                <p className="text-[10px] font-medium text-slate-500">Total Paid</p>
                <p className="text-sm font-bold text-blue-600 mt-0.5">
                  {formatCurrency(totalAmount, payment?.currency || "USD")}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-slate-500">Payment Gateway</p>
                <p className="font-semibold text-slate-900 mt-0.5 capitalize">{paymentMethod}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-slate-500">
                  {isVisaOrder ? "Total Applicants" : "Total Guests"}
                </p>
                <p className="font-semibold text-slate-900 mt-0.5">
                  {totalTravelers} {isVisaOrder ? "Applicants" : "Travelers"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-slate-500">Order Date</p>
                <p className="font-semibold text-slate-700 mt-0.5">{formatSimpleDate(orderDate)}</p>
              </div>
            </div>

            {/* Document Visa Status & Management Bar */}
            {isVisaOrder && (
              <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/40 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <IconFileCertificate className="size-4 text-purple-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Visa Application Lifecycle</p>
                      <p className="text-[10px] text-slate-500">
                        Current Status:{" "}
                        <strong className="capitalize text-purple-700">
                          {getStatusBadge(visaFormState.status || effectiveVisaStatus).label}
                        </strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select
                      value={visaFormState.status || effectiveVisaStatus}
                      onValueChange={handleVisaStatusChange}
                      disabled={isUpdatingVisa}>
                      <SelectTrigger className="h-8 w-[165px] text-xs bg-white border-purple-200 shadow-2xs font-medium">
                        <SelectValue placeholder="Update Status">
                          {getStatusBadge(visaFormState.status || effectiveVisaStatus).label}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft" className="text-xs">Draft</SelectItem>
                        <SelectItem value="pending" className="text-xs">Pending</SelectItem>
                        <SelectItem value="paid" className="text-xs">Paid</SelectItem>
                        <SelectItem value="documents_submitted" className="text-xs">Documents Submitted</SelectItem>
                        <SelectItem value="under_review" className="text-xs">Under Review</SelectItem>
                        <SelectItem value="revision_required" className="text-xs">Revision Required</SelectItem>
                        <SelectItem value="submitted_to_embassy" className="text-xs">Submitted to Embassy</SelectItem>
                        <SelectItem value="appointment_scheduled" className="text-xs">Appointment Scheduled</SelectItem>
                        <SelectItem value="approved" className="text-xs">Approved</SelectItem>
                        <SelectItem value="rejected" className="text-xs">Rejected</SelectItem>
                        <SelectItem value="completed" className="text-xs">Completed</SelectItem>
                        <SelectItem value="cancelled" className="text-xs">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsLogisticsOpen(!isLogisticsOpen)}
                      className="h-8 text-xs font-semibold gap-1.5 bg-white border-purple-200 text-purple-700 hover:bg-purple-50 shadow-2xs">
                      <IconTruck className="size-3.5 text-purple-600" />
                      <span>Embassy & Tracking</span>
                      {isLogisticsOpen ? (
                        <IconChevronUp className="size-3.5 text-slate-400" />
                      ) : (
                        <IconChevronDown className="size-3.5 text-slate-400" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Expandable Embassy Appointment & Courier Tracking Form */}
                {isLogisticsOpen && (
                  <div className="pt-2 border-t border-purple-200/80 space-y-3 bg-white p-3 rounded-lg border">
                    <div>
                      <h5 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <IconTruck className="size-3.5 text-purple-600" />
                        <span>Embassy Appointment & Courier Tracking</span>
                      </h5>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Catatan jadwal janji temu kedutaan, nomor registrasi aplikasi, dan resi kurir pengiriman paspor.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <Label className="text-[10px] text-slate-600 font-semibold">
                          Tanggal Janji Temu / Biometrik (Appointment Date)
                        </Label>
                        <Input
                          type="date"
                          value={visaFormState.appointment_date}
                          onChange={(e) =>
                            setVisaFormState({ ...visaFormState, appointment_date: e.target.value })
                          }
                          className="h-8 text-xs mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-slate-600 font-semibold">
                          Lokasi Janji Temu (Appointment Location)
                        </Label>
                        <Input
                          placeholder="misal: VFS Global Kuningan, Jakarta"
                          value={visaFormState.appointment_location}
                          onChange={(e) =>
                            setVisaFormState({ ...visaFormState, appointment_location: e.target.value })
                          }
                          className="h-8 text-xs mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-slate-600 font-semibold">
                          No. Aplikasi / Registrasi Kedutaan (Embassy ID)
                        </Label>
                        <Input
                          placeholder="misal: EMB-JPN-2026-8812"
                          value={visaFormState.embassy_application_id}
                          onChange={(e) =>
                            setVisaFormState({ ...visaFormState, embassy_application_id: e.target.value })
                          }
                          className="h-8 text-xs mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-slate-600 font-semibold">
                          No. Resi Pengiriman Paspor (Courier Tracking #)
                        </Label>
                        <Input
                          placeholder="misal: JNE-CGK-9901823"
                          value={visaFormState.tracking_number}
                          onChange={(e) =>
                            setVisaFormState({ ...visaFormState, tracking_number: e.target.value })
                          }
                          className="h-8 text-xs mt-1"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label className="text-[10px] text-slate-600 font-semibold">
                          Catatan Internal Staf / Admin (Internal Notes)
                        </Label>
                        <Input
                          placeholder="Catatan khusus operasional internal staf..."
                          value={visaFormState.admin_notes}
                          onChange={(e) =>
                            setVisaFormState({ ...visaFormState, admin_notes: e.target.value })
                          }
                          className="h-8 text-xs mt-1"
                        />
                      </div>
                      {visaFormState.status === "rejected" || visaFormState.status === "revision_required" ? (
                        <div className="sm:col-span-2">
                          <Label className="text-[10px] text-rose-600 font-semibold">
                            Alasan Penolakan / Revisi Dokumen (Rejection Reason)
                          </Label>
                          <Input
                            placeholder="Alasan penolakan atau perbaikan dokumen yang diperlukan..."
                            value={visaFormState.rejection_reason}
                            onChange={(e) =>
                              setVisaFormState({ ...visaFormState, rejection_reason: e.target.value })
                            }
                            className="h-8 text-xs mt-1 border-rose-200"
                          />
                        </div>
                      ) : null}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsLogisticsOpen(false)}
                        className="h-7 text-xs">
                        Tutup
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        disabled={isUpdatingVisa}
                        onClick={handleSaveVisaDetails}
                        className="h-7 text-xs bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-2xs">
                        {isUpdatingVisa ? <Loader2 className="size-3 animate-spin mr-1" /> : null}
                        Simpan Detail
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tour & Motor Status Bar (for non-visa orders) */}
            {!isVisaOrder &&
              ((payment?.service_type === "tour" && payment?.book_tour?.id) ||
                (payment?.service_type === "rent_motor" && payment?.book_motor?.id)) && (
                <div className="p-3 rounded-xl border border-blue-100 bg-blue-50/50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {payment?.service_type === "tour" ? (
                      <IconPackage className="size-4 text-blue-600 shrink-0" />
                    ) : (
                      <IconMotorbike className="size-4 text-emerald-600 shrink-0" />
                    )}
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {payment?.service_type === "tour" ? "Tour Booking Status" : "Motor Rental Status"}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Current: <strong className="capitalize text-slate-700">{formatMultilingual(currentBookingStatus) || "Pending"}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Select
                      value={formatMultilingual(currentBookingStatus) || "pending"}
                      onValueChange={handleStatusChange}
                      disabled={isUpdatingTour || isUpdatingMotor}>
                      <SelectTrigger className="h-8 w-[135px] text-xs bg-white border-blue-200">
                        <SelectValue placeholder="Status">
                          {currentBookingStatus
                            ? formatMultilingual(currentBookingStatus).charAt(0).toUpperCase() + formatMultilingual(currentBookingStatus).slice(1)
                            : "Select Status"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft" className="text-xs">Draft</SelectItem>
                        <SelectItem value="pending" className="text-xs">Pending</SelectItem>
                        <SelectItem value="confirmed" className="text-xs">Confirmed</SelectItem>
                        <SelectItem value="ongoing" className="text-xs">Ongoing</SelectItem>
                        <SelectItem value="completed" className="text-xs">Completed</SelectItem>
                        <SelectItem value="cancelled" className="text-xs">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

            {/* Customer & Booker Info */}
            <div className="p-3.5 rounded-xl border border-slate-200/80 space-y-2 text-xs">
              <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-slate-500">
                <IconUser className="size-3.5 text-slate-600" />
                <span>Customer & Booker Information</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div>
                  <p className="text-[11px] text-slate-500">Full Name</p>
                  <p className="font-semibold text-slate-900">{customerName}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Email Address</p>
                  <p className="font-semibold text-slate-900">{customerEmail}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Phone Number</p>
                  <p className="font-medium text-slate-700">{customerPhone}</p>
                </div>
              </div>

              {visaDetail?.shipping_address && (
                <div className="pt-2 border-t border-slate-100 flex items-start gap-1.5 text-slate-600">
                  <IconTruck className="size-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      Passport Return / Shipping Address:
                    </span>
                    <p className="text-xs text-slate-800 mt-0.5">
                      {formatMultilingual(visaDetail.shipping_address)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Visa Service & Package Information */}
            {isVisaOrder && visaDetail && (
              <div className="p-3.5 rounded-xl border border-slate-200/80 space-y-2.5 text-xs">
                <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-slate-500">
                  <IconFileCertificate className="size-3.5 text-purple-600" />
                  <span>Visa Service & Package Details</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  <div>
                    <p className="text-[10px] text-slate-500">Destination / Visa</p>
                    <p className="font-semibold text-slate-900">
                      {formatMultilingual(visaDetail.document_visa_title) ||
                        formatMultilingual(visaDetail.country_name) ||
                        "Visa Service"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500">Selected Package</p>
                    <p className="font-semibold text-slate-900">
                      {formatMultilingual(visaDetail.package_name) || "Standard Package"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500">Processing Time</p>
                    <p className="font-semibold text-slate-900">
                      {visaDetail.processing_time_days
                        ? `${visaDetail.processing_time_days} business days`
                        : "Standard"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500">Target Travel Date</p>
                    <p className="font-semibold text-slate-900">
                      {formatSimpleDate(visaDetail.target_travel_date)}
                    </p>
                  </div>
                </div>

                {/* Logistics Badges */}
                {(visaDetail.appointment_date ||
                  visaDetail.embassy_application_id ||
                  visaDetail.tracking_number) && (
                  <div className="mt-2 pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                    {visaDetail.appointment_date && (
                      <div className="flex items-center gap-1.5 text-slate-700 bg-slate-50 p-1.5 rounded border border-slate-200/60">
                        <IconCalendar className="size-3.5 text-blue-600 shrink-0" />
                        <span className="truncate">
                          Appt: {formatSimpleDate(visaDetail.appointment_date)}
                          {visaDetail.appointment_location
                            ? ` (${formatMultilingual(visaDetail.appointment_location)})`
                            : ""}
                        </span>
                      </div>
                    )}
                    {visaDetail.embassy_application_id && (
                      <div className="flex items-center gap-1.5 text-slate-700 bg-slate-50 p-1.5 rounded border border-slate-200/60">
                        <IconFileText className="size-3.5 text-purple-600 shrink-0" />
                        <span className="truncate">
                          Embassy: {formatMultilingual(visaDetail.embassy_application_id)}
                        </span>
                      </div>
                    )}
                    {visaDetail.tracking_number && (
                      <div className="flex items-center gap-1.5 text-slate-700 bg-slate-50 p-1.5 rounded border border-slate-200/60">
                        <IconTruck className="size-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">
                          Tracking: {formatMultilingual(visaDetail.tracking_number)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {visaDetail.note && (
                  <div className="mt-2 pt-2 border-t border-slate-100 text-slate-600">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Customer Note:</span>
                    <p className="text-xs text-slate-700 italic mt-0.5 bg-slate-50 p-2 rounded">
                      &quot;{formatMultilingual(visaDetail.note)}&quot;
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Visa Applicants Manifest & Requirement Files */}
            {isVisaOrder && visaDetail?.applicants && visaDetail.applicants.length > 0 && (
              <div className="p-3.5 rounded-xl border border-slate-200/80 space-y-3 text-xs">
                <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <IconUsers className="size-3.5 text-purple-600" />
                    <span>
                      Applicant Manifest & Documents ({visaDetail.applicants.length} Travelers)
                    </span>
                  </div>
                </h4>

                <div className="space-y-3 pt-1">
                  {visaDetail.applicants.map((applicant: any, idx: number) => {
                    return (
                      <div
                        key={applicant.id || idx}
                        className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 space-y-2.5">
                        {/* Applicant Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-slate-200 gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className="flex size-5 items-center justify-center rounded-full bg-purple-100 text-purple-700 font-bold text-[10px]">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-slate-900 text-xs">
                              {formatMultilingual(applicant.full_name)}
                            </span>
                            <Badge variant="outline" className="text-[9px] uppercase px-1.5 py-0 h-4">
                              {formatMultilingual(applicant.gender) || "Applicant"}
                            </Badge>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[9px] font-semibold uppercase px-1.5 py-0 h-4 w-fit",
                              applicant.status === "verified"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : applicant.status === "rejected"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            )}>
                            {formatMultilingual(applicant.status)?.replace("_", " ") || "Pending"}
                          </Badge>
                        </div>

                        {/* Applicant Passport & Personal Details */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Nationality</span>
                            <strong className="text-slate-800">
                              {formatMultilingual(applicant.nationality) || "Indonesia"}
                            </strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Passport Number</span>
                            <strong className="text-slate-800 font-mono">
                              {formatMultilingual(applicant.passport_number) || "-"}
                            </strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Passport Expiry</span>
                            <strong className="text-slate-800">
                              {formatSimpleDate(applicant.passport_expiry_date)}
                            </strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Date of Birth</span>
                            <strong className="text-slate-800">
                              {formatSimpleDate(applicant.birth_date)}
                            </strong>
                          </div>
                        </div>

                        {/* Uploaded Requirement Files */}
                        <div className="pt-2 border-t border-slate-200 space-y-1.5">
                          <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                            <IconFileText className="size-3 text-slate-500" />
                            <span>Uploaded Requirement Documents ({applicant.files?.length || 0})</span>
                          </p>

                          {!applicant.files || applicant.files.length === 0 ? (
                            <p className="text-[11px] text-slate-400 italic bg-white p-2 rounded border border-slate-100">
                              No requirement files uploaded yet by applicant.
                            </p>
                          ) : (
                            <div className="space-y-1.5">
                              {applicant.files.map((file: any) => {
                                const isVerified = file.review_status === "verified";
                                const isRejected = file.review_status === "rejected";
                                const isBeingRejected = rejectingFileId === file.id;

                                return (
                                  <div
                                    key={file.id}
                                    className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1.5">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                                      <div className="space-y-0.5 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                          <p className="text-xs font-semibold text-slate-800 truncate">
                                            {formatMultilingual(file.requirement_name) || "Document Requirement"}
                                          </p>
                                          <Badge
                                            variant="outline"
                                            className={cn(
                                              "text-[9px] uppercase px-1.5 py-0 h-4 font-semibold",
                                              isVerified
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                : isRejected
                                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                                : "bg-amber-50 text-amber-700 border-amber-200"
                                            )}>
                                            {formatMultilingual(file.review_status) || "Pending"}
                                          </Badge>
                                        </div>
                                        <p className="text-[10px] text-slate-400 truncate">
                                          File: {formatMultilingual(file.file_name)}
                                        </p>
                                      </div>

                                      <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                                        {file.file_url && (
                                          <a
                                            href={file.file_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded transition-colors">
                                            <IconExternalLink className="size-3" />
                                            View
                                          </a>
                                        )}

                                        {!isVerified && (
                                          <Button
                                            type="button"
                                            size="sm"
                                            disabled={isReviewingFile}
                                            onClick={() => handleReviewFile(file.id, "verified")}
                                            className="h-6 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-2 gap-1">
                                            <IconCheck className="size-3" />
                                            Verify
                                          </Button>
                                        )}

                                        {!isRejected && (
                                          <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={isReviewingFile}
                                            onClick={() => {
                                              if (isBeingRejected) {
                                                setRejectingFileId(null);
                                              } else {
                                                setRejectingFileId(file.id);
                                                setFileRejectionNote("");
                                              }
                                            }}
                                            className="h-6 text-[10px] border-rose-200 text-rose-600 hover:bg-rose-50 font-medium px-2 gap-1">
                                            <IconX className="size-3" />
                                            Reject
                                          </Button>
                                        )}
                                      </div>
                                    </div>

                                    {/* Inline Rejection Note Input */}
                                    {isBeingRejected && (
                                      <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                                        <Input
                                          placeholder="Enter rejection reason / correction needed..."
                                          value={fileRejectionNote}
                                          onChange={(e) => setFileRejectionNote(e.target.value)}
                                          className="h-7 text-xs flex-1 border-rose-200"
                                        />
                                        <Button
                                          type="button"
                                          size="sm"
                                          disabled={isReviewingFile}
                                          onClick={() =>
                                            handleReviewFile(file.id, "rejected", fileRejectionNote)
                                          }
                                          className="h-7 text-xs bg-rose-600 hover:bg-rose-700 text-white px-2.5">
                                          Submit
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => setRejectingFileId(null)}
                                          className="h-7 text-xs px-2">
                                          Cancel
                                        </Button>
                                      </div>
                                    )}

                                    {file.rejection_note && !isBeingRejected && (
                                      <p className="text-[10px] text-rose-600 bg-rose-50/70 p-1.5 rounded border border-rose-100">
                                        Note: {formatMultilingual(file.rejection_note)}
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Itinerary Schedule (for Tour orders) */}
            {!isVisaOrder &&
              payment?.service_type === "tour" &&
              payment.book_tour?.book_tour_items &&
              payment.book_tour.book_tour_items.length > 0 && (
                <div className="p-3.5 rounded-xl border border-slate-200/80 space-y-2.5 text-xs">
                  <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-slate-500">
                    <IconMapPin className="size-3.5 text-blue-600" />
                    <span>Itinerary Schedule ({payment.book_tour.book_tour_items.length} Days / Stops)</span>
                  </h4>
                  <div className="space-y-2 pt-1">
                    {payment.book_tour.book_tour_items.map((item: any, idx: number) => {
                      const day = idx + 1;
                      const isExpanded = expandedDays[day];
                      const dest = item.destination;

                      return (
                        <div key={item.id || idx} className="rounded-lg border border-slate-200 bg-slate-50/50 p-2.5">
                          <div
                            onClick={() => toggleDay(day)}
                            className="flex items-center justify-between cursor-pointer">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200 uppercase">
                                  Day {day}
                                </span>
                                {item.visit_date && (
                                  <span className="text-[10px] text-slate-500">
                                    {formatSimpleDate(item.visit_date)}
                                  </span>
                                )}
                              </div>
                              <h5 className="text-xs font-bold text-slate-900">
                                {formatMultilingual(dest?.name) || `Destination Stop #${day}`}
                              </h5>
                              {dest?.location && (
                                <p className="text-[10px] text-slate-500">
                                  {formatMultilingual(dest.location)}
                                </p>
                              )}
                            </div>
                            <span className="text-[11px] font-semibold text-blue-600">
                              {isExpanded ? "Hide" : "Details"}
                            </span>
                          </div>

                          {isExpanded && dest?.detail_tour && dest.detail_tour.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-slate-200 space-y-1 bg-white p-2 rounded">
                              <p className="text-[10px] font-bold text-slate-800">Planned Activities:</p>
                              <ul className="space-y-1">
                                {dest.detail_tour.map((act: any, aIdx: number) => (
                                  <li key={aIdx} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                                    <span className="text-blue-500">•</span>
                                    <span>{formatMultilingual(act)}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            {/* Passenger Manifest (for Tour orders) */}
            {!isVisaOrder &&
              payment?.book_tour?.tourists &&
              payment.book_tour.tourists.length > 0 && (
                <div className="p-3.5 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                  <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-slate-500">
                    <IconUsers className="size-3.5 text-blue-600" />
                    <span>Passenger Manifest ({payment.book_tour.tourists.length} Travelers)</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {payment.book_tour.tourists.map((tourist: any, idx: number) => (
                      <div key={tourist.id || idx} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
                        <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                          <span className="font-bold text-slate-900 text-xs">
                            {formatMultilingual(tourist.name)}
                          </span>
                          <Badge variant="outline" className="text-[9px] uppercase">
                            {formatMultilingual(tourist.gender) || "Passenger"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-600">
                          <span>
                            Nat: <strong>{formatMultilingual(tourist.nationality) || "Indonesia"}</strong>
                          </span>
                          <span>
                            ID: <strong>{formatMultilingual(tourist.passport_number) || "-"}</strong>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="h-8 text-xs font-semibold gap-1.5 border-slate-200 bg-white shadow-2xs">
            <IconPrinter className="size-3.5 text-slate-600" />
            Print
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8 text-xs font-semibold px-4 border-slate-200 bg-white shadow-2xs">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
