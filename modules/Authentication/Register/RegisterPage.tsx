"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { RegisterForm } from "./RegisterForm";

export const RegisterPage = () => {
  return (
    <div className="flex pb-8 lg:h-screen lg:pb-0">
      <div className="hidden w-1/2 bg-gray-100 lg:block">
        <Image
          src="/images/bg-authentication.png"
          width={500}
          height={500}
          alt="Register visual"
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
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Register</h2>
            <p className="mt-2 text-sm text-gray-600">
              Create a new account to access the dashboard.
            </p>
          </div>

          {/* Form Register */}
          <RegisterForm />

          <div className="mt-6">
            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
