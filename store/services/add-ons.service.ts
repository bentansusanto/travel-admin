import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

export type AddOnCategory = "motor" | "tour" | "general";

export interface AddOn {
  id?: string;
  name: string;
  price: number;
  category: AddOnCategory;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AddOnsResponse {
  message: string;
  data: AddOn[];
}

export interface SingleAddOnResponse {
  message: string;
  data: AddOn;
}

export const addOnsService = createApi({
  reducerPath: "addOnsService",
  tagTypes: ["AddOns"],
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
    findAllAddOns: builder.query<AddOnsResponse, void>({
      query: () => ({
        url: "/add-ons/find-all",
        method: "GET"
      }),
      providesTags: ["AddOns"]
    }),
    findAddOnById: builder.query<SingleAddOnResponse, string>({
      query: (id) => ({
        url: `/add-ons/${id}`,
        method: "GET"
      }),
      providesTags: (result, error, id) => [{ type: "AddOns", id }]
    }),
    createAddOn: builder.mutation<SingleAddOnResponse, Partial<AddOn>>({
      query: (addOn) => ({
        url: "/add-ons/create",
        method: "POST",
        body: addOn
      }),
      invalidatesTags: ["AddOns"]
    }),
    updateAddOn: builder.mutation<SingleAddOnResponse, { id: string; data: Partial<AddOn> }>({
      query: ({ id, data }) => ({
        url: `/add-ons/update/${id}`,
        method: "PUT",
        body: data
      }),
      invalidatesTags: ["AddOns"]
    }),
    deleteAddOn: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/add-ons/delete/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["AddOns"]
    })
  })
});

export const {
  useFindAllAddOnsQuery,
  useFindAddOnByIdQuery,
  useCreateAddOnMutation,
  useUpdateAddOnMutation,
  useDeleteAddOnMutation
} = addOnsService;
