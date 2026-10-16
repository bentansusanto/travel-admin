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
            className="w-full text-sm h-12 rounded-md bg-gray-50 border-gray-200 focus-visible:ring-primary/20 transition-all px-4"
            placeholder="Email address"
            {...formik.getFieldProps("email")}
          />
          {formik.touched.email && formik.errors.email && (
            <p className="mt-1 text-xs text-red-500 px-4">{formik.errors.email}</p>
          )}
        </div>
      </div>

      <div>
        <Button
          type="submit"
          disabled={isLoading || !formik.isValid || !formik.dirty}
          className="w-full h-10 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm hover:shadow-md">
          {isLoading ? "Sending..." : "Send Reset Link"}
        </Button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-center text-sm text-gray-600">
          Remember your password?{" "}
          <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </form>
  );
};
