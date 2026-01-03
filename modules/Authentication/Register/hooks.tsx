'use client'
import { useRegisterMutation } from "@/store/services/auth.service"
import { useFormik } from "formik"
import { initialRegisterValues, registerSchema } from "./schema"
import { useState } from "react"

export const HookRegister = () => {
  const [register, { isLoading }] = useRegisterMutation()
   const [statusMessage, setStatusMessage] = useState<{
      type: "success" | "error";
      text: string;
    } | null>(null);

  const formik = useFormik({
    initialValues: initialRegisterValues,
    validate: (values) => {
      const result = registerSchema.safeParse(values);
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
      setStatusMessage(null); // Clear previous message
      try {
        await register(values).unwrap();
        localStorage.setItem("medisuite_verify_email", values.email);
        setStatusMessage({
          type: "success",
          text: "Registration successful! Check your email for verification."
        });
        formik.resetForm();
      } catch (err: any) {
        setStatusMessage({
          type: "error",
          text: err?.data?.message || "Registration failed. Please try again."
        });
        console.error("Registration failed", err);
      }
    }
  })
  return { formik, isLoading, statusMessage }
}
