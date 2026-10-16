import { generateMeta } from "@/lib/utils";
import { VerifyAccountPage } from "@/modules/Authentication/Verify Account/VerifyAccountPage";
import { Metadata } from "next";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "Verify Account - Pacific Travelindo",
    description: "Verify your admin account email address."
  });
}

export default function VerifyAccount() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      }>
      <VerifyAccountPage />
    </Suspense>
  );
}
