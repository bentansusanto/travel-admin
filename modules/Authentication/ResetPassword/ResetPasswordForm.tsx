"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { HookResetPassword } from "./hooks";

export const ResetPasswordForm = () => {
  const { formik, isLoading } = HookResetPassword();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <form onSubmit={formik.handleSubmit} className="mt-8 space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="password" className="sr-only">
            New Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              className="w-full text-sm h-12 rounded-md bg-gray-50 border-gray-200 focus-visible:ring-primary/20 transition-all px-4 pr-12"
              placeholder="New Password"
              {...formik.getFieldProps("password")}
            />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
              onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {formik.touched.password && formik.errors.password && (
            <p className="mt-1 text-xs text-red-500 px-4">{formik.errors.password}</p>
          )}
        </div>

        <div>
          <Label htmlFor="confirmPassword" className="sr-only">
            Confirm Password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              required
              className="w-full text-sm h-12 rounded-md bg-gray-50 border-gray-200 focus-visible:ring-primary/20 transition-all px-4 pr-12"
              placeholder="Confirm Password"
              {...formik.getFieldProps("confirmPassword")}
            />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-500 px-4">{formik.errors.confirmPassword}</p>
          )}
        </div>
      </div>

      <div>
        <Button
          type="submit"
          disabled={isLoading || !formik.isValid || !formik.dirty}
          className="w-full h-10 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm hover:shadow-md">
          {isLoading ? "Resetting..." : "Reset Password"}
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
