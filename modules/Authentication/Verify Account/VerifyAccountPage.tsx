"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { HooksVerifyAccount } from "./hooks";

export const VerifyAccountPage = () => {
  const { status, handleResend, isResending, verifyToken } = HooksVerifyAccount();

  return (
    <div className="flex pb-8 lg:h-screen lg:pb-0">
      {/* Left Visual Column */}
      <div className="hidden w-1/2 bg-gray-100 lg:block">
        <Image
          src="/images/bg-authentication.png"
          width={500}
          height={500}
          alt="Verification visual"
          className="h-full w-full object-cover"
          priority
        />
      </div>

      {/* Right Content Column */}
      <div className="flex min-h-screen w-full items-center justify-center lg:min-h-0 lg:w-1/2">
        <div className="w-full max-w-md space-y-8 px-4 text-center">
          {/* Mobile Header Logo */}
          <div className="mb-6 flex justify-center lg:hidden">
            <Image
              src="/images/logo-pacific-travelindo.svg"
              width={80}
              height={80}
              alt="Pacific Travelindo Logo"
              priority
            />
          </div>

          {/* 1. Loading State */}
          {status.type === "loading" && (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <div className="h-12 w-12 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
              <h2 className="text-3xl font-bold text-gray-900">Verifying Account...</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Please wait a moment while we authenticate and verify your account credentials.
              </p>
            </div>
          )}

          {/* 2. Success State */}
          {status.type === "success" && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-gray-900">Verification Successful!</h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Your account has been successfully verified. You now have full access to the
                  administration dashboard to manage tours, fleet bookings, and customer orders.
                </p>
              </div>
              <Button
                asChild
                className="w-full h-10 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm hover:shadow-md">
                <Link href="/login">Go to Login</Link>
              </Button>
            </div>
          )}

          {/* 3. Error State */}
          {status.type === "error" && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-gray-900">Verification Failed</h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {status.message ||
                    "We were unable to verify your account with this token. The verification link may have expired or is invalid. Please request a new verification link below."}
                </p>
              </div>
              <div className="flex w-full flex-col items-center space-y-4 pt-2">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">
                  {isResending ? "Resending..." : "Resend Verification Code"}
                </button>
                <p className="text-sm text-gray-600">
                  Back to{" "}
                  <Link href="/login" className="text-blue-600 font-semibold hover:underline">
                    Log in
                  </Link>
                </p>
              </div>
            </div>
          )}

          {/* 4. Missing Token / Idle State */}
          {status.type === "idle" && !verifyToken && (
            <div className="space-y-6 py-6">
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-gray-900">Verify Account</h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  The verification token is missing or incomplete. Please ensure you clicked the
                  full link sent to your registered email address.
                </p>
              </div>
              <Button
                asChild
                className="w-full h-10 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm hover:shadow-md">
                <Link href="/login">Back to Login</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
