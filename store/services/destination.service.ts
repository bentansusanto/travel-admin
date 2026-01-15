import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

export interface DestinationTranslation {
  id: number;
  destination_id: string;
  language_code: string;
  name: string;
  slug: string;
  description: string;
  thumbnail: string;
  image: string[];
  detail_tour: string[];
  facilities: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoryDestination {
  id: string;
  name: string;
}

export interface State {
  id: string;
  name: string;
}

export interface Country {
  id: string;
  name: string;
  cities: State[];
}

export interface Destination {
  id?: string;
  state_id: string;
  location?: string;
  category_destination_id: string;
  category_destination_name?: string;
  price: number;
  translations?: DestinationTranslation[];
}

export interface DestinationsResponse {
  message: string;
  data: Destination[];
}

export interface SingleDestinationResponse {
  message: string;
  data: Destination;
}

export interface CountriesResponse {
  message: string;
  data: Country[];
}

export interface CategoriesResponse {
  message: string;
  data: CategoryDestination[];
}

export const destinationService = createApi({
  reducerPath: "destinationService",
  tagTypes: ["Destinations"],
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
    // find all destination with translation
    findAllDestinationsWithTranslation: builder.query<DestinationsResponse, void>({
      query: () => ({
        url: "/destination/find-all-destination-with-translation",
        method: "GET"
      }),
      providesTags: ["Destinations"]
    }),
    // find destination by id
    findDestinationById: builder.query<SingleDestinationResponse, string>({
      query: (id) => ({
        url: `/destination/${id}`,
        method: "GET"
      })
    }),
    // find category destination
    findAllCategoryDestinations: builder.query<CategoriesResponse, void>({
      query: () => ({
        url: "/destination/find-all-categories-destination",
        method: "GET"
      })
    }),
    // find all countries with states
    findAllCountries: builder.query<CountriesResponse, void>({
      query: () => ({
        url: "/countries/find-all",
        method: "GET"
      })
    }),
    // create destination
    createDestination: builder.mutation<SingleDestinationResponse, Destination>({
      query: (destination) => ({
        url: "/destination/create",
        method: "POST",
        body: destination
      }),
      invalidatesTags: ["Destinations"]
    }),
    // create translation destination
    createTranslationDestination: builder.mutation<
      SingleDestinationResponse,
      { id: string; translation: any }
    >({
      query: ({ id, translation }) => ({
        url: `/destination/${id}/translation`,
        method: "POST",
        body: translation
      }),
      invalidatesTags: ["Destinations"]
    }),
    // update destination
    updateDestination: builder.mutation<
      SingleDestinationResponse,
      { id: string; data: Destination }
    >({
      query: ({ id, data }) => ({
        url: `/destination/${id}/update`,
        method: "PUT",
        body: data
      }),
      invalidatesTags: ["Destinations"]
    }),
    // update translation destination
    updateTranslationDestination: builder.mutation<
      SingleDestinationResponse,
      { id: string; translation: any }
    >({
      query: ({ id, translation }) => ({
        url: `/destination/${id}/update-translation`,
        method: "PUT",
        body: translation
      }),
      invalidatesTags: ["Destinations"]
    }),
    // delete destination
    deleteDestination: builder.mutation<SingleDestinationResponse, string>({
      query: (id) => ({
        url: `/destination/${id}/delete`,
        method: "DELETE"
      }),
      invalidatesTags: ["Destinations"]
    })
  })
});

export const {
  useFindAllDestinationsWithTranslationQuery,
  useFindDestinationByIdQuery,
  useFindAllCategoryDestinationsQuery,
  useFindAllCountriesQuery,
  useCreateDestinationMutation,
  useUpdateDestinationMutation,
  useDeleteDestinationMutation,
  useCreateTranslationDestinationMutation,
  useUpdateTranslationDestinationMutation
} = destinationService;
