import { generateMeta } from "@/lib/utils";
import EditTourView from "@/modules/Services/TourReligion/EditTourView";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "Edit Tour Package",
    description: "Update and manage pilgrimage, religious, or spiritual tour package."
  });
}

export default function EditTourPage() {
  return <EditTourView />;
}
