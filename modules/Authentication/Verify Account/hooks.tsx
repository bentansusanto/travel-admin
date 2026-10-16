"use client";

import { useResendVerifyUserMutation, useVerifyUserMutation } from "@/store/services/auth.service";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export interface VerifyStatus {
  type: "success" | "error" | "loading" | "idle";
  message: string;
}

export const HooksVerifyAccount = () => {
  const searchParams = useSearchParams();
  const verifyToken = searchParams.get("verify_token");
  const [verifyUser] = useVerifyUserMutation();
  const [resendVerifyUser, { isLoading: isResending }] = useResendVerifyUserMutation();
  const [status, setStatus] = useState<VerifyStatus>({
    type: verifyToken ? "loading" : "idle",
    message: verifyToken ? "Verifying your account..." : "Missing verification token. Please check your email link."
  });

  const hasRunRef = useRef(false);

  useEffect(() => {
    if (!verifyToken) {
      setStatus({
        type: "idle",
        message: "Missing verification token. Please check your email link."
      });
      return;
    }

    if (hasRunRef.current) return;
    hasRunRef.current = true;

    const executeVerify = async () => {
      setStatus({ type: "loading", message: "Verifying your account..." });
      try {
        const res: any = await verifyUser({ token: verifyToken }).unwrap();
        const successMessage =
          res?.message || "Your account has been successfully verified! You can now log in.";

        setStatus({
          type: "success",
          message: successMessage
        });
        toast.success(successMessage);
      } catch (err: any) {
        const errorBody =
          err?.data?.error?.body ||
          err?.data?.Error?.body ||
          (Array.isArray(err?.data?.Error) ? err.data.Error[0]?.body : null) ||
          (Array.isArray(err?.data?.error) ? err.data.error[0]?.body : null);

        const errorMessage =
          errorBody ||
          err?.data?.message ||
          err?.data?.Message ||
          err?.message ||
          "Verification failed. The link may be invalid or expired.";

        // Handle already verified gracefully
        if (
          typeof errorMessage === "string" &&
          errorMessage.toLowerCase().includes("already verified")
        ) {
          const verifiedMsg = "Your account is already verified! You can now log in.";
          setStatus({
            type: "success",
            message: verifiedMsg
          });
          toast.success(verifiedMsg);
          return;
        }

        setStatus({
          type: "error",
          message: errorMessage
        });
        toast.error(errorMessage);
      }
    };

    executeVerify();
  }, [verifyToken, verifyUser]);

  const handleResend = async () => {
    const email = localStorage.getItem("travel_verify_email");
    if (!email) {
      toast.error("No email found to resend verification. Please register again.");
      return;
    }

    try {
      await resendVerifyUser({ email }).unwrap();
      toast.success("Verification link has been resent to your email.");
    } catch (err: any) {
      const errorMessage =
        err?.data?.error?.body ||
        err?.data?.Error?.body ||
        (Array.isArray(err?.data?.Error) ? err.data.Error[0]?.body : null) ||
        (Array.isArray(err?.data?.error) ? err.data.error[0]?.body : null) ||
        err?.data?.message ||
        "Failed to resend verification link. Please try again later.";

      toast.error(errorMessage);
    }
  };

  return {
    status,
    handleResend,
    isResending,
    verifyToken
  };
};
