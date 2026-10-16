import { baseApi } from "../api/baseApi";

export interface CustomerProfileData {
  id?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface CustomerItem {
  id: string;
  name: string;
  email: string;
  phone_number?: string;
  is_verified: boolean;
  avatar?: string;
  profile?: CustomerProfileData;
  bookersCount?: number;
  itinerariesCount?: number;
  bookers?: Array<{
    id: string;
    name: string;
    email: string;
    phone_number: string;
    created_at: string;
  }>;
  itineraries?: Array<{
    id: string;
    title: string;
    start_date: string;
    end_date: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export const customerService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    findAllCustomers: builder.query<{ message: string; data: CustomerItem[] }, void>({
      query: () => ({
        url: "/customers/admin/list",
        method: "GET",
      }),
      providesTags: ["Customers"],
    }),
    findCustomerById: builder.query<{ message: string; data: CustomerItem }, string>({
      query: (id) => ({
        url: `/customers/admin/${id}`,
        method: "GET",
      }),
      providesTags: ["Customers"],
    }),
    toggleVerifyCustomer: builder.mutation<any, string>({
      query: (id) => ({
        url: `/customers/admin/${id}/toggle-verify`,
        method: "POST",
      }),
      invalidatesTags: ["Customers"],
    }),
    deleteCustomer: builder.mutation<any, string>({
      query: (id) => ({
        url: `/customers/admin/${id}/delete`,
        method: "POST",
      }),
      invalidatesTags: ["Customers"],
    }),
  }),
});

export const {
  useFindAllCustomersQuery,
  useFindCustomerByIdQuery,
  useToggleVerifyCustomerMutation,
  useDeleteCustomerMutation,
} = customerService;
