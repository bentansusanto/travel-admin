import { baseApi } from "../api/baseApi";

export const salesService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // find all sales (using admin payments data)
    findAllSales: builder.query<any, void>({
      query: () => ({
        url: "/payments/admin",
        method: "GET"
      }),
      providesTags: ["Sales"]
    }),
    findSalesById: builder.query<any, string>({
      query: (id) => ({
        url: `/payments/${id}`,
        method: "GET"
      }),
      providesTags: ["Sales"]
    }),
  })
});

export const {
  useFindAllSalesQuery,
  useFindSalesByIdQuery,
} = salesService;
