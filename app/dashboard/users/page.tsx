import { generateMeta } from "@/lib/utils";
import { Users } from "@/modules/Users";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "Users",
    description: "Manage users in the travel admin dashboard"
  });
}

export default function Page() {
  return <Users />;
}
