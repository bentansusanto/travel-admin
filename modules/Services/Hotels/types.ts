export interface HotelItem {
  id: string;
  name: string;
  propertyType: "Luxury Hotel" | "Resort & Villa" | "Boutique Hotel" | "Business Hotel" | "Apartment";
  starRating: number;
  city: string;
  country: string;
  address: string;
  roomType: string;
  pricePerNight: number;
  amenities: string[];
  totalRooms: number;
  availableRooms: number;
  thumbnail: string;
  status: "Active" | "Maintenance" | "Fully Booked";
}
