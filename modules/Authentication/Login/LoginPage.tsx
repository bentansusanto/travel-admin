"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const LoginPage = () => {
  return (
    <div className="flex pb-8 lg:h-screen lg:pb-0">
      <div className="hidden w-1/2 bg-gray-100 lg:block">
        <Image
          src={`/images/bg-authentication.svg`}
          width={500}
          height={500}
          alt="Login visual"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex w-full items-center justify-center lg:w-1/2">
        <div className="w-full max-w-md space-y-8 px-4">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-600">Please sign in to your account</p>
          </div>
          {/* Login form */}
          <LoginForm />

          <div className="mt-2">
            <div className="text-center text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-orange-500 hover:text-orange-600">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
