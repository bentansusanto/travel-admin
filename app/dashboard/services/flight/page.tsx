import FlightView from "@/modules/Services/Flight/FlightView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flight Schedules & Inventory | Pacific Travelindo",
  description: "Manage airline routes, cabin classes, and flight ticket pricing.",
};

export default function FlightPage() {
  return <FlightView />;
}
