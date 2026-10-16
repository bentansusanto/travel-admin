import { generateMeta } from "@/lib/utils";
import EntertainmentAttractionsView from "@/modules/Services/EntertainmentAttractions/EntertainmentAttractionsView";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "Entertainment & Attractions",
    description: "Manage attraction tickets, theme parks, cultural excursions, and entertainment activities.",
  });
}

export default function EntertainmentAttractionsPage() {
  return <EntertainmentAttractionsView />;
}
