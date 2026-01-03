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

export interface Destination {
  id: string;
  state_id: string;
  location: string;
  category_destination_id: string;
  category_destination_name: string;
  price: string;
  translations: DestinationTranslation[];
}

export interface DestinationsResponse {
  message: string;
  data: Destination[];
}

export const destinationService = createApi({
  reducerPath: "destinationService",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    prepareHeaders: (headers) => {
      const token = Cookies.get("travel_token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    }
  }),
  endpoints: (builder) => ({
    findAllDestinationsWithTranslation: builder.query<DestinationsResponse, void>({
      query: () => ({
        url: "/destination/find-all-destination-with-translation",
        method: "GET"
      })
    })
  })
});

export const { useFindAllDestinationsWithTranslationQuery } = destinationService;
