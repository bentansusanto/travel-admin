"use client";

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
  useReactTable
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  Loader2,
  MoreHorizontal,
  Pencil,
  Trash2
} from "lucide-react";
import * as React from "react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
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
  CommandList
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { TablePagination } from "@/components/ui/table-pagination";
import {
  DestinationTranslation,
  useDeleteDestinationMutation,
  useFindAllCategoryDestinationsQuery
} from "@/store/services/destination.service";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconColumns,
  IconFilter,
  IconMapPin,
  IconPhoto,
  IconSearch,
  IconTrash
} from "@tabler/icons-react";
import NextImage from "next/image";
import Link from "next/link";
import { toast } from "sonner";

export type TourReligion = {
  id: string;
  state_id: string;
  category_destination_id: string;
  name: string;
  category: string;
  price: number;
  location: string;
  status: string;
  createdAt: string;
  description?: string;
  thumbnail?: string;
  images?: string[];
  highlights?: string[];
  facilities?: string[];
  translations: DestinationTranslation[];
};

export default function TourReligionDataTable({ data }: { data: TourReligion[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Alert Dialog delete state
  const [tourToDelete, setTourToDelete] = React.useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const [deleteDestination] = useDeleteDestinationMutation();

  const handleConfirmDelete = async () => {
    if (!tourToDelete) return;
    try {
      setIsDeleting(true);
      await deleteDestination(tourToDelete.id).unwrap();
      toast.success(`Tour package "${tourToDelete.name}" deleted successfully`);
      setTourToDelete(null);
    } catch (err: any) {
      console.error("Failed to delete destination:", err);
      toast.error(`Failed to delete tour: ${err?.data?.message || "Unknown error occurred"}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<TourReligion>[] = [
    {
      accessorKey: "thumbnail",
      header: "Visual",
      enableSorting: false,
      cell: ({ row }) => {
        const thumbnail = row.getValue("thumbnail") as string;
        const name = row.getValue("name") as string;
        const id = row.original.id;
        return (
          <Link
            href={`/dashboard/services/tour-religion/edit/${id}`}
            className="group relative flex h-11 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200/80 bg-slate-100 shadow-2xs hover:opacity-90 transition-opacity">
            {thumbnail ? (
              <NextImage
                src={thumbnail}
                alt={name || "Tour visual"}
                fill
                sizes="56px"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400">
                <IconPhoto className="size-4" />
                <span className="text-[8px] font-medium mt-0.5">No photo</span>
              </div>
            )}
          </Link>
        );
      }
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
            Package Name
            <ArrowUpDown className="ml-1.5 size-3.5" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const translations = row.original.translations || [];
        const description = row.original.description;
        const id = row.original.id;
        return (
          <div className="flex flex-col gap-0.5 max-w-xs">
            <Link
              href={`/dashboard/services/tour-religion/edit/${id}`}
              className="font-bold text-xs text-slate-900 hover:text-blue-600 transition-colors truncate">
              {row.getValue("name")}
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
      }
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className="border-blue-200 bg-blue-50 text-blue-700 font-semibold text-xs capitalize whitespace-nowrap">
          {row.getValue("category")}
        </Badge>
      )
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
            Base Price
            <ArrowUpDown className="ml-1.5 size-3.5" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const price = parseFloat(row.getValue("price")) || 0;
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(price);
        return <div className="font-bold text-xs text-slate-900 tabular-nums whitespace-nowrap">{formatted}</div>;
      }
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => {
        const location = row.getValue("location") as string;
        return (
          <div className="flex items-center gap-1.5 text-xs text-slate-600 whitespace-nowrap">
            <IconMapPin className="size-3.5 text-slate-400 shrink-0" />
            <span>{location || "Indonesia"}</span>
          </div>
        );
      }
    },
    {
      accessorKey: "status",
      header: ({ column }) => <div className="text-center">Status</div>,
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <div className="text-center">
            <Badge
              variant="outline"
              className={
                status === "active"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold text-[11px] capitalize"
                  : "border-slate-200 bg-slate-50 text-slate-600 font-semibold text-[11px] capitalize"
              }>
              {status}
            </Badge>
          </div>
        );
      }
    },
    {
      id: "actions",
      enableHiding: false,
      header: ({ column }) => <div className="text-center">Actions</div>,
      cell: ({ row }) => {
        const id = row.original.id;
        return (
          <div className="text-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-7 text-slate-400 hover:text-slate-700">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuLabel className="text-xs text-slate-500 font-semibold">Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="text-xs gap-2 cursor-pointer">
                  <Link href={`/dashboard/services/tour-religion/edit/${id}`}>
                    <Pencil className="size-3.5 text-blue-600" />
                    Edit Package
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-xs gap-2 text-rose-600 cursor-pointer"
                  onClick={() => setTourToDelete({ id: row.original.id, name: row.original.name })}>
                  <Trash2 className="size-3.5" />
                  Delete Package
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      }
    }
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
      rowSelection
    }
  });

  const { data: categoriesData } = useFindAllCategoryDestinationsQuery();

  const categories = React.useMemo(() => {
    return (
      categoriesData?.data?.map((cat) => ({
        value: cat.name,
        label: cat.name
      })) || []
    );
  }, [categoriesData]);

  // Pagination calculation
  const totalItems = table.getFilteredRowModel().rows.length;
  const pageSize = table.getState().pagination.pageSize;
  const pageIndex = table.getState().pagination.pageIndex;
  const totalPages = table.getPageCount();
  const startIndex = pageIndex * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  // Helper for generating page numbers with ellipses
  const pageNumbers = React.useMemo(() => {
    const current = pageIndex + 1;
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (current <= 3) {
      return [1, 2, 3, 4, "...", totalPages];
    }
    if (current >= totalPages - 2) {
      return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", current - 1, current, current + 1, "...", totalPages];
  }, [pageIndex, totalPages]);

  return (
    <div className="w-full space-y-3.5">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search Input */}
          <div className="relative min-w-60 max-w-xs flex-1">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              placeholder="Search tour package name..."
              value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
              onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
              className="pl-9 h-9 text-xs bg-slate-50/50 border-slate-200 rounded-lg"
            />
          </div>

          {/* Category Filter Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 text-xs font-semibold text-slate-700 border-slate-200 bg-white gap-1.5 shadow-2xs">
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
                    {categories.map((cat) => {
                      const filterValue = (table.getColumn("category")?.getFilterValue() as string[]) ?? [];
                      const isChecked = filterValue.includes(cat.value);
                      return (
                        <CommandItem
                          key={cat.value}
                          value={cat.value}
                          onSelect={() => {
                            const newValue = isChecked
                              ? filterValue.filter((v) => v !== cat.value)
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 text-xs font-semibold text-slate-700 border-slate-200 bg-white gap-1.5 shrink-0 shadow-2xs">
              <IconColumns className="size-3.5 text-slate-500" />
              <span>Columns</span>
              <ChevronDown className="size-3.5 text-slate-400" />
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
                  No tour packages found matching your criteria.
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
        className="pt-2 border-t border-slate-100 bg-transparent"
      />

      {/* Modern Confirmation Alert Dialog for Deletion */}
      <AlertDialog open={!!tourToDelete} onOpenChange={(open) => !open && setTourToDelete(null)}>
        <AlertDialogContent className="max-w-md bg-white border-slate-200">
          <AlertDialogHeader>
            <div className="flex size-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600 mb-1">
              <IconTrash className="size-5.5" />
            </div>
            <AlertDialogTitle className="text-base font-bold text-slate-900">
              Delete Tour Package
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-900 font-semibold">{tourToDelete?.name}</strong>? This action cannot be undone and will permanently remove this tour package and its translations.
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
              {isDeleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
              {isDeleting ? "Deleting..." : "Yes, Delete Package"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
