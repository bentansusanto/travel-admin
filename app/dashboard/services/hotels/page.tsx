import HotelsView from "@/modules/Services/Hotels/HotelsView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hotels & Accommodations | Pacific Travelindo",
  description: "Manage hotel partner properties, room types, and nightly pricing.",
};

export default function HotelsPage() {
  return <HotelsView />;
}
