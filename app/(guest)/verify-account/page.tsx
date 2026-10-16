import { generateMeta } from "@/lib/utils";
import { VerifyAccountPage } from "@/modules/Authentication/Verify Account/VerifyAccountPage";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "Verify Account - Pacific Travelindo",
    description: "Verify your admin account email address."
  });
}

export default function VerifyAccount() {
  return <VerifyAccountPage />;
}
