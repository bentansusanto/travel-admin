import RentCarView from "@/modules/Services/RentCar/RentCarView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rental Mobil & Armada | Pacific Travelindo",
  description: "Kelola armada rental mobil, spesifikasi SUV & MPV, dan tarif sewa harian.",
};

export default function RentalMobilPage() {
  return <RentCarView />;
}
