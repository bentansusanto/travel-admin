import { baseApi } from "../api/baseApi";

export interface DestinationTranslation {
  id?: number;
  destination_id?: string;
  language_code: string;
  name: string;
  slug?: string;
  description: string;
  thumbnail?: string;
  image?: string[];
  detail_tour: string[];
  facilities: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryDestination {
  id: string;
  name: string;
}

export interface State {
  id: string;
  name: string;
  cities?: { id: string; name: string }[];
}

export interface Country {
  id: string;
  name: string;
  iso?: string;
  flag?: string;
  states?: State[];
  cities?: State[];
}

export interface Destination {
  id?: string;
  state_id: string;
  city_id?: string;
  city_name?: string;
  country_id?: string;
  location?: string;
  category_destination_id: string;
  category_destination_name?: string;
  price: number;
  thumbnail?: string;
  images?: string[];
  translations?: DestinationTranslation[];
}

export interface DestinationFilterParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  category_destination_id?: string;
  state_id?: string;
  city_id?: string;
}

export interface DestinationsResponse {
  message: string;
  data: Destination[];
  datas?: Destination[];
  meta?: {
    page: number;
    limit: number;
    total?: number;
    totalData: number;
    totalPage: number;
    totalPages?: number;
  };
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

export const destinationService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // find all destination with translation
    findAllDestinationsWithTranslation: builder.query<
      DestinationsResponse,
      DestinationFilterParams | void
    >({
      query: (params) => ({
        url: "/destinations",
        method: "GET",
        params: {
          limit: 100,
          ...(params || {}),
        },
      }),
      transformResponse: (response: any) => {
        const items = response?.data || response?.datas || [];
        return {
          ...response,
          data: items,
          datas: items,
        };
      },
      providesTags: ["Destinations"]
    }),
    // find destination by id
    findDestinationById: builder.query<SingleDestinationResponse, string>({
      query: (id) => ({
        url: `/destinations/${id}`,
        method: "GET"
      })
    }),
    // find category destination
    findAllCategoryDestinations: builder.query<CategoriesResponse, void>({
      query: () => ({
        url: "/destinations/categories",
        method: "GET"
      })
    }),
    // find all countries with states
    findAllCountries: builder.query<CountriesResponse, void>({
      query: () => ({
        url: "/locations",
        method: "GET"
      })
    }),
    // create destination
    createDestination: builder.mutation<SingleDestinationResponse, any>({
      query: (destination) => ({
        url: "/destinations",
        method: "POST",
        body: destination
      }),
      invalidatesTags: ["Destinations"]
    }),
    // update destination
    updateDestination: builder.mutation<
      SingleDestinationResponse,
      { id: string; data: any }
    >({
      query: ({ id, data }) => ({
        url: `/destinations/${id}`,
        method: "PUT",
        body: data
      }),
      invalidatesTags: ["Destinations"]
    }),
    // delete destination
    deleteDestination: builder.mutation<SingleDestinationResponse, string>({
      query: (id) => ({
        url: `/destinations/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Destinations"]
    }),
    // create translation for destination
    createTranslationDestination: builder.mutation<
      any,
      { id: string; translation: any }
    >({
      query: ({ id, translation }) => ({
        url: `/destinations/${id}`,
        method: "PUT",
        body: {
          translations: [translation]
        }
      }),
      invalidatesTags: ["Destinations"]
    }),
    // update translation for destination
    updateTranslationDestination: builder.mutation<
      any,
      { id: string; translation: any }
    >({
      query: ({ id, translation }) => ({
        url: `/destinations/${id}`,
        method: "PUT",
        body: {
          translations: [translation]
        }
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
