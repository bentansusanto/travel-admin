import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

export interface MotorTranslation {
  id?: string;
  language_code: string;
  name_motor: string;
  description: string;
  slug?: string;
}

export interface MotorVariant {
  id?: string;
  color: string;
}

export interface MotorPrice {
  id?: string;
  price_type: "daily" | "weekly";
  price: number;
}

export interface Motor {
  id?: string;
  state_id: string;
  merek_id: string;
  engine_cc: number;
  thumbnail: string;
  is_available: boolean;
  translations: MotorTranslation[];
  variants: MotorVariant[];
  prices?: MotorPrice[];
  motor_prices?: MotorPrice[];
  merek?: {
    id: string;
    name_merek: string;
  };
  state?: {
    id: string;
    name: string;
  };
}

export interface Merek {
  id: string;
  name_merek: string;
}

export interface MotorsResponse {
  message: string;
  data: Motor[];
}

export interface SingleMotorResponse {
  message: string;
  data: Motor;
}

export interface MereksResponse {
  message: string;
  data: Merek[];
}

export interface SingleMerekResponse {
  message: string;
  data: Merek;
}

export const motorService = createApi({
  reducerPath: "motorService",
  tagTypes: ["Motors", "Mereks"],
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
    findAllMotors: builder.query<MotorsResponse, void>({
      query: () => ({
        url: "/motors/find-all",
        method: "GET"
      }),
      providesTags: ["Motors"]
    }),
    findMotorById: builder.query<SingleMotorResponse, string>({
      query: (id) => ({
        url: `/motors/${id}`,
        method: "GET"
      })
    }),
    createMotor: builder.mutation<SingleMotorResponse, Motor>({
      query: (motor) => ({
        url: "/motors/create",
        method: "POST",
        body: motor
      }),
      invalidatesTags: ["Motors"]
    }),
    updateMotor: builder.mutation<SingleMotorResponse, { id: string; data: Partial<Motor> }>({
      query: ({ id, data }) => ({
        url: `/motors/update/${id}`,
        method: "PUT",
        body: data
      }),
      invalidatesTags: ["Motors"]
    }),
    deleteMotor: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/motors/delete/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Motors"]
    }),
    findAllMereks: builder.query<MereksResponse, void>({
      query: () => ({
        url: "/mereks/find-all",
        method: "GET"
      }),
      providesTags: ["Mereks"]
    }),
    createMerek: builder.mutation<SingleMerekResponse, { name_merek: string }>({
      query: (data) => ({
        url: "/mereks/create",
        method: "POST",
        body: data
      }),
      invalidatesTags: ["Mereks"]
    }),
    updateMerek: builder.mutation<SingleMerekResponse, { id: string; data: { name_merek: string } }>({
      query: ({ id, data }) => ({
        url: `/mereks/update/${id}`,
        method: "PUT",
        body: data
      }),
      invalidatesTags: ["Mereks"]
    }),
    deleteMerek: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/mereks/delete/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Mereks"]
    })
  })
});

export const {
  useFindAllMotorsQuery,
  useFindMotorByIdQuery,
  useCreateMotorMutation,
  useUpdateMotorMutation,
  useDeleteMotorMutation,
  useFindAllMereksQuery,
  useCreateMerekMutation,
  useUpdateMerekMutation,
  useDeleteMerekMutation
} = motorService;
