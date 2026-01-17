import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { HooksLogin } from "./hooks";

export const LoginForm = () => {
  const { formik, isLoading } = HooksLogin();
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
          {formik.errors.email && (
            <p className="mt-1 text-sm text-red-500">{formik.errors.email}</p>
          )}
        </div>
        <div>
          <Label htmlFor="password" className="sr-only">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full"
            placeholder="Password"
            {...formik.getFieldProps("password")}
          />
          {formik.errors.password && (
            <p className="mt-1 text-sm text-red-500">{formik.errors.password}</p>
          )}
        </div>
        <div className="text-end">
          <Link href="/forgot-password" className="ml-auto inline-block text-sm underline">
            Forgot your password?
          </Link>
        </div>
      </div>
      <div>
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-orange-500 text-white hover:bg-orange-600">
          {isLoading ? "Loading..." : "Sign in"}
        </Button>
      </div>
    </form>
  );
};
