import { generateMeta } from "@/lib/utils";
import AttractionForm from "@/modules/Services/EntertainmentAttractions/AttractionForm";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "Create Attraction",
    description: "Add a new attraction, theme park, or entertainment package.",
  });
}

export default function CreateAttractionPage() {
  return <AttractionForm />;
}
