import { ResetPasswordPage } from "@/modules/Authentication/ResetPassword";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      }>
      <ResetPasswordPage />
    </Suspense>
  );
}
