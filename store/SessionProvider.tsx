"use client";

import Cookies from "js-cookie";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useRefreshTokenMutation } from "./services/auth.service";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [refreshToken] = useRefreshTokenMutation();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const handleRefresh = async () => {
      const token = Cookies.get("travel_token");
      const guestPaths = ["/login", "/register", "/verify-account"];
      const isGuestPath = guestPaths.some((path) => pathname.startsWith(path));

      if (token) {
        // If on guest path with token, force redirect to dashboard
        if (isGuestPath) {
          router.replace("/dashboard");
        }

        try {
          const response: any = await refreshToken({}).unwrap();
          const newToken = response?.data?.session;
          if (newToken) {
            Cookies.set("travel_token", newToken, { expires: 1 / 24 }); // Refresh and set for 1 hour
          }
        } catch (error) {
          console.error("Session refresh failed", error);
          Cookies.remove("travel_token");
          if (!isGuestPath) {
            router.replace("/login");
          }
        }
      }
      setIsInitializing(false);
    };

    handleRefresh();
    // Only run on mount to handle initial session state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToken]);

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}
