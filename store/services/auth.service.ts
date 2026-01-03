import { LoginSchema } from "@/modules/Authentication/Login/schema";
import { RegisterSchema } from "@/modules/Authentication/Register/schema";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

export const authService = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    prepareHeaders: (headers) => {
      const token = Cookies.get("travel_token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    }
  }),
  endpoints: (builder) => ({
    // register user
    register: builder.mutation<RegisterSchema, RegisterSchema>({
      query: (data) => ({
        url: "/auth/register",
        method: "POST",
        body: data
      })
    }),
    // verify user
    verifyUser: builder.mutation({
      query: (data) => ({
        url: "/auth/verify-account?verify_token=" + data.token,
        method: "POST",
        body: data
      })
    }),
    // resend verify user
    resendVerifyUser: builder.mutation({
      query: (data) => ({
        url: "/auth/resend-verify",
        method: "POST",
        body: data
      })
    }),
    // login user
    login: builder.mutation<LoginSchema, LoginSchema>({
      query: (data) => ({
        url: "/auth/login",
        method: "POST",
        body: data
      })
    }),
    // logout user
    logout: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST"
      })
    }),
    // get user
    getUser: builder.query({
      query: () => ({
        url: "/auth/get-user",
        method: "GET"
      })
    }),
    // refresh token
    refreshToken: builder.mutation({
      query: () => ({
        url: "/auth/refresh-token",
        method: "POST"
      })
    }),
    // forgot password
    forgotPassword: builder.mutation({
      query: (data) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: data
      })
    }),
    // reset password
    resetPassword: builder.mutation({
      query: (data) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: data
      })
    })
  })
});

export const {
  useRegisterMutation,
  useVerifyUserMutation,
  useResendVerifyUserMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetUserQuery,
  useRefreshTokenMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation
} = authService;
