import { generateMeta } from "@/lib/utils";
import { CustomersPage } from "@/modules/Customers/CustomersPage";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "Customers & Travelers",
    description: "Manage registered customer accounts, profiles, and traveler records.",
  });
}

export default function Customers() {
  return <CustomersPage />;
}
