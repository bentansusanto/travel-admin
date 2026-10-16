"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CustomerItem,
  useFindCustomerByIdQuery,
  useToggleVerifyCustomerMutation,
} from "@/store/services/customer.service";
import {
  IconCalendar,
  IconCheck,
  IconClock,
  IconId,
  IconMail,
  IconMapPin,
  IconPhone,
  IconRoute,
  IconShieldCheck,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import React from "react";
import { toast } from "sonner";

interface CustomerDetailsModalProps {
  customerId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerDetailsModal({
  customerId,
  open,
  onOpenChange,
}: CustomerDetailsModalProps) {
  const { data, isLoading } = useFindCustomerByIdQuery(customerId || "", {
    skip: !customerId || !open,
  });

  const [toggleVerify, { isLoading: isToggling }] = useToggleVerifyCustomerMutation();

  const customer: CustomerItem | undefined = data?.data;

  const handleToggleVerify = async () => {
    if (!customer) return;
    try {
      await toggleVerify(customer.id).unwrap();
      toast.success(
        `Customer status changed to ${
          customer.is_verified ? "Unverified" : "Verified"
        }`
      );
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update verification status");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-xl p-0 gap-0 overflow-hidden bg-white border-slate-200">
        <DialogHeader className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 text-left items-start">
          <div className="flex items-center gap-2.5 text-left w-full justify-start">
            <div className="flex size-7.5 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0">
              <IconUser className="size-4" />
            </div>
            <div className="text-left">
              <DialogTitle className="text-sm font-bold text-slate-900 text-left">
                Customer Profile Details
              </DialogTitle>
              <DialogDescription className="text-[11px] text-slate-500 text-left mt-0.5">
                Detailed customer account, saved booker profiles, and activity.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex h-56 flex-col items-center justify-center gap-2 text-slate-500">
            <Loader2 className="size-6 animate-spin text-blue-600" />
            <p className="text-xs font-medium">Loading customer details...</p>
          </div>
        ) : !customer ? (
          <div className="p-6 text-center text-xs text-slate-400">
            Customer details could not be found.
          </div>
        ) : (
          <div className="p-4 space-y-3 max-h-[75vh] overflow-y-auto">
            {/* Header Profile Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-lg border border-slate-200/80 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <Avatar className="size-10 rounded-lg border border-slate-200 shadow-2xs">
                  <AvatarImage src={customer.avatar} alt={customer.name} />
                  <AvatarFallback className="bg-blue-600 text-white font-bold text-xs rounded-lg">
                    {customer.name ? customer.name.substring(0, 2).toUpperCase() : "CU"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xs text-slate-900">{customer.name}</h3>
                    {customer.is_verified ? (
                      <Badge
                        variant="outline"
                        className="border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold text-[10px] gap-1 px-1.5 py-0">
                        <IconCheck className="size-2.5" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-amber-200 bg-amber-50 text-amber-700 font-semibold text-[10px] gap-1 px-1.5 py-0">
                        <IconClock className="size-2.5" />
                        Pending
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">ID: {customer.id}</p>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isToggling}
                onClick={handleToggleVerify}
                className="h-7.5 text-xs font-semibold text-slate-700 border-slate-200 bg-white hover:bg-slate-50 self-start sm:self-auto gap-1">
                <IconShieldCheck className="size-3.5 text-blue-600" />
                {customer.is_verified ? "Set as Unverified" : "Mark as Verified"}
              </Button>
            </div>

            {/* Quick Contact & Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="flex items-start gap-2 p-2.5 rounded-lg border border-slate-100 bg-white">
                <IconMail className="size-3.5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase">Email Address</p>
                  <p className="font-medium text-slate-800 text-[11px] break-all">{customer.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2.5 rounded-lg border border-slate-100 bg-white">
                <IconPhone className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase">Phone Number</p>
                  <p className="font-medium text-slate-800 text-[11px]">
                    {customer.phone_number || <span className="text-slate-400 italic">Not specified</span>}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2.5 rounded-lg border border-slate-100 bg-white">
                <IconMapPin className="size-3.5 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase">Location / City</p>
                  <p className="font-medium text-slate-800 text-[11px]">
                    {customer.profile?.city || customer.profile?.country?.name ? (
                      `${customer.profile?.city ? `${customer.profile.city}, ` : ""}${
                        customer.profile?.country?.name || ""
                      }`
                    ) : (
                      <span className="text-slate-400 italic">Not specified</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2.5 rounded-lg border border-slate-100 bg-white">
                <IconCalendar className="size-3.5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase">Joined Date</p>
                  <p className="font-medium text-slate-800 text-[11px]">
                    {customer.createdAt
                      ? new Date(customer.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Saved Bookers Profiles */}
            <div className="space-y-1.5 pt-1.5 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <IconUsers className="size-3.5 text-blue-600" />
                  <h4 className="text-xs font-bold text-slate-900">Saved Booker Profiles</h4>
                </div>
                <Badge variant="secondary" className="text-[10px] font-bold px-1.5 py-0 bg-blue-50 text-blue-700">
                  {customer.bookers?.length || 0} Bookers
                </Badge>
              </div>

              {customer.bookers && customer.bookers.length > 0 ? (
                <div className="space-y-1.5">
                  {customer.bookers.map((booker) => (
                    <div
                      key={booker.id}
                      className="flex items-center justify-between p-2 rounded-lg border border-slate-200/70 bg-slate-50/50 text-xs">
                      <div>
                        <p className="font-bold text-slate-800 text-[11px]">{booker.name}</p>
                        <p className="text-[10px] text-slate-500">{booker.email}</p>
                      </div>
                      <span className="font-mono text-[10px] text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {booker.phone_number || "No phone"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic py-1.5 text-center bg-slate-50/50 rounded-lg">
                  No saved booker profiles found for this customer.
                </p>
              )}
            </div>

            {/* Custom Itineraries Section */}
            <div className="space-y-1.5 pt-1.5 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <IconRoute className="size-3.5 text-purple-600" />
                  <h4 className="text-xs font-bold text-slate-900">Generated Itineraries</h4>
                </div>
                <Badge variant="secondary" className="text-[10px] font-bold px-1.5 py-0 bg-purple-50 text-purple-700">
                  {customer.itineraries?.length || 0} Itineraries
                </Badge>
              </div>

              {customer.itineraries && customer.itineraries.length > 0 ? (
                <div className="space-y-1">
                  {customer.itineraries.map((itinerary) => (
                    <div
                      key={itinerary.id}
                      className="flex items-center justify-between p-2 rounded-lg border border-slate-200/70 bg-white text-xs">
                      <span className="font-semibold text-slate-800 text-[11px] truncate">{itinerary.title}</span>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                        {itinerary.start_date
                          ? new Date(itinerary.start_date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          : ""}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic py-1.5 text-center bg-slate-50/50 rounded-lg">
                  No itineraries created by this customer yet.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Modal Footer with Close Button */}
        <DialogFooter className="px-5 py-2.5 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 text-xs font-semibold border-slate-200 bg-white hover:bg-slate-50 text-slate-700">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
