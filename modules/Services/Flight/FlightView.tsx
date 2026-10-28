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
  IconArmchair,
  IconCurrencyDollar,
  IconPlane,
  IconPlaneDeparture,
  IconPlus,
  IconRoute,
} from "@tabler/icons-react";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import FlightDataTable from "./DataTable";
import { FlightItem } from "./types";

const INITIAL_FLIGHTS: FlightItem[] = [];

export default function FlightView() {
  const [flights, setFlights] = useState<FlightItem[]>(INITIAL_FLIGHTS);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form state for creating a new flight
  const [newFlight, setNewFlight] = useState({
    airline: "Garuda Indonesia",
    airlineCode: "GA",
    flightNumber: "",
    originCity: "Jakarta",
    originCode: "CGK",
    destinationCity: "",
    destinationCode: "",
    departureTime: "09:00",
    arrivalTime: "15:00",
    duration: "6h 00m",
    cabinClass: "Economy" as FlightItem["cabinClass"],
    aircraft: "Boeing 737-800",
    baggage: "25 kg",
    price: "",
    availableSeats: "30",
  });

  const handleDeleteFlight = (id: string) => {
    setFlights((prev) => prev.filter((f) => f.id !== id));
  };

  const handleCreateFlight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlight.flightNumber || !newFlight.destinationCode || !newFlight.price) {
      toast.error("Please fill in flight number, destination code, and fare");
      return;
    }

    const created: FlightItem = {
      id: `fl-${Date.now()}`,
      airline: newFlight.airline,
      flightNumber: newFlight.flightNumber.toUpperCase(),
      airlineCode: newFlight.airlineCode,
      logo: "",
      originCity: newFlight.originCity,
      originAirport: "International Airport",
      originCode: newFlight.originCode.toUpperCase(),
      destinationCity: newFlight.destinationCity || newFlight.destinationCode.toUpperCase(),
      destinationAirport: "International Airport",
      destinationCode: newFlight.destinationCode.toUpperCase(),
      departureTime: newFlight.departureTime,
      arrivalTime: newFlight.arrivalTime,
      duration: newFlight.duration,
      transitType: "Direct",
      cabinClass: newFlight.cabinClass,
      aircraft: newFlight.aircraft,
      baggage: newFlight.baggage,
      price: Number(newFlight.price) || 250,
      availableSeats: Number(newFlight.availableSeats) || 20,
      status: "Active",
    };

    setFlights((prev) => [created, ...prev]);
    toast.success(`Flight ${created.flightNumber} scheduled successfully`);
    setIsCreateOpen(false);
    setNewFlight({
      airline: "Garuda Indonesia",
      airlineCode: "GA",
      flightNumber: "",
      originCity: "Jakarta",
      originCode: "CGK",
      destinationCity: "",
      destinationCode: "",
      departureTime: "09:00",
      arrivalTime: "15:00",
      duration: "6h 00m",
      cabinClass: "Economy",
      aircraft: "Boeing 737-800",
      baggage: "25 kg",
      price: "",
      availableSeats: "30",
    });
  };

  // Dynamic KPI Metrics
  const totalFlights = flights.length;
  const uniqueRoutes = useMemo(() => {
    const routeSet = new Set(flights.map((f) => `${f.originCode}-${f.destinationCode}`));
    return routeSet.size;
  }, [flights]);

  const avgFare = useMemo(() => {
    if (totalFlights === 0) return 0;
    const sum = flights.reduce((acc, curr) => acc + curr.price, 0);
    return sum / totalFlights;
  }, [flights, totalFlights]);

  return (
    <div className="space-y-4">
      {/* 1. Header & Create Action */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 uppercase tracking-wider">
            <IconPlane className="size-3.5" />
            <span>Aviation & Airline Ticketing</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Flight Schedules & Inventory
          </h1>
          <p className="text-xs text-slate-500">
            Manage international and domestic flight routes, seat allotments, cabin classes, and airfare tariffs.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          className="h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold gap-1.5 shadow-sm hover:shadow-md transition-all self-start sm:self-auto cursor-pointer">
          <IconPlus className="size-4" />
          <span>New Flight</span>
        </Button>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <IconPlaneDeparture className="size-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Scheduled Flights</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{totalFlights}</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="flex size-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
            <IconRoute className="size-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Active Air Routes</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{uniqueRoutes}</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <IconCurrencyDollar className="size-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Average Airfare</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              ${avgFare.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main Data Table */}
      <FlightDataTable
        data={flights}
        onDeleteItem={handleDeleteFlight}
        onOpenCreate={() => setIsCreateOpen(true)}
      />

      {/* Quick Add Flight Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Schedule New Flight
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Enter flight route details, carrier info, and fare pricing to add to the inventory.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateFlight} className="space-y-3.5 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Airline</Label>
                <Select
                  value={newFlight.airline}
                  onValueChange={(val) => {
                    const codeMap: Record<string, string> = {
                      "Garuda Indonesia": "GA",
                      "Singapore Airlines": "SQ",
                      "Qatar Airways": "QR",
                      "Turkish Airlines": "TK",
                      Emirates: "EK",
                    };
                    setNewFlight((prev) => ({
                      ...prev,
                      airline: val,
                      airlineCode: codeMap[val] || "FL",
                    }));
                  }}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Garuda Indonesia">Garuda Indonesia</SelectItem>
                    <SelectItem value="Singapore Airlines">Singapore Airlines</SelectItem>
                    <SelectItem value="Qatar Airways">Qatar Airways</SelectItem>
                    <SelectItem value="Turkish Airlines">Turkish Airlines</SelectItem>
                    <SelectItem value="Emirates">Emirates</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Flight Number</Label>
                <Input
                  placeholder="e.g. GA-880"
                  value={newFlight.flightNumber}
                  onChange={(e) =>
                    setNewFlight((prev) => ({ ...prev, flightNumber: e.target.value }))
                  }
                  className="h-9 text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Origin Code</Label>
                <Input
                  placeholder="e.g. CGK"
                  value={newFlight.originCode}
                  onChange={(e) =>
                    setNewFlight((prev) => ({ ...prev, originCode: e.target.value }))
                  }
                  className="h-9 text-xs uppercase"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Destination Code</Label>
                <Input
                  placeholder="e.g. HND / SIN"
                  value={newFlight.destinationCode}
                  onChange={(e) =>
                    setNewFlight((prev) => ({ ...prev, destinationCode: e.target.value }))
                  }
                  className="h-9 text-xs uppercase"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Cabin Class</Label>
                <Select
                  value={newFlight.cabinClass}
                  onValueChange={(val: any) =>
                    setNewFlight((prev) => ({ ...prev, cabinClass: val }))
                  }>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Economy">Economy</SelectItem>
                    <SelectItem value="Premium Economy">Premium Economy</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="First Class">First Class</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Fare (USD)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 350"
                  value={newFlight.price}
                  onChange={(e) =>
                    setNewFlight((prev) => ({ ...prev, price: e.target.value }))
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
                Create Flight
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
