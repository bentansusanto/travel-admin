import { generateMeta } from "@/lib/utils";
import DocumentVisaView from "@/modules/Services/DocumentVisa/DocumentVisaView";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "Document & Visa Services",
    description: "Manage global visa processing packages, embassy appointments, and document translations.",
  });
}

export default function DocumentVisaPage() {
  return <DocumentVisaView />;
}
