export interface FlightItem {
  id: string;
  airline: string;
  flightNumber: string;
  airlineCode: string;
  logo: string;
  originCity: string;
  originAirport: string;
  originCode: string;
  destinationCity: string;
  destinationAirport: string;
  destinationCode: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  transitType: "Direct" | "1 Stop" | "2 Stops";
  cabinClass: "Economy" | "Premium Economy" | "Business" | "First Class";
  aircraft: string;
  baggage: string;
  price: number;
  availableSeats: number;
  status: "Active" | "Delayed" | "Scheduled";
}
