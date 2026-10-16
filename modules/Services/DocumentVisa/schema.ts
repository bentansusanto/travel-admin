import { z } from "zod";

// ─── Multi-Language Object Schema ──────────────────────────────────────────────
export const i18nStringSchema = z.object({
  en: z.string().default(""),
  id: z.string().default(""),
  tr: z.string().default(""),
});

// ─── Package Item Schema ───────────────────────────────────────────────────────
export const documentVisaPackageSchema = z.object({
  id: z.string().optional(),
  name: i18nStringSchema.refine(
    (val) => Boolean(val.en.trim() || val.id.trim() || val.tr.trim()),
    { message: "Package name is required in at least one language" }
  ),
  description: i18nStringSchema.optional().default({ en: "", id: "", tr: "" }),
  processing_time_days: z.coerce
    .number({ invalid_type_error: "Processing time must be a number" })
    .min(1, "Processing time must be at least 1 day"),
  embassy_fee: z.coerce
    .number({ invalid_type_error: "Embassy fee must be a number" })
    .min(0, "Embassy fee cannot be negative")
    .default(0),
  service_fee: z.coerce
    .number({ invalid_type_error: "Service fee must be a number" })
    .min(0, "Service fee cannot be negative")
    .default(0),
  total_price: z.coerce
    .number({ invalid_type_error: "Total price must be a number" })
    .min(0, "Total price cannot be negative")
    .optional(),
  is_active: z.boolean().default(true),
});

// ─── Requirement Item Schema ───────────────────────────────────────────────────
export const documentVisaRequirementSchema = z.object({
  id: z.string().optional(),
  name: i18nStringSchema.refine(
    (val) => Boolean(val.en.trim() || val.id.trim() || val.tr.trim()),
    { message: "Requirement document name is required in at least one language" }
  ),
  description: i18nStringSchema.optional().default({ en: "", id: "", tr: "" }),
  allowed_file_types: z.string().min(1, "Allowed file types is required"),
  max_file_size_mb: z.coerce
    .number({ invalid_type_error: "Max file size must be a number" })
    .min(1, "Max file size must be at least 1 MB"),
  is_mandatory: z.boolean().default(true),
  example_file_url: z.string().optional(),
  order_priority: z.coerce.number().optional().default(1),
});

// ─── Main Document Visa Schema ────────────────────────────────────────────────
export const documentVisaSchema = z.object({
  category_id: z.string().min(1, "Please select a document / visa category"),
  country_id: z.string().min(1, "Please select a destination country"),
  origin_country_id: z.string().optional(),
  visa_type: z.enum(
    [
      "tourist",
      "business",
      "study",
      "transit",
      "umrah_hajj",
      "passport_new",
      "passport_renewal",
      "other",
    ],
    { required_error: "Please select visa classification" }
  ),
  entry_type: z.enum(["single_entry", "multiple_entry", "not_applicable"], {
    required_error: "Please select entry classification",
  }),
  validity_days: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number().positive("Validity days must be greater than 0").optional()
  ),
  max_stay_days: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number().positive("Max stay days must be greater than 0").optional()
  ),
  thumbnail: z.string().optional(),
  is_interview_required: z.boolean().default(false),
  is_biometric_required: z.boolean().default(false),
  is_active: z.boolean().default(true),

  // Multi-language service titles and descriptions
  translations: z
    .array(
      z.object({
        language_code: z.enum(["en", "id", "tr"]),
        title: z.string().default(""),
        description: z.string().default(""),
      })
    )
    .refine(
      (items) => items.some((t) => t.title && t.title.trim().length > 0),
      { message: "Please provide a visa service title in at least one language" }
    ),

  // Packages list
  packages: z
    .array(documentVisaPackageSchema)
    .min(1, "Please configure at least one service package"),

  // Requirements list
  requirements: z
    .array(documentVisaRequirementSchema)
    .min(1, "Please configure at least one requirement document"),
});

export type DocumentVisaFormSchemaType = z.infer<typeof documentVisaSchema>;
export type DocumentVisaPackageSchemaType = z.infer<typeof documentVisaPackageSchema>;
export type DocumentVisaRequirementSchemaType = z.infer<typeof documentVisaRequirementSchema>;
