import { LoginSchema } from "@/modules/Authentication/Login/schema";
import { RegisterSchema } from "@/modules/Authentication/Register/schema";
import { baseApi } from "../api/baseApi";

export const authService = baseApi.injectEndpoints({
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
      }),
      invalidatesTags: ["User"]
    }),
    // logout user
    logout: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST"
      }),
      invalidatesTags: ["User"]
    }),
    // get user
    getUser: builder.query({
      query: () => ({
        url: "/auth/get-user",
        method: "GET"
      }),
      providesTags: ["User"]
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
