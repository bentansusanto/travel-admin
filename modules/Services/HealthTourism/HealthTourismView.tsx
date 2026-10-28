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
  IconBuildingHospital,
  IconCurrencyDollar,
  IconFirstAidKit,
  IconPlus,
} from "@tabler/icons-react";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import HealthTourismDataTable from "./DataTable";
import { HealthPackageItem } from "./types";

const INITIAL_HEALTH_PACKAGES: HealthPackageItem[] = [];

export default function HealthTourismView() {
  const [packages, setPackages] = useState<HealthPackageItem[]>(INITIAL_HEALTH_PACKAGES);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form state for creating a new health package
  const [newPackage, setNewPackage] = useState({
    title: "",
    facility: "",
    category: "Medical Checkup" as HealthPackageItem["category"],
    city: "Bangkok",
    country: "Thailand",
    duration: "1 Day (Full Evaluation)",
    price: "",
  });

  const handleDeletePackage = (id: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== id));
  };

  const handleCreatePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPackage.title || !newPackage.facility || !newPackage.price) {
      toast.error("Please fill in package title, facility name, and price");
      return;
    }

    const created: HealthPackageItem = {
      id: `hp-${Date.now()}`,
      title: newPackage.title,
      facility: newPackage.facility,
      category: newPackage.category,
      city: newPackage.city,
      country: newPackage.country,
      duration: newPackage.duration,
      inclusions: ["Specialist Consultation", "VIP Assistance", "Medical Report Translation"],
      price: Number(newPackage.price) || 800,
      rating: 5.0,
      thumbnail: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=500&auto=format&fit=crop&q=80",
      status: "Active",
    };

    setPackages((prev) => [created, ...prev]);
    toast.success(`Health package "${created.title}" added successfully`);
    setIsCreateOpen(false);
    setNewPackage({
      title: "",
      facility: "",
      category: "Medical Checkup",
      city: "Bangkok",
      country: "Thailand",
      duration: "1 Day (Full Evaluation)",
      price: "",
    });
  };

  // Dynamic KPI Metrics
  const totalPackages = packages.length;
  const uniqueFacilities = useMemo(() => {
    const set = new Set(packages.map((p) => p.facility));
    return set.size;
  }, [packages]);

  const avgPrice = useMemo(() => {
    if (totalPackages === 0) return 0;
    const sum = packages.reduce((acc, curr) => acc + curr.price, 0);
    return sum / totalPackages;
  }, [packages, totalPackages]);

  return (
    <div className="space-y-4">
      {/* 1. Header & Create Action */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 uppercase tracking-wider">
            <IconFirstAidKit className="size-3.5" />
            <span>Medical Tourism & Wellness Services</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Health & Wellness Tourism
          </h1>
          <p className="text-xs text-slate-500">
            Manage specialized healthcare packages, executive checkups, aesthetic care, and international wellness retreats.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          className="h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold gap-1.5 shadow-sm hover:shadow-md transition-all self-start sm:self-auto cursor-pointer">
          <IconPlus className="size-4" />
          <span>New Package</span>
        </Button>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <IconFirstAidKit className="size-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Active Health Packages</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{totalPackages}</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="flex size-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
            <IconBuildingHospital className="size-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Partner Hospitals & Centers</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{uniqueFacilities}</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <IconCurrencyDollar className="size-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Average Package Value</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              ${avgPrice.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main Data Table */}
      <HealthTourismDataTable
        data={packages}
        onDeleteItem={handleDeletePackage}
        onOpenCreate={() => setIsCreateOpen(true)}
      />

      {/* Quick Add Health Package Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Add Medical Tourism Package
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Create a healthcare or wellness package with partner medical centers.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreatePackage} className="space-y-3.5 mt-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Package Title</Label>
              <Input
                placeholder="e.g. Total Health Biomarker Screening"
                value={newPackage.title}
                onChange={(e) =>
                  setNewPackage((prev) => ({ ...prev, title: e.target.value }))
                }
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Facility / Medical Center</Label>
              <Input
                placeholder="e.g. Bumrungrad Int'l Hospital"
                value={newPackage.facility}
                onChange={(e) =>
                  setNewPackage((prev) => ({ ...prev, facility: e.target.value }))
                }
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Specialization</Label>
                <Select
                  value={newPackage.category}
                  onValueChange={(val: any) =>
                    setNewPackage((prev) => ({ ...prev, category: val }))
                  }>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Medical Checkup">Medical Checkup</SelectItem>
                    <SelectItem value="Dental Care">Dental Care</SelectItem>
                    <SelectItem value="Aesthetic & Dermatology">Aesthetic & Dermatology</SelectItem>
                    <SelectItem value="Wellness & Thermal Spa">Wellness & Thermal Spa</SelectItem>
                    <SelectItem value="Eye Care">Eye Care</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Package Price (USD)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 1200"
                  value={newPackage.price}
                  onChange={(e) =>
                    setNewPackage((prev) => ({ ...prev, price: e.target.value }))
                  }
                  className="h-9 text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">City</Label>
                <Input
                  placeholder="e.g. Bangkok"
                  value={newPackage.city}
                  onChange={(e) =>
                    setNewPackage((prev) => ({ ...prev, city: e.target.value }))
                  }
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Duration</Label>
                <Input
                  placeholder="e.g. 2 Days Program"
                  value={newPackage.duration}
                  onChange={(e) =>
                    setNewPackage((prev) => ({ ...prev, duration: e.target.value }))
                  }
                  className="h-9 text-xs"
                  required
                />
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
                Create Package
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
