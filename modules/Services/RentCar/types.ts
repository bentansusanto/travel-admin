export interface CarRentalItem {
  id: string;
  modelName: string;
  brand: string;
  carType: "Luxury MPV" | "Family MPV" | "SUV & 4x4" | "Compact City Car" | "Executive Sedan";
  transmission: "Automatic" | "Manual";
  seats: number;
  fuelType: "Hybrid" | "Petrol" | "Diesel" | "Electric (EV)";
  dailyRate: number;
  includesDriver: boolean;
  location: string;
  thumbnail: string;
  status: "Available" | "Rented" | "Maintenance";
}
