import { baseApi } from "../api/baseApi";

export interface AttractionTranslation {
  id?: number;
  destination_id?: string;
  attraction_id?: string;
  language_code: "en" | "id" | "tr" | string;
  name: string;
  slug?: string;
  description: string;
  thumbnail?: string;
  image?: string[];
  detail_tour?: string[];
  facilities?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface EntertainmentCategory {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StateLocation {
  id: string;
  name: string;
  cities?: { id: string; name: string }[];
}

export interface CountryLocation {
  id: string;
  name: string;
  iso?: string;
  flag?: string;
  states?: StateLocation[];
}

export interface LocationsResponse {
  message: string;
  data: CountryLocation[];
}

export interface AttractionItem {
  id: string;
  state_id?: string;
  state_name?: string;
  city_id?: string;
  city_name?: string;
  country_id?: string;
  country_name?: string;
  category_destination_id?: string;
  category_destination_name?: string;
  category_id?: string;
  category_name?: string;
  name?: string;
  category?: string;
  price: number;
  location?: string;
  status?: string;
  thumbnail?: string;
  images?: string[];
  highlights?: string[];
  facilities?: string[];
  description?: string;
  translations: AttractionTranslation[];
  createdAt?: string;
  updatedAt?: string;
}

export interface EntertainmentFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  category_destination_id?: string;
  category_id?: string;
  state_id?: string;
  city_id?: string;
}

export interface EntertainmentResponse {
  message: string;
  data: AttractionItem[];
  datas?: AttractionItem[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SingleEntertainmentResponse {
  message: string;
  data: AttractionItem;
}

export interface EntertainmentCategoriesResponse {
  message: string;
  data: EntertainmentCategory[];
  datas?: EntertainmentCategory[];
}

export interface CreateEntertainmentPayload {
  state_id: string;
  city_id?: string;
  category_destination_id: string;
  price: number;
  thumbnail?: string;
  images?: string[];
  translations: {
    language_code: string;
    name: string;
    description: string;
    detail_tour: string[];
    facilities: string[];
  }[];
}

export const entertainmentService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Dedicated /entertainment-attractions endpoints
    findAllEntertainments: builder.query<EntertainmentResponse, EntertainmentFilterParams | void>({
      query: (params) => ({
        url: "/entertainment-attractions",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Entertainments" as const, id })),
              { type: "Entertainments", id: "LIST" },
            ]
          : [{ type: "Entertainments", id: "LIST" }],
    }),
    findEntertainmentById: builder.query<SingleEntertainmentResponse, string>({
      query: (id) => ({
        url: `/entertainment-attractions/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Entertainments", id }],
    }),
    findAllEntertainmentCategories: builder.query<EntertainmentCategoriesResponse, void>({
      query: () => ({
        url: "/entertainment-attractions/categories",
        method: "GET",
      }),
      providesTags: ["Entertainments"],
    }),
    findAllLocations: builder.query<LocationsResponse, void>({
      query: () => ({
        url: "/locations",
        method: "GET",
      }),
    }),
    createEntertainment: builder.mutation<SingleEntertainmentResponse, CreateEntertainmentPayload>({
      query: (payload) => ({
        url: "/entertainment-attractions",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [{ type: "Entertainments", id: "LIST" }],
    }),
    updateEntertainment: builder.mutation<
      SingleEntertainmentResponse,
      { id: string; data: Partial<CreateEntertainmentPayload> }
    >({
      query: ({ id, data }) => ({
        url: `/entertainment-attractions/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Entertainments", id },
        { type: "Entertainments", id: "LIST" },
      ],
    }),
    deleteEntertainment: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/entertainment-attractions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Entertainments", id: "LIST" }],
    }),
  }),
});

export const {
  useFindAllEntertainmentsQuery,
  useFindEntertainmentByIdQuery,
  useFindAllEntertainmentCategoriesQuery,
  useFindAllLocationsQuery,
  useCreateEntertainmentMutation,
  useUpdateEntertainmentMutation,
  useDeleteEntertainmentMutation,
} = entertainmentService;
