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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  IconBuildingHospital,
  IconChevronDown,
  IconClock,
  IconColumns,
  IconDotsVertical,
  IconEdit,
  IconFilter,
  IconFirstAidKit,
  IconMapPin,
  IconPlus,
  IconSearch,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, Loader2 } from "lucide-react";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { HealthPackageItem } from "./types";

interface HealthTourismDataTableProps {
  data: HealthPackageItem[];
  onDeleteItem?: (id: string) => void;
  onOpenCreate?: () => void;
}

export default function HealthTourismDataTable({
  data,
  onDeleteItem,
  onOpenCreate,
}: HealthTourismDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // Alert Dialog delete state
  const [itemToDelete, setItemToDelete] = useState<HealthPackageItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      setIsDeleting(true);
      await new Promise((resolve) => setTimeout(resolve, 400));
      onDeleteItem?.(itemToDelete.id);
      toast.success(`Package "${itemToDelete.title}" deleted successfully`);
      setItemToDelete(null);
    } catch {
      toast.error("Failed to delete health package");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<HealthPackageItem>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "thumbnail",
      header: "Visual",
      enableSorting: false,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="group relative flex h-11 w-15 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200/80 bg-slate-100 shadow-2xs">
            {item.thumbnail ? (
              <img
                src={item.thumbnail}
                alt={item.title}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='88' viewBox='0 0 120 88'%3E%3Crect width='120' height='88' fill='%23f1f5f9'/%3E%3Cpath d='M44 38a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-16 26h64L74 42l-14 18-10-12-22 26z' fill='%23cbd5e1'/%3E%3C/svg%3E";
                }}
              />
            ) : (
              <IconFirstAidKit className="size-5 text-slate-400" />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Package & Medical Center
          <ArrowUpDown className="ml-1.5 size-3.5" />
        </Button>
      ),
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex flex-col min-w-[200px] max-w-[280px]">
            <span className="text-xs font-bold text-slate-900 truncate">
              {item.title}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
              <IconBuildingHospital className="size-3 text-slate-400 shrink-0" />
              <span className="truncate">{item.facility}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Specialization",
      filterFn: (row, id, value: string[]) => !value?.length || value.includes(row.getValue(id)),
      cell: ({ row }) => {
        const category = row.original.category;
        const colorClass =
          category === "Dental Care"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : category === "Wellness & Thermal Spa"
            ? "border-purple-200 bg-purple-50 text-purple-700"
            : category === "Aesthetic & Dermatology"
            ? "border-amber-200 bg-amber-50 text-amber-700"
            : "border-blue-200 bg-blue-50 text-blue-700";

        return (
          <Badge
            variant="outline"
            className={`font-semibold text-xs capitalize whitespace-nowrap ${colorClass}`}>
            {category}
          </Badge>
        );
      },
    },
    {
      accessorKey: "city",
      header: "Location",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-1 text-xs text-slate-600 max-w-[180px] truncate">
            <IconMapPin className="size-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              {item.city}, {item.country}
            </span>
          </div>
        );
      },
    },
    {
      id: "durationInclusions",
      header: "Program Duration",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
              <IconClock className="size-3.5 text-slate-400 shrink-0" />
              <span>{item.duration}</span>
            </div>
            <div className="flex items-center gap-1 overflow-hidden">
              <Badge
                variant="outline"
                className="border-slate-200 bg-slate-50 text-[9px] font-medium text-slate-600 px-1.5 py-0 whitespace-nowrap">
                {item.inclusions[0] || "VIP Care"}
              </Badge>
              {item.inclusions.length > 1 && (
                <span className="text-[9px] text-slate-400 font-medium">
                  +{item.inclusions.length - 1} perks
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Package Fare
          <ArrowUpDown className="ml-1.5 size-3.5" />
        </Button>
      ),
      cell: ({ row }) => {
        const amount = Number(row.original.price) || 0;
        const formatted = `$${amount.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;

        return (
          <div className="flex flex-col">
            <span className="font-mono text-xs font-bold text-slate-900">
              {formatted}
            </span>
            <span className="text-[10px] text-slate-400">per patient</span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <div className="text-center">
            <Badge
              variant="outline"
              className={`font-semibold text-[11px] px-2 py-0.5 ${
                status === "Active"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-slate-50 text-slate-700"
              }`}>
              {status}
            </Badge>
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="text-center">
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
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem
                  onClick={() =>
                    toast.info(`Edit package "${item.title}" ready`)
                  }
                  className="text-xs gap-2 cursor-pointer">
                  <IconEdit className="size-3.5 text-blue-600" />
                  Edit Package
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setItemToDelete(item)}
                  className="text-xs gap-2 text-rose-600 cursor-pointer">
                  <IconTrash className="size-3.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const totalItems = table.getFilteredRowModel().rows.length;

  const titleFilterValue =
    (table.getColumn("title")?.getFilterValue() as string) ?? "";

  const categories = useMemo(() => {
    return [
      { label: "Medical Checkup", value: "Medical Checkup" },
      { label: "Dental Care", value: "Dental Care" },
      { label: "Aesthetic & Dermatology", value: "Aesthetic & Dermatology" },
      { label: "Wellness & Thermal Spa", value: "Wellness & Thermal Spa" },
      { label: "Eye Care", value: "Eye Care" },
    ];
  }, []);

  return (
    <div className="space-y-4">
      {/* 1. Filter & Search Toolbar Card */}
      <Card className="border-slate-200/80 shadow-2xs bg-white py-0 gap-0 overflow-hidden">
        <CardContent className="p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <div className="flex flex-row flex-wrap sm:flex-nowrap items-center gap-2 flex-1 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[140px] sm:w-72 sm:flex-none">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                placeholder="Search package, clinic name..."
                value={titleFilterValue}
                onChange={(event) =>
                  table.getColumn("title")?.setFilterValue(event.target.value)
                }
                className="pl-9 h-9 text-xs bg-slate-50/50 border-slate-200 rounded-lg focus-visible:ring-blue-500 w-full"
              />
              {titleFilterValue && (
                <button
                  type="button"
                  onClick={() => table.getColumn("title")?.setFilterValue("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <IconX className="size-3.5" />
                </button>
              )}
            </div>

            {/* Specialization Category Filter Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs font-semibold text-slate-700 border-slate-200 bg-white gap-1.5 shadow-2xs shrink-0">
                  <IconFilter className="size-3.5 text-slate-500" />
                  <span>Category</span>
                  {(
                    (table.getColumn("category")?.getFilterValue() as string[]) ?? []
                  ).length > 0 && (
                    <Badge
                      variant="secondary"
                      className="px-1.5 py-0 text-[10px] bg-blue-50 text-blue-700">
                      {
                        (
                          table.getColumn("category")?.getFilterValue() as string[]
                        ).length
                      }
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-0" align="start">
                <Command>
                  <CommandInput placeholder="Filter category..." className="h-8.5 text-xs" />
                  <CommandList>
                    <CommandEmpty className="py-2 text-center text-xs text-slate-500">
                      No category found.
                    </CommandEmpty>
                    <CommandGroup>
                      {categories.map((cat) => {
                        const filterValue =
                          (table
                            .getColumn("category")
                            ?.getFilterValue() as string[]) ?? [];
                        const isChecked = filterValue.includes(cat.value);
                        return (
                          <CommandItem
                            key={cat.value}
                            value={cat.value}
                            onSelect={() => {
                              const newValue = isChecked
                                ? filterValue.filter((v) => v !== cat.value)
                                : [...filterValue, cat.value];
                              table
                                .getColumn("category")
                                ?.setFilterValue(newValue.length ? newValue : undefined);
                            }}
                            className="cursor-pointer text-xs">
                            <div className="flex items-center space-x-2 py-0.5">
                              <Checkbox checked={isChecked} />
                              <label className="text-xs font-medium text-slate-700 cursor-pointer">
                                {cat.label}
                              </label>
                            </div>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Column Visibility Selector */}
          <div className="flex items-center justify-start self-start sm:self-auto shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs font-semibold text-slate-700 border-slate-200 bg-white gap-1.5 shadow-2xs">
                  <IconColumns className="size-3.5 text-slate-500" />
                  <span>Columns</span>
                  <IconChevronDown className="size-3.5 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel className="text-xs text-slate-500 font-semibold">
                  Toggle Columns
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize text-xs cursor-pointer"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}>
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* 2. Main Data Table */}
      <Card className="border-slate-200/80 shadow-2xs bg-white overflow-hidden py-0 gap-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/75 border-b border-slate-200/80">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3 px-3.5">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-b-0">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3 px-3.5 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-44 text-center py-6">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="flex size-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <IconFirstAidKit className="size-5.5" />
                      </div>
                      <p className="text-xs font-semibold text-slate-900">
                        No health tourism packages found
                      </p>
                      <p className="text-[11px] text-slate-400 max-w-xs">
                        Adjust filters or add a new medical treatment package.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onOpenCreate}
                        className="h-8 text-xs font-semibold text-blue-600 border-blue-200 hover:bg-blue-50 gap-1 mt-1">
                        <IconPlus className="size-3.5" />
                        <span>Add Package</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Standardized Table Pagination Footer */}
        <TablePagination
          currentPage={pageIndex + 1}
          pageSize={pageSize}
          totalItems={totalItems}
          itemName="packages"
          onPageChange={(p) => table.setPageIndex(p - 1)}
          onPageSizeChange={(s) => table.setPageSize(s)}
        />
      </Card>

      {/* Modern Confirmation Alert Dialog for Deletion */}
      <AlertDialog
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent className="max-w-md bg-white border-slate-200">
          <AlertDialogHeader>
            <div className="flex size-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600 mb-1">
              <IconTrash className="size-5.5" />
            </div>
            <AlertDialogTitle className="text-base font-bold text-slate-900">
              Delete Health Package
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-900 font-semibold">{itemToDelete?.title}</strong>? This action will permanently remove this health package and all active appointment options.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel
              disabled={isDeleting}
              className="h-9 text-xs font-semibold border-slate-200">
              Cancel
            </AlertDialogCancel>
            <Button
              type="button"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className="h-9 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold gap-1.5 shadow-sm">
              {isDeleting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <IconTrash className="size-3.5" />
              )}
              {isDeleting ? "Deleting..." : "Yes, Delete Package"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
