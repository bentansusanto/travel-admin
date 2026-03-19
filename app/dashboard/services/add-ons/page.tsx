"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  useFindAllAddOnsQuery,
  useCreateAddOnMutation,
  useUpdateAddOnMutation,
  useDeleteAddOnMutation,
  AddOn,
} from "@/store/services/add-ons.service";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddOnModal } from "@/components/add-ons/AddOnModal";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MoreVertical, Plus, Pencil, Trash2, Package, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

export default function AddOnsPage() {
  const { data: addOnsData, isLoading, refetch } = useFindAllAddOnsQuery();
  const [createAddOn] = useCreateAddOnMutation();
  const [updateAddOn] = useUpdateAddOnMutation();
  const [deleteAddOn] = useDeleteAddOnMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAddOn, setSelectedAddOn] = useState<AddOn | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [addOnToDelete, setAddOnToDelete] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  const addOns = addOnsData?.data || [];

  const filteredAddOns = addOns.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: addOns.length,
    tour: addOns.filter((a) => a.category === "tour").length,
    motor: addOns.filter((a) => a.category === "motor").length,
    general: addOns.filter((a) => a.category === "general").length,
  };

  const handleCreateOrUpdate = async (data: any) => {
    try {
      if (selectedAddOn?.id) {
        await updateAddOn({ id: selectedAddOn.id, data }).unwrap();
      } else {
        await createAddOn(data).unwrap();
      }
      refetch();
    } catch (error) {
      throw error;
    }
  };

  const handleDelete = async () => {
    if (addOnToDelete) {
      try {
        await deleteAddOn(addOnToDelete).unwrap();
        toast.success("Add-on deleted successfully");
        setIsDeleteDialogOpen(false);
        refetch();
      } catch (error) {
        toast.error("Failed to delete add-on");
      }
    }
  };

  const openEditModal = (addOn: AddOn) => {
    setSelectedAddOn(addOn);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setSelectedAddOn(null);
    setIsModalOpen(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add-on Packages</h1>
          <p className="text-muted-foreground">
            Manage additional services for tours and motor rentals.
          </p>
        </div>
        <Button onClick={openCreateModal} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Package
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">For Tours</CardTitle>
            <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-600 border-blue-100">TOUR</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tour}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">For Motors</CardTitle>
            <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-600 border-emerald-100">MOTOR</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.motor}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">General</CardTitle>
            <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-600 border-slate-100">GENERAL</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.general}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Service Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="hidden md:table-cell">Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-md" /></TableCell>
                </TableRow>
              ))
            ) : filteredAddOns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Package className="h-10 w-10 text-muted-foreground/50" />
                    <p className="text-muted-foreground">No add-on packages found.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredAddOns.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn("capitalize px-3 py-0.5 text-[11px]", {
                        "bg-blue-100 text-blue-700 hover:bg-blue-100": item.category === "tour",
                        "bg-emerald-100 text-emerald-700 hover:bg-emerald-100": item.category === "motor",
                        "bg-slate-100 text-slate-700 hover:bg-slate-100": item.category === "general",
                      })}
                    >
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{formatPrice(Number(item.price))}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-xs max-w-xs truncate">
                    {item.description || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => openEditModal(item)} className="flex items-center gap-2">
                          <Pencil className="h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setAddOnToDelete(item.id!);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="flex items-center gap-2 text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AddOnModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        initialData={selectedAddOn}
        title={selectedAddOn ? "Edit Package" : "Add Package"}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this add-on package.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
