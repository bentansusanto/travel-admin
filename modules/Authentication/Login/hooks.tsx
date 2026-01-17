"use client";
import { useLoginMutation } from "@/store/services/auth.service";
import { useFormik } from "formik";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { initialLoginValues, loginSchema } from "./schema";

export const HooksLogin = () => {
  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();

  const formik = useFormik({
    initialValues: initialLoginValues,
    validate: (values) => {
      const result = loginSchema.safeParse(values);
      if (!result.success) {
        const errors: Record<string, string> = {};
        result.error.issues.forEach((issue) => {
          if (issue.path[0]) {
            errors[issue.path[0] as string] = issue.message;
          }
        });
        return errors;
      }
      return {};
    },
    onSubmit: async (values) => {
      try {
        const response: any = await login({ ...values, site: "admin" }).unwrap();

        // Store token in cookie
        const token = response.data?.session;
        if (token) {
          Cookies.set("travel_token", token, {
            expires: 1,
            sameSite: "lax",
            path: "/"
          });
        }

        toast.success("Login successful! Redirecting...");
        formik.resetForm();

        // Redirect to home or dashboard
        setTimeout(() => {
          router.push("/");
        }, 1000);
      } catch (error: any) {
        const errorMessage =
          error?.data?.Error?.body ||
          (Array.isArray(error?.data?.Error) ? error.data.Error[0]?.body : null) ||
          error?.data?.message ||
          error?.data?.Message ||
          error?.message ||
          error?.error ||
          "Login failed. Please check your credentials.";

        toast.error(errorMessage);
      }
    }
  });
  return { formik, isLoading };
};
