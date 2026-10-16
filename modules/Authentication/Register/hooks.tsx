"use client";

import { useRegisterMutation } from "@/store/services/auth.service";
import { useFormik } from "formik";
import { toast } from "sonner";
import { initialRegisterValues, registerSchema, RegisterSchema } from "./schema";

export const HookRegister = () => {
  const [register, { isLoading }] = useRegisterMutation();

  const formik = useFormik<RegisterSchema>({
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
      try {
        const payload: Record<string, any> = {
          name: values.name.trim(),
          email: values.email.trim().toLowerCase(),
          password: values.password
        };

        if (values.role_id && values.role_id.trim() !== "") {
          payload.role_id = values.role_id.trim();
        }

        await register(payload as any).unwrap();
        localStorage.setItem("travel_verify_email", payload.email);

        const successText =
          "Registration successful! Please check your email to verify your account.";
        toast.success(successText);
        formik.resetForm();
      } catch (err: any) {
        console.error("Registration Error:", err);
        let errorMessage =
          err?.data?.message ||
          err?.data?.Message ||
          err?.message ||
          err?.error ||
          "Registration failed. Please check your details and try again.";

        if (err?.data?.Error && Array.isArray(err.data.Error)) {
          errorMessage = err.data.Error.map((e: any) => e.body || e.message).join(", ");
        } else if (err?.data?.message && Array.isArray(err.data.message)) {
          errorMessage = err.data.message.join(", ");
        }

        toast.error(errorMessage);
      }
    }
  });

  return { formik, isLoading };
};
