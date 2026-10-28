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
  IconBuilding,
  IconCurrencyDollar,
  IconMapPin,
  IconPlus,
} from "@tabler/icons-react";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import HotelDataTable from "./DataTable";
import { HotelItem } from "./types";

const INITIAL_HOTELS: HotelItem[] = [];

export default function HotelsView() {
  const [hotels, setHotels] = useState<HotelItem[]>(INITIAL_HOTELS);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form state for creating a new property
  const [newHotel, setNewHotel] = useState({
    name: "",
    propertyType: "Luxury Hotel" as HotelItem["propertyType"],
    starRating: "5",
    city: "Jakarta",
    country: "Indonesia",
    roomType: "Executive Deluxe Suite",
    pricePerNight: "",
  });

  const handleDeleteHotel = (id: string) => {
    setHotels((prev) => prev.filter((h) => h.id !== id));
  };

  const handleCreateHotel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHotel.name || !newHotel.city || !newHotel.pricePerNight) {
      toast.error("Please fill in property name, city, and nightly rate");
      return;
    }

    const created: HotelItem = {
      id: `ht-${Date.now()}`,
      name: newHotel.name,
      propertyType: newHotel.propertyType,
      starRating: Number(newHotel.starRating) || 5,
      city: newHotel.city,
      country: newHotel.country,
      address: `${newHotel.city} City Center`,
      roomType: newHotel.roomType || "Standard Suite",
      pricePerNight: Number(newHotel.pricePerNight) || 150,
      amenities: ["Free WiFi", "Breakfast Included", "Air Conditioned"],
      totalRooms: 20,
      availableRooms: 10,
      thumbnail: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop&q=80",
      status: "Active",
    };

    setHotels((prev) => [created, ...prev]);
    toast.success(`Hotel "${created.name}" created successfully`);
    setIsCreateOpen(false);
    setNewHotel({
      name: "",
      propertyType: "Luxury Hotel",
      starRating: "5",
      city: "Jakarta",
      country: "Indonesia",
      roomType: "Executive Deluxe Suite",
      pricePerNight: "",
    });
  };

  // Dynamic KPI Metrics
  const totalHotels = hotels.length;
  const uniqueCities = useMemo(() => {
    const citySet = new Set(hotels.map((h) => `${h.city}, ${h.country}`));
    return citySet.size;
  }, [hotels]);

  const avgPrice = useMemo(() => {
    if (totalHotels === 0) return 0;
    const sum = hotels.reduce((acc, curr) => acc + curr.pricePerNight, 0);
    return sum / totalHotels;
  }, [hotels, totalHotels]);

  return (
    <div className="space-y-4">
      {/* 1. Header & Create Action */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 uppercase tracking-wider">
            <IconBuilding className="size-3.5" />
            <span>Hospitality & Lodging Services</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Hotels & Accommodations
          </h1>
          <p className="text-xs text-slate-500">
            Manage partner luxury hotels, resorts, boutique suites, room inventories, and nightly pricing.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          className="h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold gap-1.5 shadow-sm hover:shadow-md transition-all self-start sm:self-auto cursor-pointer">
          <IconPlus className="size-4" />
          <span>New Property</span>
        </Button>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <IconBuilding className="size-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Listed Properties</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{totalHotels}</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="flex size-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
            <IconMapPin className="size-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Destinations & Cities</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{uniqueCities}</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <IconCurrencyDollar className="size-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Average Nightly Rate</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              ${avgPrice.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main Data Table */}
      <HotelDataTable
        data={hotels}
        onDeleteItem={handleDeleteHotel}
        onOpenCreate={() => setIsCreateOpen(true)}
      />

      {/* Quick Add Hotel Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Add Hotel Property
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Register a partner hotel or resort to open room bookings for travelers.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateHotel} className="space-y-3.5 mt-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Hotel Name</Label>
              <Input
                placeholder="e.g. Grand Hyatt Tokyo"
                value={newHotel.name}
                onChange={(e) =>
                  setNewHotel((prev) => ({ ...prev, name: e.target.value }))
                }
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Property Type</Label>
                <Select
                  value={newHotel.propertyType}
                  onValueChange={(val: any) =>
                    setNewHotel((prev) => ({ ...prev, propertyType: val }))
                  }>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Luxury Hotel">Luxury Hotel</SelectItem>
                    <SelectItem value="Resort & Villa">Resort & Villa</SelectItem>
                    <SelectItem value="Boutique Hotel">Boutique Hotel</SelectItem>
                    <SelectItem value="Business Hotel">Business Hotel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Star Rating</Label>
                <Select
                  value={newHotel.starRating}
                  onValueChange={(val) =>
                    setNewHotel((prev) => ({ ...prev, starRating: val }))
                  }>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">City</Label>
                <Input
                  placeholder="e.g. Tokyo"
                  value={newHotel.city}
                  onChange={(e) =>
                    setNewHotel((prev) => ({ ...prev, city: e.target.value }))
                  }
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Country</Label>
                <Input
                  placeholder="e.g. Japan"
                  value={newHotel.country}
                  onChange={(e) =>
                    setNewHotel((prev) => ({ ...prev, country: e.target.value }))
                  }
                  className="h-9 text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Primary Room Type</Label>
                <Input
                  placeholder="e.g. Deluxe King Suite"
                  value={newHotel.roomType}
                  onChange={(e) =>
                    setNewHotel((prev) => ({ ...prev, roomType: e.target.value }))
                  }
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Price / Night (USD)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 290"
                  value={newHotel.pricePerNight}
                  onChange={(e) =>
                    setNewHotel((prev) => ({ ...prev, pricePerNight: e.target.value }))
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
                Create Property
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
