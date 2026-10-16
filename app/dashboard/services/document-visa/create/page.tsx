import { generateMeta } from "@/lib/utils";
import VisaForm from "@/modules/Services/DocumentVisa/VisaForm";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "Create Visa Service",
    description: "Add a new visa assistance and document processing package.",
  });
}

export default function CreateVisaPage() {
  return <VisaForm />;
}
