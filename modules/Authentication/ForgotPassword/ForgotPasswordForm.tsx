"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { HookForgotPassword } from "./hooks";

export const ForgotPasswordForm = () => {
  const { formik, isLoading } = HookForgotPassword();

  return (
    <form onSubmit={formik.handleSubmit} className="mt-8 space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="email" className="sr-only">
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            className="w-full"
            placeholder="Email address"
            {...formik.getFieldProps("email")}
          />
          {formik.touched.email && formik.errors.email && (
            <p className="mt-1 text-xs text-red-500">{formik.errors.email}</p>
          )}
        </div>
      </div>

      <div>
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-orange-500 font-semibold text-white hover:bg-orange-600">
          {isLoading ? "Sending..." : "Send Reset Link"}
        </Button>
      </div>

      <div className="text-center">
        <Link href="/login" className="text-sm font-medium text-orange-600 hover:text-orange-500">
          Back to Login
        </Link>
      </div>
    </form>
  );
};
