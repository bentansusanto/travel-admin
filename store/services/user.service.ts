import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

export const usersService = createApi({
  reducerPath: "usersService",
  tagTypes: ["Users"],
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    prepareHeaders: (headers) => {
      const token = Cookies.get("travel_token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
    credentials: "include"
  }),
  endpoints: (builder) => ({
    // create new user
    createUser: builder.mutation({
      query: (data) => ({
        url: "/users/create",
        method: "POST",
        body: data
      }),
      invalidatesTags: ["Users"]
    }),

    // find all users
    findAllUsers: builder.query({
      query: () => ({
        url: "/users/find-all",
        method: "GET"
      }),
      providesTags: ["Users"]
    }),

    // find user by id
    findUserById: builder.query({
      query: (id) => ({
        url: `/users/${id}`,
        method: "GET"
      }),
      providesTags: ["Users"]
    }),

    // update user
    updateUser: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/users/update/${id}`,
        method: "PUT",
        body: data
      }),
      invalidatesTags: ["Users"]
    }),

    // delete user
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/delete/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Users"]
    })
  })
});

export const {
  useCreateUserMutation,
  useFindAllUsersQuery,
  useFindUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation
} = usersService;
