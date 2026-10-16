import { generateMeta } from "@/lib/utils";
import EditVisaView from "@/modules/Services/DocumentVisa/EditVisaView";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "Edit Visa Service",
    description: "Update visa service details, requirements, pricing, and guidelines.",
  });
}

export default function EditVisaPage() {
  return <EditVisaView />;
}
