import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

export const salesService = createApi({
  reducerPath: "salesService",
  tagTypes: ["Sales"],
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
    findAllSales: builder.query<any, void>({
      query: () => ({
        url: "/payments/find-all-payment-user",
        method: "GET"
      })
    }),
    findSalesById: builder.query<any, string>({
      query: (id) => ({
        url: `/sales/${id}`,
        method: "GET"
      })
    }),
    findSalesByWeek: builder.query<any, void>({
      query: () => ({
        url: "/payments/weekly",
        method: "GET"
      })
    }),
    findSalesByMonth: builder.query<any, void>({
      query: () => ({
        url: "/payments/monthly",
        method: "GET"
      })
    }),
    findSalesByYear: builder.query<any, void>({
      query: () => ({
        url: "/payments/yearly",
        method: "GET"
      })
    }),
  })

});


export const {useFindAllSalesQuery, useFindSalesByIdQuery, useFindSalesByWeekQuery, useFindSalesByMonthQuery, useFindSalesByYearQuery} = salesService
