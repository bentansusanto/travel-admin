import { generateMeta } from "@/lib/utils";
import TourForm from "@/modules/Services/TourReligion/TourForm";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "Create Tour Package",
    description: "Add a new religious, pilgrimage, or spiritual tour package."
  });
}

export default function CreateTourPage() {
  return <TourForm isEdit={false} />;
}
