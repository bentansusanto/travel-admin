"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TablePagination } from "@/components/ui/table-pagination";
import { MerekModal } from "@/components/motors/MerekModal";
import { cn } from "@/lib/utils";
import {
  Merek,
  Motor,
  useCreateMerekMutation,
  useDeleteMotorMutation,
  useFindAllMereksQuery,
  useFindAllMotorsQuery,
  useUpdateMerekMutation,
} from "@/store/services/motor.service";
import {
  IconAlertCircle,
  IconBuildingStore,
  IconCheck,
  IconCircleCheck,
  IconDotsVertical,
  IconEdit,
  IconFilter,
  IconMotorbike,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function MotorcyclesPage() {
  const { data: motorsData, isLoading, isFetching, refetch } = useFindAllMotorsQuery();
  const { data: mereksData } = useFindAllMereksQuery();
  const [deleteMotor] = useDeleteMotorMutation();

  const [createMerek] = useCreateMerekMutation();
  const [updateMerek] = useUpdateMerekMutation();

  // Search & Filtering States
  const [searchQuery, setSearchQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Brand Modal States
  const [isMerekModalOpen, setIsMerekModalOpen] = useState(false);
  const [selectedMerek, setSelectedMerek] = useState<Merek | null>(null);

  // Deletion States
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [motorToDelete, setMotorToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const motors: Motor[] = useMemo(() => {
    return motorsData?.data || (motorsData as any)?.datas || [];
  }, [motorsData]);

  const brands: Merek[] = useMemo(() => {
    return mereksData?.data || (mereksData as any)?.datas || [];
  }, [mereksData]);

  // Overall Fleet Statistics
  const totalMotors = motors.length;
  const availableMotors = motors.filter((m) => m.is_available).length;
  const unavailableMotors = motors.filter((m) => !m.is_available).length;
  const totalBrands = brands.length;

  // Filtered Motors
  const filteredMotors = useMemo(() => {
    return motors.filter((motor) => {
      const enTranslation = motor.translations?.find((t) => t.language_code === "en");
      const name = enTranslation?.name_motor || "";
      const brandName = motor.merek?.name_merek || "";
      const engineCc = String(motor.engine_cc || "");

      // Search match
      const matchesSearch =
        searchQuery.trim() === "" ||
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        engineCc.includes(searchQuery);

      // Brand filter
      const matchesBrand =
        brandFilter === "all" ||
        motor.merek_id === brandFilter ||
        motor.merek?.id === brandFilter ||
        motor.merek?.name_merek?.toLowerCase() === brandFilter.toLowerCase();

      // Status filter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "available" && motor.is_available) ||
        (statusFilter === "unavailable" && !motor.is_available);

      return matchesSearch && matchesBrand && matchesStatus;
    });
  }, [motors, searchQuery, brandFilter, statusFilter]);

  // Reset pagination on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, brandFilter, statusFilter, pageSize]);

  // Pagination calculations
  const totalItems = filteredMotors.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedMotors = filteredMotors.slice(startIndex, endIndex);

  const handleMerekSubmit = async (data: { name_merek: string }) => {
    try {
      if (selectedMerek?.id) {
        await updateMerek({ id: selectedMerek.id, data }).unwrap();
        toast.success("Brand updated successfully");
      } else {
        await createMerek(data).unwrap();
        toast.success("Brand created successfully");
      }
      setIsMerekModalOpen(false);
      setSelectedMerek(null);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save brand");
    }
  };

  const handleDelete = async () => {
    if (!motorToDelete) return;
    try {
      setIsDeleting(true);
      await deleteMotor(motorToDelete.id).unwrap();
      toast.success(`Motorcycle "${motorToDelete.name}" deleted successfully`);
      setIsDeleteDialogOpen(false);
      setMotorToDelete(null);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete motorcycle");
    } finally {
      setIsDeleting(false);
    }
  };

  const openMerekModal = () => {
    setSelectedMerek(null);
    setIsMerekModalOpen(true);
  };

  const formatPrice = (val?: number) => {
    if (val == null) return "$0";
    return `$${Number(val).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-4">
      {/* 1. Header Section */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 uppercase tracking-wider">
            <IconMotorbike className="size-3.5" />
            <span>Fleet & Rental Services</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Motorcycle Rentals
          </h1>
          <p className="text-xs text-slate-500">
            Manage motorcycle models, brand registrations, engine capacities, and daily rental pricing.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openMerekModal}
            className="h-9 text-xs font-semibold text-slate-700 bg-white border-slate-200 hover:bg-slate-50 gap-1.5 shadow-2xs">
            <IconMotorbike className="size-4 text-purple-600" />
            <span>Add Brand</span>
          </Button>

          <Button
            asChild
            size="sm"
            className="h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold gap-1.5 shadow-sm hover:shadow-md transition-all">
            <Link href="/dashboard/services/rent-motor/create">
              <IconPlus className="size-4" />
              <span>Add Motorcycle</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. Top Metric Cards (4 Grid) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Fleet */}
        <div className="flex items-center gap-3.5 p-4 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="flex size-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <IconMotorbike className="size-5.5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Fleet</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{totalMotors}</p>
          </div>
        </div>

        {/* Available Units */}
        <div className="flex items-center gap-3.5 p-4 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="flex size-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <IconCircleCheck className="size-5.5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Available Units</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{availableMotors}</p>
          </div>
        </div>

        {/* Unavailable / In Use */}
        <div className="flex items-center gap-3.5 p-4 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="flex size-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <IconAlertCircle className="size-5.5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">In-Use / Rented</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{unavailableMotors}</p>
          </div>
        </div>

        {/* Registered Brands */}
        <div className="flex items-center gap-3.5 p-4 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="flex size-11 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
            <IconMotorbike className="size-5.5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Brands Registered</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{totalBrands}</p>
          </div>
        </div>
      </div>

      {/* 3. Filter & Search Toolbar Card */}
      <Card className="border-slate-200/80 shadow-2xs bg-white py-0 gap-0 overflow-hidden">
        <CardContent className="p-3.5 flex flex-col sm:flex-row sm:items-center gap-2.5">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              placeholder="Search motorcycle, brand, CC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500"
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

          {/* Brand Filter */}
          <Select value={brandFilter} onValueChange={setBrandFilter}>
            <SelectTrigger className="h-9 w-full sm:w-44 text-xs bg-slate-50/50 border-slate-200">
              <SelectValue placeholder="All Brands" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Brands</SelectItem>
              {brands.map((b) => (
                <SelectItem key={b.id} value={b.id} className="text-xs">
                  {b.name_merek}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-full sm:w-36 text-xs bg-slate-50/50 border-slate-200">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Status</SelectItem>
              <SelectItem value="available" className="text-xs">Available</SelectItem>
              <SelectItem value="unavailable" className="text-xs">Unavailable</SelectItem>
            </SelectContent>
          </Select>

          {/* Reset Filters */}
          {(searchQuery || brandFilter !== "all" || statusFilter !== "all") && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setBrandFilter("all");
                setStatusFilter("all");
              }}
              className="h-9 text-xs text-slate-500 hover:text-slate-900 gap-1 px-2.5 self-start sm:self-auto">
              <IconFilter className="size-3.5" />
              Reset
            </Button>
          )}
        </CardContent>
      </Card>

      {/* 4. Main Fleet Table Card */}
      <Card className="border-slate-200/80 shadow-2xs bg-white py-0 gap-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80 border-b border-slate-200/60">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-slate-600 px-4 py-2.5">Vehicle Details</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 px-4 py-2.5">Brand</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 px-4 py-2.5">Color Variants</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 px-4 py-2.5">Daily Rental Price</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 px-4 py-2.5 text-center">Status</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 px-4 py-2.5 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-slate-100">
                    <TableCell className="px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-11 w-14 rounded-lg" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-3.5 w-32" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-2.5"><Skeleton className="h-4.5 w-20" /></TableCell>
                    <TableCell className="px-4 py-2.5"><Skeleton className="h-4.5 w-24" /></TableCell>
                    <TableCell className="px-4 py-2.5"><Skeleton className="h-4.5 w-24" /></TableCell>
                    <TableCell className="px-4 py-2.5 text-center"><Skeleton className="h-4.5 w-20 mx-auto rounded-full" /></TableCell>
                    <TableCell className="px-4 py-2.5 text-center"><Skeleton className="size-7 mx-auto rounded-md" /></TableCell>
                  </TableRow>
                ))
              ) : paginatedMotors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center text-xs text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <IconMotorbike className="size-8 text-slate-300" />
                      <p className="text-xs font-medium text-slate-500">No motorcycles found matching your criteria.</p>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs font-semibold text-blue-600 border-blue-200 hover:bg-blue-50 gap-1 mt-1">
                        <Link href="/dashboard/services/rent-motor/create">
                          <IconPlus className="size-3.5" />
                          Add Motorcycle
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedMotors.map((motor) => {
                  const enTranslation = motor.translations?.find((t) => t.language_code === "en");
                  const motorName = enTranslation?.name_motor || "Unnamed Motorcycle";
                  const prices = motor.motor_prices || motor.prices || [];
                  const dailyPrice = prices.find((p) => p.price_type === "daily")?.price;
                  const weeklyPrice = prices.find((p) => p.price_type === "weekly")?.price;

                  return (
                    <TableRow key={motor.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0">
                      {/* Vehicle Details (Image + Name + CC Badge) */}
                      <TableCell className="px-4 py-2.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={motor.thumbnail || "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=300&q=80"}
                            alt={motorName}
                            className="h-11 w-15 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100 shadow-2xs"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=300&q=80";
                            }}
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-xs text-slate-900 truncate">
                              {motorName}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Badge
                                variant="secondary"
                                className="text-[10px] font-mono font-medium px-1.5 py-0 bg-slate-100 text-slate-600 border border-slate-200/60">
                                {motor.engine_cc} cc
                              </Badge>
                              {motor.state?.name && (
                                <span className="text-[11px] text-slate-400 truncate">
                                  • {motor.state.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Brand */}
                      <TableCell className="px-4 py-2.5">
                        <Badge
                          variant="outline"
                          className="text-xs font-semibold border-slate-200 bg-slate-50 text-slate-700">
                          {motor.merek?.name_merek || "Standard"}
                        </Badge>
                      </TableCell>

                      {/* Color Variants */}
                      <TableCell className="px-4 py-2.5">
                        {motor.variants && motor.variants.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[180px]">
                            {motor.variants.map((v, i) => (
                              <span
                                key={i}
                                className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/60 capitalize">
                                {v.color}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Default</span>
                        )}
                      </TableCell>

                      {/* Daily Rental Price */}
                      <TableCell className="px-4 py-2.5">
                        <div className="flex flex-col">
                          <span className="font-bold text-xs text-slate-900 font-mono">
                            {formatPrice(dailyPrice)}
                            <span className="text-[11px] font-normal text-slate-400 ml-1">/ day</span>
                          </span>
                          {weeklyPrice != null && (
                            <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {formatPrice(weeklyPrice)} / week
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell className="px-4 py-2.5 text-center">
                        {motor.is_available ? (
                          <Badge
                            variant="outline"
                            className="border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold text-[11px] gap-1 mx-auto">
                            <IconCheck className="size-3" />
                            Available
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-slate-200 bg-slate-50 text-slate-500 font-semibold text-[11px] gap-1 mx-auto">
                            <IconX className="size-3" />
                            Unavailable
                          </Badge>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="px-4 py-2.5 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-7 text-slate-400 hover:text-slate-700">
                              <IconDotsVertical className="size-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem asChild className="text-xs gap-2 cursor-pointer">
                              <Link href={`/dashboard/services/rent-motor/edit/${motor.id}`}>
                                <IconEdit className="size-3.5 text-blue-600" />
                                Edit Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setMotorToDelete({ id: motor.id!, name: motorName });
                                setIsDeleteDialogOpen(true);
                              }}
                              className="text-xs gap-2 text-rose-600 cursor-pointer">
                              <IconTrash className="size-3.5" />
                              Delete Vehicle
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
          itemName="motorcycles"
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </Card>
      <MerekModal
        isOpen={isMerekModalOpen}
        onClose={() => {
          setIsMerekModalOpen(false);
          setSelectedMerek(null);
        }}
        onSubmit={handleMerekSubmit}
        initialData={selectedMerek}
        title={selectedMerek ? "Edit Brand Details" : "Register New Brand"}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md bg-white border-slate-200">
          <AlertDialogHeader>
            <div className="flex size-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600 mb-1">
              <IconTrash className="size-5.5" />
            </div>
            <AlertDialogTitle className="text-base font-bold text-slate-900">
              Delete Motorcycle?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <strong className="text-slate-900 font-semibold">{motorToDelete?.name}</strong> from your fleet?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              disabled={isDeleting}
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setMotorToDelete(null);
              }}
              className="h-9 text-xs font-semibold">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={handleDelete}
              className="h-9 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold">
              {isDeleting ? "Deleting..." : "Yes, Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
