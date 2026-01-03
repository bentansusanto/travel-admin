"use client";
import Image from "next/image";
import { RegisterForm } from "./RegisterForm";

export const RegisterPage = () => {
  return (
    <div className="flex pb-8 lg:h-screen lg:pb-0">
      <div className="hidden w-1/2 bg-gray-100 lg:block">
        <Image src={`/images/bg-authentication.svg`} width={1000} height={1000} alt="Login visual" className="h-full w-full object-cover" />
      </div>

      <div className="flex w-full items-center justify-center lg:w-1/2">
        <div className="w-full max-w-md space-y-8 px-4">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Register</h2>
            <p className="mt-2 text-sm text-gray-600">
              Create a new account to access the dashboard.
            </p>
          </div>
          {/* Form Register */}
          <RegisterForm />

          <div className="mt-3">
            <p className="text-center text-sm text-gray-400">
              Already have an account?{" "}
              <a href="/login" className="text-orange-500 font-semibold hover:underline">
                Log in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
