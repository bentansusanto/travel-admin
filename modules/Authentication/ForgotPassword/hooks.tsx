"use client";

import { useForgotPasswordMutation } from "@/store/services/auth.service";
import { useFormik } from "formik";
import { toast } from "sonner";
import { forgotPasswordSchema, initialForgotPasswordValues } from "./schema";

export const HookForgotPassword = () => {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const formik = useFormik({
    initialValues: initialForgotPasswordValues,
    validate: (values) => {
      const result = forgotPasswordSchema.safeParse(values);
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
        await forgotPassword(values).unwrap();
        toast.success("Password reset link has been sent to your email!");
        formik.resetForm();
      } catch (err: any) {
        const errorMessage =
          err?.data?.Error?.body ||
          (Array.isArray(err?.data?.Error) ? err.data.Error[0]?.body : null) ||
          err?.data?.message ||
          err?.data?.Message ||
          err?.message ||
          "Failed to send reset link. Please try again later.";

        toast.error(errorMessage);
      }
    }
  });

  return { formik, isLoading };
};
