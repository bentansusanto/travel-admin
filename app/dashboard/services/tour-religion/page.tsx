import { generateMeta } from "@/lib/utils";
import { Metadata } from "next";
import TourReligionView from "./tour-religion-view";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "Tour Holiday & Religion",
    description: "Manage religious, pilgrimage, and spiritual tour packages."
  });
}

export default function TourReligionPage() {
  return <TourReligionView />;
}
