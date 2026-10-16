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
  AttractionItem,
  useDeleteEntertainmentMutation,
  useFindAllEntertainmentCategoriesQuery,
} from "@/store/services/entertainment.service";
import {
  IconBuildingCarousel,
  IconChevronDown,
  IconColumns,
  IconDotsVertical,
  IconEdit,
  IconFilter,
  IconMapPin,
  IconPhoto,
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
import Link from "next/link";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";

export default function AttractionsDataTable({ data }: { data: AttractionItem[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // Alert Dialog delete state
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [deleteEntertainment] = useDeleteEntertainmentMutation();
  const { data: categoriesData } = useFindAllEntertainmentCategoriesQuery();

  const categories = useMemo(() => {
    const raw = categoriesData?.data || (categoriesData as any)?.datas || [];
    return raw.map((c: any) => ({
      label: c.name,
      value: c.name,
    }));
  }, [categoriesData]);

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      setIsDeleting(true);
      await deleteEntertainment(itemToDelete.id).unwrap();
      toast.success(`Attraction "${itemToDelete.name}" deleted successfully`);
      setItemToDelete(null);
    } catch (err: any) {
      toast.error(`Failed to delete attraction: ${err?.data?.message || "Unknown error"}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<AttractionItem>[] = [
    {
      accessorKey: "thumbnail",
      header: "Visual",
      enableSorting: false,
      cell: ({ row }) => {
        const item = row.original;
        const thumbnail = item.thumbnail || (item.images && item.images[0]) || "";
        const enTrans = item.translations?.find((t) => t.language_code === "en");
        const name = enTrans?.name || item.name || item.translations?.[0]?.name || "Attraction visual";
        const id = item.id;

        return (
          <Link
            href={`/dashboard/services/entertainment-attractions/edit/${id}`}
            className="group relative flex h-11 w-15 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200/80 bg-slate-100 shadow-2xs hover:opacity-90 transition-opacity">
            {thumbnail ? (
              <img
                src={thumbnail}
                alt={name}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='88' viewBox='0 0 120 88'%3E%3Crect width='120' height='88' fill='%23f1f5f9'/%3E%3Cpath d='M44 38a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-16 26h64L74 42l-14 18-10-12-22 26z' fill='%23cbd5e1'/%3E%3C/svg%3E";
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400">
                <IconPhoto className="size-4" />
                <span className="text-[8px] font-medium mt-0.5">No photo</span>
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
            Attraction Name
            <ArrowUpDown className="ml-1.5 size-3.5" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const item = row.original;
        const translations = item.translations || [];
        const enTrans = translations.find((t) => t.language_code === "en");
        const name = enTrans?.name || item.name || translations[0]?.name || "Unnamed Attraction";
        const description = enTrans?.description || item.description || translations[0]?.description || "";
        const id = item.id;

        return (
          <div className="flex flex-col gap-0.5 max-w-xs">
            <Link
              href={`/dashboard/services/entertainment-attractions/edit/${id}`}
              className="font-bold text-xs text-slate-900 hover:text-blue-600 transition-colors truncate">
              {name}
            </Link>
            {description && (
              <span className="text-[11px] text-slate-400 line-clamp-1">
                {description}
              </span>
            )}
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
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const item = row.original;
        const categoryName =
          item.category_destination_name ||
          item.category ||
          (item as any)?.category_destination?.name ||
          "Attraction";

        return (
          <Badge
            variant="outline"
            className="border-blue-200 bg-blue-50 text-blue-700 font-semibold text-xs capitalize whitespace-nowrap">
            {categoryName}
          </Badge>
        );
      },
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
            Ticket Price
            <ArrowUpDown className="ml-1.5 size-3.5" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const amount = Number(row.original.price) || 0;
        const formatted = `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        return (
          <span className="font-mono text-xs font-bold text-slate-900">
            {formatted}
          </span>
        );
      },
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => {
        const item = row.original;
        const locationText =
          item.location ||
          (item.city_name
            ? `${item.city_name}, ${item.country_name || item.state_name || ""}`
            : item.state_name
            ? `${item.state_name}, ${item.country_name || ""}`
            : "Indonesia");

        return (
          <div className="flex items-center gap-1 text-xs text-slate-600 max-w-[160px] truncate">
            <IconMapPin className="size-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{locationText}</span>
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
        const enTrans = item.translations?.find((t) => t.language_code === "en");
        const name = enTrans?.name || item.name || item.translations?.[0]?.name || "Attraction";

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
                  <Link href={`/dashboard/services/entertainment-attractions/edit/${item.id}`}>
                    <IconEdit className="size-3.5 text-blue-600" />
                    Edit Attraction
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setItemToDelete({ id: item.id, name })}
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

  const nameFilterValue = (table.getColumn("name")?.getFilterValue() as string) ?? "";

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
                placeholder="Search attraction name..."
                value={nameFilterValue}
                onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
                className="pl-9 h-9 text-xs bg-slate-50/50 border-slate-200 rounded-lg focus-visible:ring-blue-500 w-full"
              />
              {nameFilterValue && (
                <button
                  type="button"
                  onClick={() => table.getColumn("name")?.setFilterValue("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <IconX className="size-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs font-semibold text-slate-700 border-slate-200 bg-white gap-1.5 shadow-2xs shrink-0">
                  <IconFilter className="size-3.5 text-slate-500" />
                  <span>Category</span>
                  {(table.getColumn("category")?.getFilterValue() as string[])?.length > 0 && (
                    <Badge variant="secondary" className="px-1.5 py-0 text-[10px] bg-blue-50 text-blue-700">
                      {(table.getColumn("category")?.getFilterValue() as string[]).length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search category..." className="h-8.5 text-xs" />
                  <CommandList>
                    <CommandEmpty className="py-2 text-center text-xs text-slate-500">No category found.</CommandEmpty>
                    <CommandGroup>
                      {categories.map((cat: any) => {
                        const filterValue = (table.getColumn("category")?.getFilterValue() as string[]) ?? [];
                        const isChecked = filterValue.includes(cat.value);
                        return (
                          <CommandItem
                            key={cat.value}
                            value={cat.value}
                            onSelect={() => {
                              const newValue = isChecked
                                ? filterValue.filter((v: any) => v !== cat.value)
                                : [...filterValue, cat.value];
                              table.getColumn("category")?.setFilterValue(newValue.length ? newValue : undefined);
                            }}
                            className="cursor-pointer text-xs">
                            <div className="flex items-center space-x-2 py-0.5">
                              <Checkbox checked={isChecked} />
                              <label className="text-xs font-medium text-slate-700 cursor-pointer">{cat.label}</label>
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
        </CardContent>
      </Card>

      {/* 2. Main Data Table Card */}
      <Card className="border-slate-200/80 shadow-2xs bg-white py-0 gap-0 overflow-hidden">
        <div className="overflow-x-auto">
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
                    className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-4 py-2.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={table.getAllColumns().length} className="h-36 text-center text-xs text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <IconBuildingCarousel className="size-8 text-slate-300" />
                      <p className="text-xs font-medium text-slate-500">No attraction packages found matching your criteria.</p>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs font-semibold text-blue-600 border-blue-200 hover:bg-blue-50 gap-1 mt-1">
                        <Link href="/dashboard/services/entertainment-attractions/create">
                          <IconPlus className="size-3.5" />
                          <span>Add Attraction</span>
                        </Link>
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
          itemName="attractions"
          onPageChange={(p) => table.setPageIndex(p - 1)}
          onPageSizeChange={(s) => table.setPageSize(s)}
        />
      </Card>

      {/* Modern Confirmation Alert Dialog for Deletion */}
      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent className="max-w-md bg-white border-slate-200">
          <AlertDialogHeader>
            <div className="flex size-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600 mb-1">
              <IconTrash className="size-5.5" />
            </div>
            <AlertDialogTitle className="text-base font-bold text-slate-900">
              Delete Attraction
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-900 font-semibold">{itemToDelete?.name}</strong>? This action cannot be undone and will permanently remove this attraction and its ticket listings.
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
              {isDeleting ? "Deleting..." : "Yes, Delete Attraction"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
