import HealthTourismView from "@/modules/Services/HealthTourism/HealthTourismView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Health & Wellness Tourism | Pacific Travelindo",
  description: "Manage medical travel packages, executive health screenings, and wellness treatments.",
};

export default function HealthTourismPage() {
  return <HealthTourismView />;
}
