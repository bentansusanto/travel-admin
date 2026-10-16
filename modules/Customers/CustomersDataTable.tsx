"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TablePagination } from "@/components/ui/table-pagination";
import {
  CustomerItem,
  useDeleteCustomerMutation,
  useToggleVerifyCustomerMutation,
} from "@/store/services/customer.service";
import {
  IconCheck,
  IconClock,
  IconDotsVertical,
  IconEye,
  IconFilter,
  IconMail,
  IconMapPin,
  IconPhone,
  IconRoute,
  IconSearch,
  IconShieldCheck,
  IconTrash,
  IconUsers,
} from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { CustomerDetailsModal } from "./CustomerDetailsModal";

interface CustomersDataTableProps {
  customers: CustomerItem[];
}

export function CustomersDataTable({ customers }: CustomersDataTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Deletion state
  const [customerToDelete, setCustomerToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleteCustomer, { isLoading: isDeleting }] = useDeleteCustomerMutation();
  const [toggleVerify] = useToggleVerifyCustomerMutation();

  // Filter logic
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        (c.phone_number && c.phone_number.includes(search));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "verified" && c.is_verified === true) ||
        (statusFilter === "unverified" && (c.is_verified === false || c.is_verified == null));

      return matchesSearch && matchesStatus;
    });
  }, [customers, search, statusFilter]);

  // Reset pagination on filter change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, pageSize]);

  // Pagination calculations
  const totalItems = filteredCustomers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const paginatedCustomers = useMemo(() => {
    const start = (validCurrentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, validCurrentPage, pageSize]);

  // Actions
  const handleOpenDetails = (id: string) => {
    setSelectedCustomerId(id);
    setIsDetailsOpen(true);
  };

  const handleToggleVerify = async (customer: CustomerItem) => {
    try {
      await toggleVerify(customer.id).unwrap();
      toast.success(
        `Customer "${customer.name}" marked as ${
          customer.is_verified ? "Unverified" : "Verified"
        }`
      );
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update verification status");
    }
  };

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;
    try {
      await deleteCustomer(customerToDelete.id).unwrap();
      toast.success(`Customer "${customerToDelete.name}" deleted successfully`);
      setCustomerToDelete(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete customer");
    }
  };

  return (
    <div className="w-full space-y-3.5">
      {/* 1. Filter & Search Toolbar */}
      <Card className="border-slate-200/80 shadow-xs bg-white py-0 gap-0 overflow-hidden">
        <CardContent className="p-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
            {/* Search Input */}
            <div className="relative min-w-[240px] max-w-sm flex-1">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                placeholder="Search by customer name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs bg-slate-50/50 border-slate-200 rounded-lg focus-visible:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 text-xs w-[150px] bg-slate-50/50 border-slate-200 shadow-2xs">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Verification</SelectItem>
                  <SelectItem value="verified">Verified Only</SelectItem>
                  <SelectItem value="unverified">Pending / Unverified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Main Data Table */}
      <Card className="border-slate-200/80 shadow-xs bg-white py-0 gap-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80 border-b border-slate-200/60">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-slate-600 px-4 py-2.5">Customer Profile</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 px-4 py-2.5">Phone & Contact</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 px-4 py-2.5">Location</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 px-4 py-2.5 text-center">Activity</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 px-4 py-2.5 text-center">Status</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 px-4 py-2.5 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-28 text-center text-xs text-slate-400">
                    No registered customers found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCustomers.map((customer) => {
                  const locationString =
                    customer.profile?.city || customer.profile?.country?.name
                      ? `${customer.profile?.city ? `${customer.profile.city}, ` : ""}${
                          customer.profile?.country?.name || ""
                        }`
                      : "Not specified";

                  return (
                    <TableRow
                      key={customer.id}
                      className="hover:bg-slate-50/80 transition-colors border-b border-slate-100">
                      {/* Customer Profile Column */}
                      <TableCell className="px-4 py-2.5">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8.5 rounded-lg border border-slate-200 shrink-0">
                            <AvatarImage src={customer.avatar} alt={customer.name} />
                            <AvatarFallback className="bg-blue-50 text-blue-700 font-bold text-xs rounded-lg">
                              {customer.name ? customer.name.substring(0, 2).toUpperCase() : "CU"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0 max-w-[200px]">
                            <button
                              type="button"
                              onClick={() => handleOpenDetails(customer.id)}
                              className="font-bold text-xs text-slate-900 hover:text-blue-600 transition-colors text-left truncate">
                              {customer.name}
                            </button>
                            <span className="text-[11px] text-slate-400 truncate">{customer.email}</span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Phone / Contact */}
                      <TableCell className="px-4 py-2.5 text-xs text-slate-600">
                        {customer.phone_number ? (
                          <div className="flex items-center gap-1.5 font-mono text-[11px]">
                            <IconPhone className="size-3 text-slate-400" />
                            <span>{customer.phone_number}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">No phone</span>
                        )}
                      </TableCell>

                      {/* Location */}
                      <TableCell className="px-4 py-2.5 text-xs text-slate-600">
                        <div className="flex items-center gap-1 max-w-[160px] truncate">
                          <IconMapPin className="size-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{locationString}</span>
                        </div>
                      </TableCell>

                      {/* Activity (Bookers & Itineraries) */}
                      <TableCell className="px-4 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-semibold px-1.5 py-0 bg-blue-50 text-blue-700 border border-blue-200/50 gap-1">
                            <IconUsers className="size-3" />
                            {customer.bookersCount ?? customer.bookers?.length ?? 0}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-semibold px-1.5 py-0 bg-purple-50 text-purple-700 border border-purple-200/50 gap-1">
                            <IconRoute className="size-3" />
                            {customer.itinerariesCount ?? customer.itineraries?.length ?? 0}
                          </Badge>
                        </div>
                      </TableCell>

                      {/* Verification Status */}
                      <TableCell className="px-4 py-2.5 text-center">
                        {customer.is_verified ? (
                          <Badge
                            variant="outline"
                            className="border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold text-[11px] gap-1 px-2 py-0.5">
                            <IconCheck className="size-3" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-amber-200 bg-amber-50 text-amber-700 font-semibold text-[11px] gap-1 px-2 py-0.5">
                            <IconClock className="size-3" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="px-4 py-2.5 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-slate-400 hover:text-slate-700">
                              <IconDotsVertical className="size-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                              onClick={() => handleOpenDetails(customer.id)}
                              className="text-xs gap-2 cursor-pointer">
                              <IconEye className="size-3.5 text-blue-600" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleVerify(customer)}
                              className="text-xs gap-2 cursor-pointer">
                              <IconShieldCheck className="size-3.5 text-emerald-600" />
                              {customer.is_verified ? "Unverify Account" : "Verify Account"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setCustomerToDelete({ id: customer.id, name: customer.name })}
                              className="text-xs gap-2 text-rose-600 cursor-pointer">
                              <IconTrash className="size-3.5" />
                              Delete Customer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
          itemName="customers"
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          className="pt-2 border-t border-slate-100 bg-transparent"
        />
      </Card>

      {/* Customer Details Modal */}
      <CustomerDetailsModal
        customerId={selectedCustomerId}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!customerToDelete} onOpenChange={(open) => !open && setCustomerToDelete(null)}>
        <AlertDialogContent className="max-w-md bg-white border-slate-200">
          <AlertDialogHeader>
            <div className="flex size-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600 mb-1">
              <IconTrash className="size-5.5" />
            </div>
            <AlertDialogTitle className="text-base font-bold text-slate-900">
              Delete Customer Account
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to delete customer{" "}
              <strong className="text-slate-900 font-semibold">{customerToDelete?.name}</strong>? This action cannot
              be undone and will remove the customer's account and session access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel disabled={isDeleting} className="h-9 text-xs font-semibold border-slate-200">
              Cancel
            </AlertDialogCancel>
            <Button
              type="button"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className="h-9 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold gap-1.5 shadow-sm">
              {isDeleting ? <Loader2 className="size-3.5 animate-spin" /> : <IconTrash className="size-3.5" />}
              {isDeleting ? "Deleting..." : "Yes, Delete Customer"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
