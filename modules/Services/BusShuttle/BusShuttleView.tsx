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
  IconBus,
  IconCurrencyDollar,
  IconPlus,
  IconRoute,
} from "@tabler/icons-react";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import BusShuttleDataTable from "./DataTable";
import { BusRouteItem } from "./types";

const INITIAL_ROUTES: BusRouteItem[] = [];

export default function BusShuttleView() {
  const [routes, setRoutes] = useState<BusRouteItem[]>(INITIAL_ROUTES);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form state for creating a new bus route
  const [newRoute, setNewRoute] = useState({
    operator: "Sinar Jaya Executive",
    busNumber: "",
    busType: "Executive Class" as BusRouteItem["busType"],
    originCity: "Jakarta",
    originTerminal: "Pulo Gebang",
    destinationCity: "",
    destinationTerminal: "",
    departureTime: "08:00",
    arrivalTime: "16:00",
    duration: "8h 00m",
    price: "",
    seatCapacity: "28",
  });

  const handleDeleteRoute = (id: string) => {
    setRoutes((prev) => prev.filter((r) => r.id !== id));
  };

  const handleCreateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoute.busNumber || !newRoute.destinationCity || !newRoute.price) {
      toast.error("Please fill in bus number, destination city, and fare");
      return;
    }

    const created: BusRouteItem = {
      id: `br-${Date.now()}`,
      operator: newRoute.operator,
      busNumber: newRoute.busNumber.toUpperCase(),
      busType: newRoute.busType,
      originCity: newRoute.originCity,
      originTerminal: newRoute.originTerminal,
      destinationCity: newRoute.destinationCity,
      destinationTerminal: newRoute.destinationTerminal || `${newRoute.destinationCity} Main Terminal`,
      departureTime: newRoute.departureTime,
      arrivalTime: newRoute.arrivalTime,
      duration: newRoute.duration,
      seatCapacity: Number(newRoute.seatCapacity) || 28,
      availableSeats: Number(newRoute.seatCapacity) || 28,
      amenities: ["AC & USB Charger", "Reclining Seat", "Mineral Water"],
      price: Number(newRoute.price) || 20,
      status: "Active",
    };

    setRoutes((prev) => [created, ...prev]);
    toast.success(`Bus route ${created.busNumber} added successfully`);
    setIsCreateOpen(false);
    setNewRoute({
      operator: "Sinar Jaya Executive",
      busNumber: "",
      busType: "Executive Class",
      originCity: "Jakarta",
      originTerminal: "Pulo Gebang",
      destinationCity: "",
      destinationTerminal: "",
      departureTime: "08:00",
      arrivalTime: "16:00",
      duration: "8h 00m",
      price: "",
      seatCapacity: "28",
    });
  };

  // Dynamic KPI Metrics
  const totalRoutes = routes.length;
  const uniqueOperators = useMemo(() => {
    const set = new Set(routes.map((r) => r.operator));
    return set.size;
  }, [routes]);

  const avgFare = useMemo(() => {
    if (totalRoutes === 0) return 0;
    const sum = routes.reduce((acc, curr) => acc + curr.price, 0);
    return sum / totalRoutes;
  }, [routes, totalRoutes]);

  return (
    <div className="space-y-4">
      {/* 1. Header & Create Action */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 uppercase tracking-wider">
            <IconBus className="size-3.5" />
            <span>Intercity Transit & Ground Transport</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Bus & Shuttle Schedules
          </h1>
          <p className="text-xs text-slate-500">
            Manage intercity bus routes, VIP executive shuttles, terminal connections, seat manifests, and ticketing.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          className="h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold gap-1.5 shadow-sm hover:shadow-md transition-all self-start sm:self-auto cursor-pointer">
          <IconPlus className="size-4" />
          <span>New Route</span>
        </Button>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <IconBus className="size-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Active Transit Routes</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{totalRoutes}</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="flex size-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
            <IconRoute className="size-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Fleet Operators</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{uniqueOperators}</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <IconCurrencyDollar className="size-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Average Ticket Fare</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              ${avgFare.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main Data Table */}
      <BusShuttleDataTable
        data={routes}
        onDeleteItem={handleDeleteRoute}
        onOpenCreate={() => setIsCreateOpen(true)}
      />

      {/* Quick Add Bus Route Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Schedule Bus Route
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Register a bus transit route, operator, and fare pricing to the booking network.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateRoute} className="space-y-3.5 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Fleet Operator</Label>
                <Input
                  placeholder="e.g. Sinar Jaya"
                  value={newRoute.operator}
                  onChange={(e) =>
                    setNewRoute((prev) => ({ ...prev, operator: e.target.value }))
                  }
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Bus / Trip Number</Label>
                <Input
                  placeholder="e.g. SJ-805"
                  value={newRoute.busNumber}
                  onChange={(e) =>
                    setNewRoute((prev) => ({ ...prev, busNumber: e.target.value }))
                  }
                  className="h-9 text-xs uppercase"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Origin City</Label>
                <Input
                  placeholder="e.g. Jakarta"
                  value={newRoute.originCity}
                  onChange={(e) =>
                    setNewRoute((prev) => ({ ...prev, originCity: e.target.value }))
                  }
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Destination City</Label>
                <Input
                  placeholder="e.g. Bandung / Surabaya"
                  value={newRoute.destinationCity}
                  onChange={(e) =>
                    setNewRoute((prev) => ({ ...prev, destinationCity: e.target.value }))
                  }
                  className="h-9 text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Bus Class</Label>
                <Select
                  value={newRoute.busType}
                  onValueChange={(val: any) =>
                    setNewRoute((prev) => ({ ...prev, busType: val }))
                  }>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Executive Class">Executive Class</SelectItem>
                    <SelectItem value="Sleeper Bus / Suites">Sleeper Bus / Suites</SelectItem>
                    <SelectItem value="VIP Airport Shuttle">VIP Airport Shuttle</SelectItem>
                    <SelectItem value="Super Executive">Super Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Fare (USD)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 25"
                  value={newRoute.price}
                  onChange={(e) =>
                    setNewRoute((prev) => ({ ...prev, price: e.target.value }))
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
                Create Route
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
