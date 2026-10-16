"use client";

import Image from "next/image";
import { ResetPasswordForm } from "./ResetPasswordForm";

export const ResetPasswordPage = () => {
  return (
    <div className="flex pb-8 lg:h-screen lg:pb-0">
      <div className="hidden w-1/2 bg-gray-100 lg:block">
        <Image
          src="/images/bg-authentication.png"
          width={500}
          height={500}
          alt="Reset password visual"
          className="h-full w-full object-cover"
          priority
        />
      </div>

      <div className="flex min-h-screen w-full items-center justify-center lg:min-h-0 lg:w-1/2">
        <div className="w-full max-w-md space-y-8 px-4">
          <div className="text-center">
            <div className="mb-6 flex justify-center lg:hidden">
              <Image
                src="/images/logo-pacific-travelindo.svg"
                width={80}
                height={80}
                alt="Pacific Travelindo Logo"
                priority
              />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Reset Password</h2>
            <p className="mt-2 text-sm text-gray-600">Enter your new password below.</p>
          </div>
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
};
