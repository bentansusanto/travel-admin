"use client";

import { useResendVerifyUserMutation, useVerifyUserMutation } from "@/store/services/auth.service";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export const HooksVerifyAccount = () => {
  const searchParams = useSearchParams();
  const verifyToken = searchParams.get("verify_token");
  const [verifyUser] = useVerifyUserMutation();
  const [resendVerifyUser, { isLoading: isResending }] = useResendVerifyUserMutation();
  const [status, setStatus] = useState<{
    type: "success" | "error" | "loading" | "idle";
    message: string;
  }>({ type: "idle", message: "" });
  const [resendStatus, setResendStatus] = useState<{
    type: "success" | "error" | "idle";
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
    } catch (err: any) {
      setStatus({
        type: "error",
        message: err?.data?.message || "Verification failed. The link may be invalid or expired."
      });
    }
  }, [verifyToken, verifyUser]);

  const handleResend = async () => {
    if (!storedEmail) return;

    setResendStatus({ type: "idle", message: "" });
    try {
      await resendVerifyUser({ email: storedEmail }).unwrap();
      setResendStatus({
        type: "success",
        message: "Verification link has been resent to your email."
      });
      localStorage.removeItem("travel_verify_email");
    } catch (err: any) {
      setResendStatus({
        type: "error",
        message: err?.data?.message || "Failed to resend verification link. Please try again later."
      });
    }
  };

  return {
    status,
    resendStatus,
    handleVerify,
    handleResend,
    isResending,
    verifyToken
  };
};
