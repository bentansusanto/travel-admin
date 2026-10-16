"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { HooksLogin } from "./hooks";

export const LoginForm = () => {
  const { formik, isLoading } = HooksLogin();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={formik.handleSubmit} className="mt-8 space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="email" className="sr-only">
            Email address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full text-sm h-12 rounded-md bg-gray-50 border-gray-200 focus-visible:ring-primary/20 transition-all px-4"
            placeholder="Email address"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.email && formik.errors.email && (
            <p className="mt-1 text-xs text-red-500 px-4">{formik.errors.email as string}</p>
          )}
        </div>
        <div>
          <Label htmlFor="password" className="sr-only">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              className="w-full text-sm h-12 rounded-md bg-gray-50 border-gray-200 focus-visible:ring-primary/20 transition-all px-4 pr-12"
              placeholder="Password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {formik.touched.password && formik.errors.password && (
            <p className="mt-1 text-xs text-red-500 px-4">{formik.errors.password as string}</p>
          )}
        </div>
        <div className="text-end">
          <Link
            href="/forgot-password"
            className="ml-auto inline-block text-sm font-semibold text-gray-600 hover:text-blue-600 hover:underline transition-colors">
            Forgot your password?
          </Link>
        </div>
      </div>
      <div>
        <Button
          type="submit"
          className="w-full h-10 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm hover:shadow-md"
          disabled={isLoading || !formik.isValid || !formik.dirty}>
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </div>
    </form>
  );
};
