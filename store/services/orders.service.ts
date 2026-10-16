import { baseApi } from "../api/baseApi";

export const ordersService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // find all orders
    findAllOrders: builder.query<any, void>({
      query: () => ({
        url: "/payments/admin",
        method: "GET"
      }),
      providesTags: ["Orders"]
    }),
    findOrderById: builder.query<any, string>({
      query: (id) => ({
        url: `/payments/${id}`,
        method: "GET"
      }),
      providesTags: ["Orders"]
    }),
    updateStatusBookTour: builder.mutation<any, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/book-tours/${id}/status`,
        method: "PATCH",
        body: { status }
      }),
      invalidatesTags: ["Orders"]
    }),
    updateStatusBookMotor: builder.mutation<any, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/book-motors/${id}/status`,
        method: "PATCH",
        body: { status }
      }),
      invalidatesTags: ["Orders"]
    }),
    // Document & Visa Bookings
    findAllBookDocumentVisas: builder.query<any, { page?: number; limit?: number; status?: string; search?: string } | void>({
      query: (params) => ({
        url: "/book-document-visas",
        method: "GET",
        params: params || undefined
      }),
      providesTags: ["Orders"]
    }),
    findBookDocumentVisaById: builder.query<any, string>({
      query: (id) => ({
        url: `/book-document-visas/${id}`,
        method: "GET"
      }),
      providesTags: ["Orders"]
    }),
    updateStatusBookDocumentVisa: builder.mutation<
      any,
      {
        id: string;
        status: string;
        admin_notes?: string;
        rejection_reason?: string;
        appointment_date?: string;
        appointment_location?: string;
        embassy_application_id?: string;
        tracking_number?: string;
        log_title?: string;
        log_note?: string;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/book-document-visas/${id}/status`,
        method: "PATCH",
        body
      }),
      invalidatesTags: ["Orders"]
    }),
    reviewApplicantFile: builder.mutation<
      any,
      {
        fileId: string;
        review_status: string;
        rejection_note?: string;
      }
    >({
      query: ({ fileId, ...body }) => ({
        url: `/book-document-visas/files/${fileId}/review`,
        method: "PATCH",
        body
      }),
      invalidatesTags: ["Orders"]
    })
  })
});

export const {
  useFindAllOrdersQuery,
  useFindOrderByIdQuery,
  useUpdateStatusBookTourMutation,
  useUpdateStatusBookMotorMutation,
  useFindAllBookDocumentVisasQuery,
  useFindBookDocumentVisaByIdQuery,
  useUpdateStatusBookDocumentVisaMutation,
  useReviewApplicantFileMutation
} = ordersService;
