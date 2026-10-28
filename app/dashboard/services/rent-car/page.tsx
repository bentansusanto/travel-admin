import RentCarView from "@/modules/Services/RentCar/RentCarView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Car Rental Fleet | Pacific Travelindo",
  description: "Manage car rental fleet, SUV and MPV specifications, and daily hire rates.",
};

export default function RentCarPage() {
  return <RentCarView />;
}
