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
  VisaItem,
  useDeleteVisaMutation,
} from "@/store/services/visa.service";
import {
  IconChevronDown,
  IconClock,
  IconColumns,
  IconDotsVertical,
  IconEdit,
  IconFileCertificate,
  IconFileText,
  IconFilter,
  IconMapPin,
  IconPhoto,
  IconSearch,
  IconTrash,
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
import NextImage from "next/image";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";

const VISA_TYPES = [
  { label: "Tourist", value: "Tourist" },
  { label: "Business", value: "Business" },
  { label: "Transit", value: "Transit" },
  { label: "Student", value: "Student" },
  { label: "Working Holiday", value: "Working Holiday" },
];

export default function VisaDataTable({ data }: { data: VisaItem[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // Alert Dialog delete state
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [deleteVisa] = useDeleteVisaMutation();

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      setIsDeleting(true);
      await deleteVisa(itemToDelete.id).unwrap();
      toast.success(`Visa service "${itemToDelete.name}" deleted successfully`);
      setItemToDelete(null);
    } catch (err: any) {
      toast.error(`Failed to delete visa service: ${err?.data?.message || "Unknown error"}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<VisaItem>[] = [
    {
      accessorKey: "thumbnail",
      header: "Country / Visual",
      enableSorting: false,
      cell: ({ row }) => {
        const thumbnail = row.original.thumbnail;
        const flagUrl = row.original.flag_url;
        const countryName = row.original.country_name;
        const id = row.original.id;

        return (
          <Link
            href={`/dashboard/services/document-visa/edit/${id}`}
            className="group relative flex h-11 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200/80 bg-slate-100 shadow-2xs hover:opacity-90 transition-opacity">
            {thumbnail ? (
              <NextImage
                src={thumbnail}
                alt={countryName}
                fill
                sizes="56px"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : flagUrl ? (
              <img src={flagUrl} alt={countryName} className="h-6 w-9 object-cover rounded shadow-2xs" />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400">
                <IconFileCertificate className="size-4" />
                <span className="text-[8px] font-medium mt-0.5">{countryName.substring(0, 3)}</span>
              </div>
            )}
          </Link>
        );
      },
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Visa Service & Country
            <ArrowUpDown className="ml-1.5 size-3.5" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const translations = row.original.translations || [];
        const countryName = row.original.country_name;
        const id = row.original.id;

        return (
          <div className="flex flex-col gap-0.5 max-w-xs">
            <Link
              href={`/dashboard/services/document-visa/edit/${id}`}
              className="font-bold text-xs text-slate-900 hover:text-blue-600 transition-colors truncate">
              {row.getValue("name")}
            </Link>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">{countryName}</span>
              <span>•</span>
              <span className="text-slate-400">{row.original.entry_type}</span>
            </div>
            <div className="flex items-center gap-1 pt-0.5">
              {translations.map((t, idx) => (
                <span
                  key={idx}
                  className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  {t.language_code}
                </span>
              ))}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "visa_type",
      header: "Visa Type",
      cell: ({ row }) => {
        const type = row.getValue("visa_type") as string;
        return (
          <Badge
            variant="outline"
            className="border-blue-200 bg-blue-50 text-blue-700 font-semibold text-xs whitespace-nowrap">
            {type} Visa
          </Badge>
        );
      },
    },
    {
      accessorKey: "processing_time",
      header: "Processing & Validity",
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5 text-xs">
          <div className="flex items-center gap-1 text-slate-700 font-medium">
            <IconClock className="size-3 text-slate-400 shrink-0" />
            <span>{row.original.processing_time}</span>
          </div>
          <span className="text-[11px] text-slate-400">Validity: {row.original.validity}</span>
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Service Fee
            <ArrowUpDown className="ml-1.5 size-3.5" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("price"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(amount || 0);

        return (
          <span className="font-mono text-xs font-bold text-slate-900">
            {formatted}
          </span>
        );
      },
    },
    {
      accessorKey: "requirements",
      header: () => <div className="text-center">Documents</div>,
      cell: ({ row }) => {
        const count = row.original.requirements?.length || 0;
        return (
          <div className="text-center">
            <Badge
              variant="secondary"
              className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 gap-1">
              <IconFileText className="size-3 text-blue-600" />
              {count} Docs
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: () => <div className="text-center">Status</div>,
      cell: () => (
        <div className="text-center">
          <Badge
            variant="outline"
            className="border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold text-[11px] px-2 py-0.5">
            Active
          </Badge>
        </div>
      ),
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
                <Button variant="ghost" size="icon" className="size-7 text-slate-400 hover:text-slate-700">
                  <IconDotsVertical className="size-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem asChild className="text-xs gap-2 cursor-pointer">
                  <Link href={`/dashboard/services/document-visa/edit/${item.id}`}>
                    <IconEdit className="size-3.5 text-blue-600" />
                    Edit Visa
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setItemToDelete({ id: item.id, name: item.name })}
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

  return (
    <div className="w-full space-y-3.5">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search Input */}
          <div className="relative min-w-60 max-w-xs flex-1">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              placeholder="Search visa package or country..."
              value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
              onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
              className="pl-9 h-9 text-xs bg-slate-50/50 border-slate-200 rounded-lg"
            />
          </div>

          {/* Visa Type Filter Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 text-xs font-semibold text-slate-700 border-slate-200 bg-white gap-1.5 shadow-2xs">
                <IconFilter className="size-3.5 text-slate-500" />
                <span>Visa Type</span>
                {(table.getColumn("visa_type")?.getFilterValue() as string[])?.length > 0 && (
                  <Badge variant="secondary" className="px-1.5 py-0 text-[10px] bg-blue-50 text-blue-700">
                    {(table.getColumn("visa_type")?.getFilterValue() as string[]).length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-52 p-0" align="start">
              <Command>
                <CommandInput placeholder="Search type..." className="h-8.5 text-xs" />
                <CommandList>
                  <CommandEmpty className="py-2 text-center text-xs text-slate-500">No visa type found.</CommandEmpty>
                  <CommandGroup>
                    {VISA_TYPES.map((type) => {
                      const filterValue = (table.getColumn("visa_type")?.getFilterValue() as string[]) ?? [];
                      const isChecked = filterValue.includes(type.value);
                      return (
                        <CommandItem
                          key={type.value}
                          value={type.value}
                          onSelect={() => {
                            const newValue = isChecked
                              ? filterValue.filter((v: any) => v !== type.value)
                              : [...filterValue, type.value];
                            table.getColumn("visa_type")?.setFilterValue(newValue.length ? newValue : undefined);
                          }}
                          className="cursor-pointer text-xs">
                          <div className="flex items-center space-x-2 py-0.5">
                            <Checkbox checked={isChecked} />
                            <label className="text-xs font-medium text-slate-700 cursor-pointer">{type.label}</label>
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 text-xs font-semibold text-slate-700 border-slate-200 bg-white gap-1.5 shrink-0 shadow-2xs">
              <IconColumns className="size-3.5 text-slate-500" />
              <span>Columns</span>
              <IconChevronDown className="size-3.5 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel className="text-xs text-slate-500 font-semibold">Toggle Columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize text-xs cursor-pointer"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}>
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Data Table */}
      <div className="rounded-xl border border-slate-200/80 overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-slate-50/80 border-b border-slate-200/60">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-xs font-semibold text-slate-600 px-4 py-2.5">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-slate-50/80 transition-colors border-b border-slate-100">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-2.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={table.getAllColumns().length} className="h-28 text-center text-xs text-slate-400">
                  No visa service packages found matching your criteria.
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
        itemName="visa services"
        onPageChange={(p) => table.setPageIndex(p - 1)}
        onPageSizeChange={(s) => table.setPageSize(s)}
        className="pt-2 border-t border-slate-100 bg-transparent"
      />

      {/* Modern Confirmation Alert Dialog for Deletion */}
      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent className="max-w-md bg-white border-slate-200">
          <AlertDialogHeader>
            <div className="flex size-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600 mb-1">
              <IconTrash className="size-5.5" />
            </div>
            <AlertDialogTitle className="text-base font-bold text-slate-900">
              Delete Visa Service Package
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-900 font-semibold">{itemToDelete?.name}</strong>? This action cannot be undone and will permanently remove this visa service listing.
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
              {isDeleting ? <Loader2 className="size-3.5 animate-spin" /> : <IconTrash className="size-3.5" />}
              {isDeleting ? "Deleting..." : "Yes, Delete Visa Service"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
