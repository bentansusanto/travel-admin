import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

export const rolesService = createApi({
  reducerPath: "rolesService",
  tagTypes: ["Roles"],
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
    // find all roles
    findAllRoles: builder.query({
      query: () => ({
        url: "/roles",
        method: "GET"
      }),
      providesTags: ["Roles"]
    }),

    // find role by id
    findRoleById: builder.query({
      query: (id) => ({
        url: `/roles/${id}`,
        method: "GET"
      }),
      providesTags: ["Roles"]
    })
  })
});

export const { useFindAllRolesQuery, useFindRoleByIdQuery } = rolesService;
