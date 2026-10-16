import { generateMeta } from "@/lib/utils";
import EditAttractionView from "@/modules/Services/EntertainmentAttractions/EditAttractionView";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "Edit Attraction",
    description: "Update attraction details, pricing, media, and inclusions.",
  });
}

export default function EditAttractionPage() {
  return <EditAttractionView />;
}
