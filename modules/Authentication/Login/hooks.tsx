"use client";
import { useLoginMutation } from "@/store/services/auth.service";
import { useFormik } from "formik";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { initialLoginValues, loginSchema } from "./schema";

export const HooksLogin = () => {
  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

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
        const response: any = await login(values).unwrap();
        console.log(response.data?.session);

        // Store token in cookie
        const token = response.data?.session;
        if (token) {
          Cookies.set("travel_token", token, { expires: 1 / 24 }); // Expires in 1 hour
        }

        setStatusMessage({
          type: "success",
          text: "Login successful"
        });
        formik.resetForm();

        router.push("/");
      } catch (error: any) {
        setStatusMessage({
          type: "error",
          text: error?.message || "Login failed. Please try again."
        });
        console.error("Login failed", error?.message);
      }
    }
  });
  return { formik, isLoading, statusMessage };
};
