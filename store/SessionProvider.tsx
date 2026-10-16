"use client";

import Cookies from "js-cookie";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useRefreshTokenMutation } from "./services/auth.service";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [refreshToken] = useRefreshTokenMutation();

  useEffect(() => {
    const handleRefresh = async () => {
      const token = Cookies.get("travel_token");
      const guestPaths = [
        "/login",
        "/register",
        "/verify-account",
        "/forgot-password",
        "/reset-password"
      ];
      const isGuestPath = guestPaths.some((path) => pathname.startsWith(path));

      if (token) {
        // If on guest path with token, redirect to dashboard
        if (isGuestPath) {
          router.replace("/dashboard");
        }

        try {
          const response: any = await refreshToken({}).unwrap();
          const newToken = response?.data?.session;
          if (newToken) {
            Cookies.set("travel_token", newToken, {
              expires: 1,
              sameSite: "lax",
              path: "/"
            });
          }
        } catch (error) {
          console.error("Session refresh failed", error);
          Cookies.remove("travel_token");
          if (!isGuestPath) {
            router.replace("/login");
          }
        }
      }
    };

    handleRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
