"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { HooksVerifyAccount } from "./hooks";

export const VerifyAccountPage = () => {
  const { status, handleVerify, isResending, handleResend, resendStatus, verifyToken } =
    HooksVerifyAccount();

  useEffect(() => {
    handleVerify();
  }, [handleVerify]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          {status.type === "loading" && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-orange-500"></div>
              <h2 className="text-2xl font-bold text-gray-900">Verifying Account...</h2>
              <p className="text-sm text-gray-600">Please wait while we verify your account.</p>
            </div>
          )}

          {status.type === "success" && (
            <div className="flex flex-col items-center justify-center space-y-6">
              <Image
                src="/images/email-verification-successful.svg"
                alt="Verification Successful"
                width={500}
                height={500}
                className="mx-auto"
              />
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-gray-900">Verification Successful!</h2>
                <p className="px-4 text-sm text-gray-600">
                  Your account has been successfully verified. You can now log in to access the
                  dashboard.
                </p>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-md bg-orange-600 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:outline-none">
                Login
              </Link>
            </div>
          )}

          {status.type === "error" && (
            <div className="flex flex-col items-center justify-center space-y-6">
              <Image
                src="/images/error-data.svg"
                alt="Verification Failed"
                width={500}
                height={500}
                className="mx-auto"
              />
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-gray-900">Verification Failed</h2>
                <p className="px-4 text-sm text-gray-600">
                  {status.message || "The verification link may be invalid or expired."}
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <button
                  onClick={handleResend}
                  disabled={isResending}
                  className={`text-sm font-medium text-orange-600 hover:text-orange-500 disabled:opacity-50 ${isResending ? "cursor-not-allowed" : "cursor-pointer"}`}
                >
                  {isResending ? "Resending..." : "Resend Verification Code"}
                </button>
                {resendStatus.type !== "idle" && (
                  <p
                    className={`text-xs ${
                      resendStatus.type === "success" ? "text-green-600" : "text-red-600"
                    }`}>
                    {resendStatus.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {status.type === "idle" && !verifyToken && (
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-gray-900">Verify Account</h2>
              <p className="text-sm text-gray-600">
                Missing verification token. Please check your email link.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
