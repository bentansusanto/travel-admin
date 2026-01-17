"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { HookRegister } from "./hooks";

export const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const handleShowPassword = () => setShowPassword(!showPassword);
  const { formik } = HookRegister();

  return (
    <form onSubmit={formik.handleSubmit} className="mt-8 space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="sr-only">
            Name
          </Label>
          <Input
            id="name"
            type="text"
            required
            className="w-full"
            placeholder="Name"
            {...formik.getFieldProps("name")}
          />
          {formik.touched.name && formik.errors.name && (
            <p className="mt-1 text-xs text-red-500">{formik.errors.name}</p>
          )}
        </div>
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
        <div>
          <Label htmlFor="password" className="sr-only">
            Password
          </Label>
          <div className="flex items-center gap-3 rounded-md border border-gray-300 pr-3">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              className="w-full border-none focus-visible:ring-0"
              placeholder="Password"
              {...formik.getFieldProps("password")}
            />
            <div className="cursor-pointer text-gray-500" onClick={handleShowPassword}>
              {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </div>
          </div>
          {formik.touched.password && formik.errors.password && (
            <p className="mt-1 text-xs text-red-500">{formik.errors.password}</p>
          )}
        </div>
      </div>
      <div>
        <Button
          type="submit"
          disabled={formik.isSubmitting}
          className={`${formik.isSubmitting ? "cursor-not-allowed" : "cursor-pointer"} w-full bg-orange-500 font-semibold text-white hover:bg-orange-600`}>
          {formik.isSubmitting ? "Loading..." : "Register Now"}
        </Button>
      </div>
    </form>
  );
};
