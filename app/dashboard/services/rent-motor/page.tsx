"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  useFindAllMotorsQuery,
  useCreateMotorMutation,
  useUpdateMotorMutation,
  useDeleteMotorMutation,
  useCreateMerekMutation,
  useUpdateMerekMutation,
  Motor,
  Merek,
} from "@/store/services/motor.service";
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
import { MotorModal } from "@/components/motors/MotorModal";
import { MerekModal } from "@/components/motors/MerekModal";
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
import { MoreVertical, Plus, Pencil, Trash2, Bike, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function MotorcyclesPage() {
  const { data: motorsData, isLoading, refetch } = useFindAllMotorsQuery();
  const [createMotor] = useCreateMotorMutation();
  const [updateMotor] = useUpdateMotorMutation();
  const [deleteMotor] = useDeleteMotorMutation();

  const [createMerek] = useCreateMerekMutation();
  const [updateMerek] = useUpdateMerekMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMotor, setSelectedMotor] = useState<Motor | null>(null);

  const [isMerekModalOpen, setIsMerekModalOpen] = useState(false);
  const [selectedMerek, setSelectedMerek] = useState<Merek | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [motorToDelete, setMotorToDelete] = useState<string | null>(null);

  const motors = motorsData?.data || [];

  const totalMotors = motors.length;
  const availableMotors = motors.filter((m) => m.is_available).length;
  const unavailableMotors = motors.filter((m) => !m.is_available).length;


  const handleCreateOrUpdate = async (data: any) => {
    if (selectedMotor?.id) {
       await updateMotor({ id: selectedMotor.id, data }).unwrap();
    } else {
       await createMotor(data).unwrap();
    }
  };

  const handleMerekSubmit = async (data: { name_merek: string }) => {
    if (selectedMerek?.id) {
      await updateMerek({ id: selectedMerek.id, data }).unwrap();
    } else {
      await createMerek(data).unwrap();
    }
  };

  const handleDelete = async () => {
    if (motorToDelete) {
      try {
        await deleteMotor(motorToDelete).unwrap();
        toast.success("Motor deleted successfully");
        setIsDeleteDialogOpen(false);
      } catch (error) {
        toast.error("Failed to delete motor");
      }
    }
  };

  const openEditModal = (motor: Motor) => {
    setSelectedMotor(motor);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setSelectedMotor(null);
    setIsModalOpen(true);
  };

  const openMerekModal = () => {
    setSelectedMerek(null);
    setIsMerekModalOpen(true);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rent Motorcycles</h1>
          <p className="text-muted-foreground">
            Manage your motorcycle fleet and rental services.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={openMerekModal} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Brand
          </Button>
          <Button onClick={openCreateModal} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Motorcycle
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Motorcycles</CardTitle>
            <Bike className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMotors}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableMotors}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unavailable</CardTitle>
            <XCircle className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unavailableMotors}</div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[100px]">Thumbnail</TableHead>
              <TableHead>Motor Name</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Engine CC</TableHead>
              <TableHead>Daily Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-12 w-16 rounded-md" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-md" /></TableCell>
                </TableRow>
              ))
            ) : motors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Bike className="h-10 w-10 text-muted-foreground/50" />
                    <p className="text-muted-foreground">No motorcycles found.</p>
                    <Button variant="outline" size="sm" onClick={openCreateModal}>Create your first entry</Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              motors.map((motor) => {
                const enTranslation = motor.translations.find(t => t.language_code === 'en');
                const prices = motor.motor_prices || motor.prices || [];
                const dailyPrice = prices.find(p => p.price_type === 'daily')?.price;

                return (
                  <TableRow key={motor.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <img
                        src={motor.thumbnail}
                        alt={enTranslation?.name_motor}
                        className="h-12 w-16 rounded-md object-cover border"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image';
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {enTranslation?.name_motor || "Unnamed Motor"}
                    </TableCell>
                    <TableCell>{motor.merek?.name_merek || "-"}</TableCell>
                    <TableCell>{motor.engine_cc} cc</TableCell>
                    <TableCell>
                      IDR {dailyPrice?.toLocaleString() || "0"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn("capitalize px-3 py-1", {
                          "bg-emerald-100 text-emerald-700 hover:bg-emerald-100/80":
                            motor.is_available,
                          "bg-slate-100 text-slate-700 hover:bg-slate-100/80":
                            !motor.is_available,
                        })}
                      >
                        {motor.is_available ? "Available" : "Unavailable"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => openEditModal(motor)} className="flex items-center gap-2">
                            <Pencil className="h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setMotorToDelete(motor.id!);
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
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <MotorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        initialData={selectedMotor}
        title={selectedMotor ? "Edit Motorcycle" : "Add Motorcycle"}
      />

      <MerekModal
        isOpen={isMerekModalOpen}
        onClose={() => setIsMerekModalOpen(false)}
        onSubmit={handleMerekSubmit}
        initialData={selectedMerek}
        title={selectedMerek ? "Edit Brand" : "Add Brand"}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              motorcycle from your fleet.
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
