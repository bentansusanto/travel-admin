"use client";

import { useResetPasswordMutation } from "@/store/services/auth.service";
import { useFormik } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { initialResetPasswordValues, resetPasswordSchema } from "./schema";

export const HookResetPassword = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const formik = useFormik({
    initialValues: initialResetPasswordValues,
    validate: (values) => {
      const result = resetPasswordSchema.safeParse(values);
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
      if (!token) {
        toast.error("Reset token is missing.");
        return;
      }

      try {
        await resetPassword({
          password: values.password,
          reset_token: token
        }).unwrap();
        toast.success("Password has been reset successfully!");
        router.push("/login");
      } catch (err: any) {
        const errorMessage =
          err?.data?.Error?.body ||
          (Array.isArray(err?.data?.Error) ? err.data.Error[0]?.body : null) ||
          err?.data?.message ||
          err?.data?.Message ||
          err?.message ||
          "Failed to reset password. The link may be invalid or expired.";

        toast.error(errorMessage);
      }
    }
  });

  return { formik, isLoading };
};
