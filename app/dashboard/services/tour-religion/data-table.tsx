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
import { ArrowUpDown, ChevronDown, MoreHorizontal, PlusCircle } from "lucide-react";
import * as React from "react";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import NextImage from "next/image";

import { DestinationTranslation } from "@/store/services/destination.service";

export type TourReligion = {
  id: string;
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

import ServiceDetailModal from "./service-detail-modal";
import ServiceFormModal from "./service-form-modal";

export default function TourReligionDataTable({ data }: { data: TourReligion[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const [selectedService, setSelectedService] = React.useState<TourReligion | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false);
  const [serviceToUpdate, setServiceToUpdate] = React.useState<TourReligion | null>(null);

  const handleUpdateSubmit = (values: any) => {
    console.log("Updating service:", values);
    // Update logic would go here
  };

  const columns: ColumnDef<TourReligion>[] = [
    {
      accessorKey: "thumbnail",
      header: "Image",
      cell: ({ row }) => {
        const thumbnail = row.getValue("thumbnail") as string;
        return (
          <div className="bg-muted flex h-24 w-24 items-center justify-center overflow-hidden rounded-md border">
            {thumbnail ? (
              <NextImage
                src={thumbnail}
                alt={row.getValue("name")}
                width={100}
                height={100}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-muted-foreground px-1 text-center text-[8px]">No Image</div>
            )}
          </div>
        );
      }
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            className="-ml-3"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Service Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.getValue("category")}
        </Badge>
      )
    },
    {
      accessorKey: "price",
      header: ({ column }) => {
        return (
          <Button
            className="-ml-3"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Price
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const price = parseFloat(row.getValue("price"));
        const formatted = new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR"
        }).format(price);
        return <div className="font-medium">{formatted}</div>;
      }
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => row.getValue("location")
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge
            className={cn("capitalize", {
              "bg-green-100 text-green-700 hover:bg-green-100": status === "active",
              "bg-gray-100 text-gray-700 hover:bg-gray-100": status === "inactive"
            })}>
            {status}
          </Badge>
        );
      }
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSelectedService(row.original);
                  setIsModalOpen(true);
                }}>
                View details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setServiceToUpdate(row.original);
                  setIsUpdateModalOpen(true);
                }}>
                Edit service
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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

  const categories = [
    { value: "Tour", label: "Tour" },
    { value: "Religion", label: "Religion" }
  ];

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center gap-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search services..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
            className="max-w-sm"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <PlusCircle className="me-2 h-4 w-4" />
                Category
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-52 p-0">
              <Command>
                <CommandInput placeholder="Category" className="h-9" />
                <CommandList>
                  <CommandEmpty>No category found.</CommandEmpty>
                  <CommandGroup>
                    {categories.map((cat) => (
                      <CommandItem
                        key={cat.value}
                        value={cat.value}
                        onSelect={() => {
                          const filterValue = table
                            .getColumn("category")
                            ?.getFilterValue() as string[];
                          const newValue = filterValue?.includes(cat.value)
                            ? filterValue.filter((v) => v !== cat.value)
                            : [...(filterValue ?? []), cat.value];
                          table
                            .getColumn("category")
                            ?.setFilterValue(newValue.length ? newValue : undefined);
                        }}>
                        <div className="flex items-center space-x-3 py-1">
                          <Checkbox
                            checked={(
                              table.getColumn("category")?.getFilterValue() as string[]
                            )?.includes(cat.value)}
                          />
                          <label className="leading-none">{cat.label}</label>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}>
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 pt-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}>
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>

      <ServiceDetailModal
        service={selectedService}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <ServiceFormModal
        service={serviceToUpdate}
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onSubmit={handleUpdateSubmit}
      />
    </div>
  );
}
