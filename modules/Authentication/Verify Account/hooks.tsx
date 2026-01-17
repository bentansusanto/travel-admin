"use client";

import { useResendVerifyUserMutation, useVerifyUserMutation } from "@/store/services/auth.service";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export const HooksVerifyAccount = () => {
  const searchParams = useSearchParams();
  const verifyToken = searchParams.get("verify_token");
  const [verifyUser] = useVerifyUserMutation();
  const [resendVerifyUser, { isLoading: isResending }] = useResendVerifyUserMutation();
  const [status, setStatus] = useState<{
    type: "success" | "error" | "loading" | "idle";
    message: string;
  }>({ type: "idle", message: "" });

  const [storedEmail, setStoredEmail] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setStoredEmail(localStorage.getItem("travel_verify_email"));
    }
  }, []);

  const handleVerify = useCallback(async () => {
    if (!verifyToken) {
      setStatus({
        type: "error",
        message: "Verification code is missing."
      });
      return;
    }

    setStatus({ type: "loading", message: "Verifying your account..." });

    try {
      await verifyUser({ token: verifyToken }).unwrap();
      setStatus({
        type: "success",
        message: "Your account has been successfully verified! You can now log in."
      });
      toast.success("Account verified successfully!");
    } catch (err: any) {
      const errorMessage =
        err?.data?.Error?.body ||
        (Array.isArray(err?.data?.Error) ? err.data.Error[0]?.body : null) ||
        err?.data?.message ||
        err?.data?.Message ||
        err?.message ||
        "Verification failed. The link may be invalid or expired.";

      setStatus({
        type: "error",
        message: errorMessage
      });
      toast.error(errorMessage);
    }
  }, [verifyToken, verifyUser]);

  const handleResend = async () => {
    if (!storedEmail) {
      toast.error("No email found to resend verification. Please register again.");
      return;
    }

    try {
      await resendVerifyUser({ email: storedEmail }).unwrap();
      toast.success("Verification link has been resent to your email.");
      // Optional: keep email in case they need to resend again, or remove it
      // localStorage.removeItem("medisuite_verify_email");
    } catch (err: any) {
      const errorMessage =
        err?.data?.Error?.body ||
        (Array.isArray(err?.data?.Error) ? err.data.Error[0]?.body : null) ||
        err?.data?.message ||
        err?.data?.Message ||
        err?.message ||
        "Failed to resend verification link. Please try again later.";

      toast.error(errorMessage);
    }
  };

  return {
    status,
    handleVerify,
    handleResend,
    isResending,
    verifyToken
  };
};
