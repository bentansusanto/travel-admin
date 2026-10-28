export interface BusRouteItem {
  id: string;
  operator: string;
  busNumber: string;
  busType: "Executive Class" | "Sleeper Bus / Suites" | "VIP Airport Shuttle" | "Super Executive";
  originCity: string;
  originTerminal: string;
  destinationCity: string;
  destinationTerminal: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  seatCapacity: number;
  availableSeats: number;
  amenities: string[];
  price: number;
  status: "Active" | "Full" | "Scheduled";
}
