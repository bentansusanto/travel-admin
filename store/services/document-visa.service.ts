import { baseApi } from "../api/baseApi";

// ─── Interfaces & Types ────────────────────────────────────────────────────────

export interface DocumentCategory {
  id: string;
  slug: string;
  name: string;
  icon?: string;
  order_priority: number;
  is_active: boolean;
}

export interface DocumentVisaTranslation {
  id?: string | number;
  visa_id?: string;
  document_visa_id?: string;
  language_code: string;
  title: string;
  name?: string; // alias for title
  slug?: string;
  description: string;
  terms_conditions?: string;
  submission_process?: string;
  requirements?: string[];
  inclusions?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentVisaPackage {
  id?: string;
  name: string | Record<string, string>;
  name_i18n?: Record<string, string>;
  processing_time_days: number;
  embassy_fee: number;
  service_fee: number;
  total_price: number;
  description?: string | Record<string, string>;
  description_i18n?: Record<string, string>;
  is_active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentVisaRequirement {
  id?: string;
  name: string | Record<string, string>;
  name_i18n?: Record<string, string>;
  description?: string | Record<string, string>;
  description_i18n?: Record<string, string>;
  allowed_file_types?: string;
  max_file_size_mb?: number;
  is_mandatory?: boolean;
  example_file_url?: string;
  order_priority?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentVisaItem {
  id: string;
  category_id?: string;
  category_name?: string;
  category?: DocumentCategory;
  country_id?: string;
  country_name: string;
  country_code: string;
  flag_url?: string;
  country?: {
    id: string;
    name: string;
    code?: string;
  };
  origin_country_id?: string;
  origin_country_name?: string;
  origin_country?: {
    id: string;
    name: string;
    code?: string;
  };
  visa_type: string;
  entry_type: string;
  validity_days?: number;
  validity: string;
  max_stay_days?: number;
  processing_time_days?: number;
  processing_time: string;
  starting_price?: number;
  price: number; // mapped starting_price
  status: "Active" | "Inactive" | "Draft" | string;
  is_active: boolean;
  thumbnail?: string;
  images?: string[];
  is_interview_required?: boolean;
  is_biometric_required?: boolean;
  title: string;
  name: string; // mapped title
  slug?: string;
  description?: string;
  terms_conditions?: string;
  submission_process?: string;
  requirements: string[];
  requirements_details?: DocumentVisaRequirement[];
  inclusions: string[];
  packages?: DocumentVisaPackage[];
  translations: DocumentVisaTranslation[];
  createdAt: string;
  updatedAt: string;
}

// Backward-compatibility aliases
export type VisaItem = DocumentVisaItem;
export type VisaTranslation = DocumentVisaTranslation;

export interface FilterDocumentVisaParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  category_id?: string;
  category_slug?: string;
  country_id?: string;
  origin_country_id?: string;
  visa_type?: string;
  entry_type?: string;
  lang?: string;
}

export interface DocumentVisaListResponse {
  message: string;
  data: DocumentVisaItem[];
  datas?: DocumentVisaItem[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
export type VisaResponse = DocumentVisaListResponse;

export interface SingleDocumentVisaResponse {
  message: string;
  data: DocumentVisaItem;
}
export type SingleVisaResponse = SingleDocumentVisaResponse;

export interface DocumentCategoriesResponse {
  message: string;
  data: DocumentCategory[];
  datas?: DocumentCategory[];
}

export interface LocationsResponse {
  message: string;
  data: {
    id: string;
    name: string;
    iso?: string;
    flag?: string;
    states?: { id: string; name: string }[];
  }[];
  datas?: {
    id: string;
    name: string;
    iso?: string;
    flag?: string;
    states?: { id: string; name: string }[];
  }[];
}

export interface CreateDocumentVisaPayload {
  category_id?: string;
  country_id?: string;
  origin_country_id?: string;
  visa_type?: string;
  entry_type?: string;
  validity_days?: number;
  max_stay_days?: number;
  thumbnail?: string;
  images?: string[];
  is_interview_required?: boolean;
  is_biometric_required?: boolean;
  starting_price?: number;
  is_active?: boolean;
  translations?: any[];
  packages?: any[];
  requirements?: any[];
  // Legacy flat fields supported
  country_name?: string;
  country_code?: string;
  flag_url?: string;
  validity?: string;
  processing_time?: string;
  price?: number | string;
  name?: string;
  description?: string;
  inclusions?: string[];
}

// ─── Normalizer Helper ─────────────────────────────────────────────────────────

export const normalizeDocumentVisaItem = (item: any): DocumentVisaItem => {
  if (!item) return {} as DocumentVisaItem;

  const countryName = item.country_name || item.country?.name || "";
  const countryCode =
    item.country_code ||
    item.country?.code ||
    (countryName.length >= 2 ? countryName.substring(0, 2).toUpperCase() : "XX");

  const flagUrl =
    item.flag_url ||
    (countryCode && countryCode !== "XX"
      ? `https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`
      : undefined);

  const title = item.title || item.name || `${countryName} Visa Assistance`;
  const numPrice = Number(item.starting_price ?? item.price ?? item.packages?.[0]?.total_price ?? 0);

  const validity =
    item.validity ||
    (item.validity_days ? `${item.validity_days} Days` : "30 Days");

  const processingTime =
    item.processing_time ||
    (item.processing_time_days ? `${item.processing_time_days} Working Days` : "3 - 5 Working Days");

  // Format visa type for UI display
  const rawType = (item.visa_type || "tourist").toLowerCase();
  let formattedType = "Tourist";
  if (rawType.includes("business")) formattedType = "Business";
  else if (rawType.includes("transit")) formattedType = "Transit";
  else if (rawType.includes("student") || rawType.includes("study")) formattedType = "Student";
  else if (rawType.includes("working") || rawType.includes("holiday")) formattedType = "Working Holiday";

  // Format entry type for UI display
  const rawEntry = (item.entry_type || "single_entry").toLowerCase();
  const formattedEntry = rawEntry.includes("multiple") ? "Multiple Entry" : "Single Entry";

  // Extract requirements as string list
  const requirementsList: string[] = [];
  if (Array.isArray(item.requirements)) {
    item.requirements.forEach((req: any) => {
      if (typeof req === "string") {
        requirementsList.push(req);
      } else if (req && typeof req === "object") {
        const nameVal = req.name || req.title;
        if (typeof nameVal === "string") {
          requirementsList.push(nameVal);
        } else if (nameVal && typeof nameVal === "object") {
          requirementsList.push(nameVal.en || nameVal.id || Object.values(nameVal)[0] || "");
        }
      }
    });
  }

  // Fallback requirements from translations if empty
  if (requirementsList.length === 0 && Array.isArray(item.translations)) {
    const trWithReqs = item.translations.find((t: any) => Array.isArray(t.requirements) && t.requirements.length > 0);
    if (trWithReqs) {
      requirementsList.push(...trWithReqs.requirements);
    }
  }

  // Extract inclusions
  const inclusionsList: string[] = Array.isArray(item.inclusions) ? item.inclusions : [];
  if (inclusionsList.length === 0 && Array.isArray(item.translations)) {
    const trWithInc = item.translations.find((t: any) => Array.isArray(t.inclusions) && t.inclusions.length > 0);
    if (trWithInc) {
      inclusionsList.push(...trWithInc.inclusions);
    }
  }

  // Normalize translations
  const normalizedTranslations: DocumentVisaTranslation[] = Array.isArray(item.translations)
    ? item.translations.map((t: any) => ({
        id: t.id,
        visa_id: item.id,
        document_visa_id: item.id,
        language_code: t.language_code || "en",
        title: t.title || t.name || title,
        name: t.title || t.name || title,
        slug: t.slug,
        description: t.description || "",
        terms_conditions: t.terms_conditions,
        submission_process: t.submission_process,
        requirements: Array.isArray(t.requirements) ? t.requirements : requirementsList,
        inclusions: Array.isArray(t.inclusions) ? t.inclusions : inclusionsList,
        createdAt: t.createdAt || item.createdAt,
        updatedAt: t.updatedAt || item.updatedAt,
      }))
    : [
        {
          language_code: "en",
          title,
          name: title,
          description: item.description || "",
          requirements: requirementsList,
          inclusions: inclusionsList,
        },
      ];

  return {
    id: String(item.id),
    category_id: item.category_id || item.category?.id,
    category_name: item.category_name || item.category?.name,
    category: item.category,
    country_id: item.country_id || item.country?.id,
    country_name: countryName,
    country_code: countryCode,
    flag_url: flagUrl,
    country: item.country,
    origin_country_id: item.origin_country_id || item.origin_country?.id,
    origin_country_name: item.origin_country_name || item.origin_country?.name,
    visa_type: formattedType,
    entry_type: formattedEntry,
    validity_days: item.validity_days,
    validity,
    max_stay_days: item.max_stay_days,
    processing_time_days: item.processing_time_days,
    processing_time: processingTime,
    starting_price: numPrice,
    price: numPrice,
    status: item.is_active === false ? "Inactive" : "Active",
    is_active: item.is_active !== false,
    thumbnail: item.thumbnail,
    images: Array.isArray(item.images) ? item.images : item.thumbnail ? [item.thumbnail] : [],
    is_interview_required: Boolean(item.is_interview_required),
    is_biometric_required: Boolean(item.is_biometric_required),
    title,
    name: title,
    slug: item.slug,
    description: item.description || normalizedTranslations[0]?.description || "",
    terms_conditions: item.terms_conditions,
    submission_process: item.submission_process,
    requirements: requirementsList,
    requirements_details: Array.isArray(item.requirements) ? item.requirements : undefined,
    inclusions: inclusionsList,
    packages: Array.isArray(item.packages) ? item.packages : undefined,
    translations: normalizedTranslations,
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString(),
  };
};

// ─── Format Payload for Backend DTO ──────────────────────────────────────────

const formatVisaPayload = (payload: CreateDocumentVisaPayload) => {
  // Convert visa type to backend enum lowercase
  const rawType = (payload.visa_type || "tourist").toLowerCase().replace(/[\s-]/g, "_");
  let visaType = "tourist";
  if (rawType.includes("business")) visaType = "business";
  else if (rawType.includes("transit")) visaType = "transit";
  else if (rawType.includes("student") || rawType.includes("study")) visaType = "study";
  else if (rawType.includes("umrah") || rawType.includes("hajj")) visaType = "umrah_hajj";
  else if (rawType.includes("renewal") || rawType.includes("perpanjang")) visaType = "passport_renewal";
  else if (rawType.includes("passport") || rawType.includes("paspor")) visaType = "passport_new";
  else if (rawType.includes("other") || rawType.includes("working") || rawType.includes("holiday")) visaType = "other";

  // Convert entry type to backend enum lowercase
  const rawEntry = (payload.entry_type || "single_entry").toLowerCase().replace(/[\s-]/g, "_");
  let entryType = "single_entry";
  if (rawEntry.includes("multiple")) entryType = "multiple_entry";
  else if (rawEntry.includes("not") || rawEntry.includes("na") || rawEntry.includes("applicable")) entryType = "not_applicable";

  const validityDays =
    payload.validity_days ||
    (payload.validity ? parseInt(payload.validity.replace(/\D/g, ""), 10) : undefined) ||
    30;

  const processingTimeDays =
    (payload.processing_time ? parseInt(payload.processing_time.replace(/\D/g, ""), 10) : undefined) || 5;

  // Format translations to match CreateDocumentVisaTranslationDto
  const translations = Array.isArray(payload.translations) && payload.translations.length > 0
    ? payload.translations.map((t) => ({
        language_code: t.language_code || "en",
        title: (t.title || t.name || payload.name || "Visa Assistance").trim(),
        description: (t.description || payload.description || "").trim(),
        terms_conditions: t.terms_conditions || undefined,
        submission_process: t.submission_process || undefined,
      }))
    : [
        {
          language_code: "en",
          title: (payload.name || `${payload.country_name || ""} Visa Assistance`).trim(),
          description: (payload.description || "International visa processing assistance").trim(),
        },
      ];

  // Requirements formatting
  const requirements = Array.isArray(payload.requirements) && payload.requirements.length > 0
    ? payload.requirements.map((r, idx) => ({
        id: typeof r === "object" ? r.id || undefined : undefined,
        name: typeof r === "string" ? r : r.name,
        description: typeof r === "object" ? r.description || undefined : undefined,
        allowed_file_types: (typeof r === "object" && r.allowed_file_types) ? r.allowed_file_types : "pdf,jpg,jpeg,png",
        max_file_size_mb: (typeof r === "object" && r.max_file_size_mb) ? Number(r.max_file_size_mb) : 5,
        is_mandatory: typeof r === "object" ? r.is_mandatory ?? true : true,
        example_file_url: (typeof r === "object" && r.example_file_url) ? r.example_file_url : undefined,
        order_priority: (typeof r === "object" && r.order_priority !== undefined) ? Number(r.order_priority) : idx + 1,
      }))
    : undefined;

  // Packages formatting
  let numPrice = Number(payload.starting_price ?? payload.price ?? 0);
  const packages = Array.isArray(payload.packages) && payload.packages.length > 0
    ? payload.packages.map((p) => {
        const emb = Number(p.embassy_fee || 0);
        const srv = Number(p.service_fee || 0);
        const total = p.total_price !== undefined && p.total_price !== null && p.total_price !== ""
          ? Number(p.total_price)
          : emb + srv;
        return {
          id: p.id || undefined,
          name: p.name,
          processing_time_days: Number(p.processing_time_days || 1),
          embassy_fee: emb,
          service_fee: srv,
          total_price: total,
          description: p.description || undefined,
          is_active: p.is_active ?? true,
        };
      })
    : [
        {
          name: "Standard Processing",
          processing_time_days: processingTimeDays,
          embassy_fee: Math.round(numPrice * 0.6),
          service_fee: Math.round(numPrice * 0.4),
          total_price: numPrice,
          description: "Standard visa document review and embassy application assistance.",
          is_active: true,
        },
      ];

  if (numPrice <= 0 && packages && packages.length > 0) {
    const activePrices = packages
      .filter((p) => p.is_active !== false)
      .map((p) => Number(p.total_price));
    if (activePrices.length > 0) {
      numPrice = Math.min(...activePrices);
    }
  }

  return {
    category_id: payload.category_id,
    country_id: payload.country_id,
    origin_country_id: payload.origin_country_id || undefined,
    visa_type: visaType,
    entry_type: entryType,
    validity_days: validityDays,
    max_stay_days: payload.max_stay_days || undefined,
    thumbnail: payload.thumbnail || undefined,
    images: payload.images || (payload.thumbnail ? [payload.thumbnail] : undefined),
    is_interview_required: Boolean(payload.is_interview_required),
    is_biometric_required: Boolean(payload.is_biometric_required),
    starting_price: numPrice,
    is_active: payload.is_active ?? true,
    translations,
    packages,
    requirements,
  };
};

// ─── Service API Definition ───────────────────────────────────────────────────

export const documentVisaService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /document-visas (List with filters)
    findAllDocumentVisas: builder.query<DocumentVisaListResponse, FilterDocumentVisaParams | void>({
      query: (params) => ({
        url: "/document-visas",
        method: "GET",
        params: params || undefined,
      }),
      transformResponse: (response: any) => {
        const rawList = response?.datas || response?.data || [];
        return {
          message: response?.message || "Success",
          data: Array.isArray(rawList) ? rawList.map(normalizeDocumentVisaItem) : [],
          datas: Array.isArray(rawList) ? rawList.map(normalizeDocumentVisaItem) : [],
          meta: response?.meta,
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Visas" as const, id })),
              { type: "Visas", id: "LIST" },
            ]
          : [{ type: "Visas", id: "LIST" }],
    }),

    // GET /document-visas/:id (Detail by ID)
    findDocumentVisaById: builder.query<
      SingleDocumentVisaResponse,
      string | { id: string; lang?: string }
    >({
      query: (arg) => {
        const id = typeof arg === "string" ? arg : arg.id;
        const lang = typeof arg === "object" ? arg.lang : undefined;
        return {
          url: `/document-visas/${id}`,
          method: "GET",
          params: lang ? { lang } : undefined,
        };
      },
      transformResponse: (response: any) => ({
        message: response?.message || "Success",
        data: normalizeDocumentVisaItem(response?.data || response),
      }),
      providesTags: (result, error, arg) => [
        { type: "Visas", id: typeof arg === "string" ? arg : arg.id },
      ],
    }),

    // GET /document-visas/slug/:slug (Detail by Slug)
    findDocumentVisaBySlug: builder.query<
      SingleDocumentVisaResponse,
      string | { slug: string; lang?: string }
    >({
      query: (arg) => {
        const slug = typeof arg === "string" ? arg : arg.slug;
        const lang = typeof arg === "object" ? arg.lang : undefined;
        return {
          url: `/document-visas/slug/${slug}`,
          method: "GET",
          params: lang ? { lang } : undefined,
        };
      },
      transformResponse: (response: any) => ({
        message: response?.message || "Success",
        data: normalizeDocumentVisaItem(response?.data || response),
      }),
      providesTags: ["Visas"],
    }),

    // GET /document-visas/categories
    findDocumentVisaCategories: builder.query<DocumentCategoriesResponse, void>({
      query: () => ({
        url: "/document-visas/categories",
        method: "GET",
      }),
      transformResponse: (response: any) => {
        const raw = response?.datas || response?.data || [];
        return {
          message: response?.message || "Success",
          data: Array.isArray(raw) ? raw : [],
          datas: Array.isArray(raw) ? raw : [],
        };
      },
      providesTags: ["Visas"],
    }),

    // GET /locations (Countries master data)
    findAllLocations: builder.query<LocationsResponse, void>({
      query: () => ({
        url: "/locations",
        method: "GET",
      }),
      transformResponse: (response: any) => {
        const raw = response?.datas || response?.data || [];
        return {
          message: response?.message || "Success",
          data: Array.isArray(raw) ? raw : [],
          datas: Array.isArray(raw) ? raw : [],
        };
      },
    }),

    // POST /document-visas
    createDocumentVisa: builder.mutation<SingleDocumentVisaResponse, CreateDocumentVisaPayload>({
      query: (payload) => ({
        url: "/document-visas",
        method: "POST",
        body: formatVisaPayload(payload),
      }),
      invalidatesTags: [{ type: "Visas", id: "LIST" }],
    }),

    // PUT /document-visas/:id
    updateDocumentVisa: builder.mutation<
      SingleDocumentVisaResponse,
      { id: string; data: Partial<CreateDocumentVisaPayload> }
    >({
      query: ({ id, data }) => ({
        url: `/document-visas/${id}`,
        method: "PUT",
        body: formatVisaPayload(data as CreateDocumentVisaPayload),
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Visas", id },
        { type: "Visas", id: "LIST" },
      ],
    }),

    // DELETE /document-visas/:id
    deleteDocumentVisa: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/document-visas/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Visas", id: "LIST" }],
    }),

    // ─── Backward-compatibility aliases for visa.service ──────────────────────
    findAllVisas: builder.query<DocumentVisaListResponse, FilterDocumentVisaParams | void>({
      query: (params) => ({
        url: "/document-visas",
        method: "GET",
        params: params || undefined,
      }),
      transformResponse: (response: any) => {
        const rawList = response?.datas || response?.data || [];
        return {
          message: response?.message || "Success",
          data: Array.isArray(rawList) ? rawList.map(normalizeDocumentVisaItem) : [],
          datas: Array.isArray(rawList) ? rawList.map(normalizeDocumentVisaItem) : [],
          meta: response?.meta,
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Visas" as const, id })),
              { type: "Visas", id: "LIST" },
            ]
          : [{ type: "Visas", id: "LIST" }],
    }),

    findVisaById: builder.query<
      SingleDocumentVisaResponse,
      string | { id: string; lang?: string }
    >({
      query: (arg) => {
        const id = typeof arg === "string" ? arg : arg.id;
        const lang = typeof arg === "object" ? arg.lang : undefined;
        return {
          url: `/document-visas/${id}`,
          method: "GET",
          params: lang ? { lang } : undefined,
        };
      },
      transformResponse: (response: any) => ({
        message: response?.message || "Success",
        data: normalizeDocumentVisaItem(response?.data || response),
      }),
      providesTags: (result, error, arg) => [
        { type: "Visas", id: typeof arg === "string" ? arg : arg.id },
      ],
    }),

    createVisa: builder.mutation<SingleDocumentVisaResponse, CreateDocumentVisaPayload>({
      query: (payload) => ({
        url: "/document-visas",
        method: "POST",
        body: formatVisaPayload(payload),
      }),
      invalidatesTags: [{ type: "Visas", id: "LIST" }],
    }),

    updateVisa: builder.mutation<
      SingleDocumentVisaResponse,
      { id: string; data: Partial<CreateDocumentVisaPayload> }
    >({
      query: ({ id, data }) => ({
        url: `/document-visas/${id}`,
        method: "PUT",
        body: formatVisaPayload(data as CreateDocumentVisaPayload),
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Visas", id },
        { type: "Visas", id: "LIST" },
      ],
    }),

    deleteVisa: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/document-visas/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Visas", id: "LIST" }],
    }),
  }),
});

// ─── Exported Hooks ───────────────────────────────────────────────────────────

export const {
  useFindAllDocumentVisasQuery,
  useFindDocumentVisaByIdQuery,
  useFindDocumentVisaBySlugQuery,
  useFindDocumentVisaCategoriesQuery,
  useFindAllLocationsQuery,
  useCreateDocumentVisaMutation,
  useUpdateDocumentVisaMutation,
  useDeleteDocumentVisaMutation,

  // Backward-compatibility hook aliases
  useFindAllVisasQuery,
  useFindVisaByIdQuery,
  useCreateVisaMutation,
  useUpdateVisaMutation,
  useDeleteVisaMutation,
} = documentVisaService;

// Re-export booking hooks for Document & Visa
export {
  useFindAllBookDocumentVisasQuery,
  useFindBookDocumentVisaByIdQuery,
  useUpdateStatusBookDocumentVisaMutation,
  useReviewApplicantFileMutation,
} from "./orders.service";
