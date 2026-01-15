import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

export const ordersService = createApi({
  reducerPath: "ordersService",
  tagTypes: ["Orders"],
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
    // find all orders
    findAllOrders: builder.query<any, void>({
      query: () => ({
        url: "/payments/find-all-payment-user",
        method: "GET"
      })
    }),
    findOrderById: builder.query<any, string>({
      query: (id) => ({
        url: `/payments/${id}`,
        method: "GET"
      })
    }),
    updateStatusBookTour: builder.mutation<any, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/book-tours/update-status/${id}`,
        method: "PUT",
        body: { status }
      }),
      invalidatesTags: ["Orders"]
    })
  })
});

export const { useFindAllOrdersQuery, useFindOrderByIdQuery, useUpdateStatusBookTourMutation } =
  ordersService;
