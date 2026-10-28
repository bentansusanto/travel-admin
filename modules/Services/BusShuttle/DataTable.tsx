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
  IconArmchair,
  IconArrowRight,
  IconBus,
  IconChevronDown,
  IconClock,
  IconColumns,
  IconDotsVertical,
  IconEdit,
  IconFilter,
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
import { BusRouteItem } from "./types";

interface BusShuttleDataTableProps {
  data: BusRouteItem[];
  onDeleteItem?: (id: string) => void;
  onOpenCreate?: () => void;
}

export default function BusShuttleDataTable({
  data,
  onDeleteItem,
  onOpenCreate,
}: BusShuttleDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // Alert Dialog delete state
  const [itemToDelete, setItemToDelete] = useState<BusRouteItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      setIsDeleting(true);
      await new Promise((resolve) => setTimeout(resolve, 400));
      onDeleteItem?.(itemToDelete.id);
      toast.success(
        `Route ${itemToDelete.busNumber} (${itemToDelete.operator}) deleted successfully`
      );
      setItemToDelete(null);
    } catch {
      toast.error("Failed to delete bus route");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<BusRouteItem>[] = [
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
      accessorKey: "operator",
      header: "Fleet & Operator",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-slate-200/80 bg-slate-50 text-blue-600 shadow-2xs">
              <IconBus className="size-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-900 truncate">
                {item.operator}
              </span>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <span className="font-semibold text-blue-600">{item.busNumber}</span>
                <span>•</span>
                <span>{item.seatCapacity} Seats</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "busType",
      header: "Bus Class",
      filterFn: (row, id, value: string[]) => !value?.length || value.includes(row.getValue(id)),
      cell: ({ row }) => {
        const busType = row.original.busType;
        const colorClass =
          busType === "Sleeper Bus / Suites"
            ? "border-purple-200 bg-purple-50 text-purple-700"
            : busType === "VIP Airport Shuttle"
            ? "border-blue-200 bg-blue-50 text-blue-700"
            : "border-slate-200 bg-slate-50 text-slate-700";

        return (
          <Badge
            variant="outline"
            className={`font-semibold text-xs whitespace-nowrap ${colorClass}`}>
            {busType}
          </Badge>
        );
      },
    },
    {
      id: "route",
      header: "Route & Terminals",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex flex-col gap-1 min-w-[210px]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                {item.originCity}
              </span>
              <IconArrowRight className="size-3 text-slate-400 shrink-0" />
              <span className="text-xs font-bold text-slate-900">
                {item.destinationCity}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate">
              <span className="truncate">{item.originTerminal}</span>
              <span>→</span>
              <span className="truncate">{item.destinationTerminal}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "departureTime",
      header: "Schedule & Timing",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
              <IconClock className="size-3.5 text-slate-400 shrink-0" />
              <span>
                {item.departureTime} - {item.arrivalTime}
              </span>
            </div>
            <Badge
              variant="outline"
              className="w-fit border-slate-200 bg-slate-50 text-[9px] font-medium text-slate-600 px-1.5 py-0">
              Est. {item.duration}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "availableSeats",
      header: "Seat Inventory",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-700">
              <IconArmchair className="size-3.5 text-slate-400 shrink-0" />
              <span className="font-bold text-slate-900">{item.availableSeats}</span>
              <span className="text-[11px] text-slate-400">/ {item.seatCapacity} seats left</span>
            </div>
            <div className="flex items-center gap-1">
              <Badge
                variant="outline"
                className="border-slate-200 bg-slate-50 text-[9px] font-medium text-slate-600 px-1.5 py-0">
                {item.amenities[0] || "AC"}
              </Badge>
              {item.amenities.length > 1 && (
                <span className="text-[9px] text-slate-400 font-medium">
                  +{item.amenities.length - 1} perks
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
          Ticket Fare
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
            <span className="text-[10px] text-slate-400">per passenger</span>
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
                  : status === "Full"
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : "border-blue-200 bg-blue-50 text-blue-700"
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
                    toast.info(`Edit route ${item.busNumber} ready`)
                  }
                  className="text-xs gap-2 cursor-pointer">
                  <IconEdit className="size-3.5 text-blue-600" />
                  Edit Route
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

  const operatorFilterValue =
    (table.getColumn("operator")?.getFilterValue() as string) ?? "";

  const busTypes = useMemo(() => {
    return [
      { label: "Executive Class", value: "Executive Class" },
      { label: "Sleeper Bus / Suites", value: "Sleeper Bus / Suites" },
      { label: "VIP Airport Shuttle", value: "VIP Airport Shuttle" },
      { label: "Super Executive", value: "Super Executive" },
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
                placeholder="Search operator, route, bus #..."
                value={operatorFilterValue}
                onChange={(event) =>
                  table.getColumn("operator")?.setFilterValue(event.target.value)
                }
                className="pl-9 h-9 text-xs bg-slate-50/50 border-slate-200 rounded-lg focus-visible:ring-blue-500 w-full"
              />
              {operatorFilterValue && (
                <button
                  type="button"
                  onClick={() => table.getColumn("operator")?.setFilterValue("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <IconX className="size-3.5" />
                </button>
              )}
            </div>

            {/* Bus Type Filter Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs font-semibold text-slate-700 border-slate-200 bg-white gap-1.5 shadow-2xs shrink-0">
                  <IconFilter className="size-3.5 text-slate-500" />
                  <span>Bus Type</span>
                  {(
                    (table.getColumn("busType")?.getFilterValue() as string[]) ?? []
                  ).length > 0 && (
                    <Badge
                      variant="secondary"
                      className="px-1.5 py-0 text-[10px] bg-blue-50 text-blue-700">
                      {
                        (
                          table.getColumn("busType")?.getFilterValue() as string[]
                        ).length
                      }
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-0" align="start">
                <Command>
                  <CommandInput placeholder="Filter bus type..." className="h-8.5 text-xs" />
                  <CommandList>
                    <CommandEmpty className="py-2 text-center text-xs text-slate-500">
                      No bus types found.
                    </CommandEmpty>
                    <CommandGroup>
                      {busTypes.map((type) => {
                        const filterValue =
                          (table
                            .getColumn("busType")
                            ?.getFilterValue() as string[]) ?? [];
                        const isChecked = filterValue.includes(type.value);
                        return (
                          <CommandItem
                            key={type.value}
                            value={type.value}
                            onSelect={() => {
                              const newValue = isChecked
                                ? filterValue.filter((v) => v !== type.value)
                                : [...filterValue, type.value];
                              table
                                .getColumn("busType")
                                ?.setFilterValue(newValue.length ? newValue : undefined);
                            }}
                            className="cursor-pointer text-xs">
                            <div className="flex items-center space-x-2 py-0.5">
                              <Checkbox checked={isChecked} />
                              <label className="text-xs font-medium text-slate-700 cursor-pointer">
                                {type.label}
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
                        <IconBus className="size-5.5" />
                      </div>
                      <p className="text-xs font-semibold text-slate-900">
                        No bus & shuttle routes found
                      </p>
                      <p className="text-[11px] text-slate-400 max-w-xs">
                        Adjust filters or add a new bus route schedule.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onOpenCreate}
                        className="h-8 text-xs font-semibold text-blue-600 border-blue-200 hover:bg-blue-50 gap-1 mt-1">
                        <IconPlus className="size-3.5" />
                        <span>Add Bus Route</span>
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
          itemName="routes"
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
              Delete Bus Route
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to delete bus route{" "}
              <strong className="text-slate-900 font-semibold">
                {itemToDelete?.busNumber} ({itemToDelete?.operator})
              </strong>
              ? This action will permanently remove this trip schedule and active seat reservations.
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
              {isDeleting ? "Deleting..." : "Yes, Delete Route"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
