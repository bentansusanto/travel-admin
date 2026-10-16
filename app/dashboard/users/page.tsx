import { generateMeta } from "@/lib/utils";
import { Users } from "@/modules/Users";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "User Management",
    description: "Manage internal staff accounts, roles, and granular permissions."
  });
}

export default function Page() {
  return <Users />;
}
