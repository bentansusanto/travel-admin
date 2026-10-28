"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconCar,
  IconCurrencyDollar,
  IconPlus,
  IconSteeringWheel,
} from "@tabler/icons-react";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import RentCarDataTable from "./DataTable";
import { CarRentalItem } from "./types";

const INITIAL_CARS: CarRentalItem[] = [];

export default function RentCarView() {
  const [cars, setCars] = useState<CarRentalItem[]>(INITIAL_CARS);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form state for creating a new car
  const [newCar, setNewCar] = useState({
    modelName: "",
    brand: "Toyota",
    carType: "Family MPV" as CarRentalItem["carType"],
    transmission: "Automatic" as CarRentalItem["transmission"],
    seats: "7",
    fuelType: "Petrol" as CarRentalItem["fuelType"],
    dailyRate: "",
    includesDriver: "false",
    location: "Jakarta",
  });

  const handleDeleteCar = (id: string) => {
    setCars((prev) => prev.filter((c) => c.id !== id));
  };

  const handleCreateCar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCar.modelName || !newCar.dailyRate) {
      toast.error("Please fill in car model name and daily rental rate");
      return;
    }

    const created: CarRentalItem = {
      id: `cr-${Date.now()}`,
      modelName: newCar.modelName,
      brand: newCar.brand,
      carType: newCar.carType,
      transmission: newCar.transmission,
      seats: Number(newCar.seats) || 5,
      fuelType: newCar.fuelType,
      dailyRate: Number(newCar.dailyRate) || 50,
      includesDriver: newCar.includesDriver === "true",
      location: newCar.location,
      thumbnail: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500&auto=format&fit=crop&q=80",
      status: "Available",
    };

    setCars((prev) => [created, ...prev]);
    toast.success(`Vehicle "${created.modelName}" added successfully`);
    setIsCreateOpen(false);
    setNewCar({
      modelName: "",
      brand: "Toyota",
      carType: "Family MPV",
      transmission: "Automatic",
      seats: "7",
      fuelType: "Petrol",
      dailyRate: "",
      includesDriver: "false",
      location: "Jakarta",
    });
  };

  // Dynamic KPI Metrics
  const totalCars = cars.length;
  const uniqueBrands = useMemo(() => {
    const set = new Set(cars.map((c) => c.brand));
    return set.size;
  }, [cars]);

  const avgRate = useMemo(() => {
    if (totalCars === 0) return 0;
    const sum = cars.reduce((acc, curr) => acc + curr.dailyRate, 0);
    return sum / totalCars;
  }, [cars, totalCars]);

  return (
    <div className="space-y-4">
      {/* 1. Header & Create Action */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 uppercase tracking-wider">
            <IconCar className="size-3.5" />
            <span>Vehicle Rental & Fleet Management</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Car Rental Fleet
          </h1>
          <p className="text-xs text-slate-500">
            Manage private rental cars, SUVs, luxury MPVs, transmission specs, daily rates, and self-drive allotments.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          className="h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold gap-1.5 shadow-sm hover:shadow-md transition-all self-start sm:self-auto cursor-pointer">
          <IconPlus className="size-4" />
          <span>New Car</span>
        </Button>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <IconCar className="size-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Total Fleet Cars</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{totalCars}</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="flex size-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
            <IconSteeringWheel className="size-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Automobile Brands</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{uniqueBrands}</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <IconCurrencyDollar className="size-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Average Daily Rate</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              ${avgRate.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main Data Table */}
      <RentCarDataTable
        data={cars}
        onDeleteItem={handleDeleteCar}
        onOpenCreate={() => setIsCreateOpen(true)}
      />

      {/* Quick Add Car Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Add Vehicle to Fleet
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Register a vehicle with specs and daily rate to open for customer reservations.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCar} className="space-y-3.5 mt-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Model Name</Label>
              <Input
                placeholder="e.g. Toyota Fortuner 2.8 VRZ"
                value={newCar.modelName}
                onChange={(e) =>
                  setNewCar((prev) => ({ ...prev, modelName: e.target.value }))
                }
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Brand</Label>
                <Select
                  value={newCar.brand}
                  onValueChange={(val) =>
                    setNewCar((prev) => ({ ...prev, brand: val }))
                  }>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Toyota">Toyota</SelectItem>
                    <SelectItem value="Mitsubishi">Mitsubishi</SelectItem>
                    <SelectItem value="Honda">Honda</SelectItem>
                    <SelectItem value="Hyundai">Hyundai</SelectItem>
                    <SelectItem value="Mercedes-Benz">Mercedes-Benz</SelectItem>
                    <SelectItem value="BMW">BMW</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Car Type</Label>
                <Select
                  value={newCar.carType}
                  onValueChange={(val: any) =>
                    setNewCar((prev) => ({ ...prev, carType: val }))
                  }>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Luxury MPV">Luxury MPV</SelectItem>
                    <SelectItem value="Family MPV">Family MPV</SelectItem>
                    <SelectItem value="SUV & 4x4">SUV & 4x4</SelectItem>
                    <SelectItem value="Compact City Car">Compact City Car</SelectItem>
                    <SelectItem value="Executive Sedan">Executive Sedan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Transmission</Label>
                <Select
                  value={newCar.transmission}
                  onValueChange={(val: any) =>
                    setNewCar((prev) => ({ ...prev, transmission: val }))
                  }>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Automatic">Automatic</SelectItem>
                    <SelectItem value="Manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Daily Rate (USD)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 75"
                  value={newCar.dailyRate}
                  onChange={(e) =>
                    setNewCar((prev) => ({ ...prev, dailyRate: e.target.value }))
                  }
                  className="h-9 text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Location City</Label>
                <Input
                  placeholder="e.g. Jakarta / Bali"
                  value={newCar.location}
                  onChange={(e) =>
                    setNewCar((prev) => ({ ...prev, location: e.target.value }))
                  }
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Driver Option</Label>
                <Select
                  value={newCar.includesDriver}
                  onValueChange={(val) =>
                    setNewCar((prev) => ({ ...prev, includesDriver: val }))
                  }>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Self-Drive</SelectItem>
                    <SelectItem value="true">With Driver</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="mt-4 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreateOpen(false)}
                className="h-9 text-xs">
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold">
                Create Car
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
