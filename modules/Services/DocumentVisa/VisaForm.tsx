"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { documentVisaSchema } from "./schema";
import {
  CreateDocumentVisaPayload,
  DocumentVisaItem,
  useCreateDocumentVisaMutation,
  useFindAllLocationsQuery,
  useFindDocumentVisaCategoriesQuery,
  useUpdateDocumentVisaMutation,
} from "@/store/services/document-visa.service";
import {
  IconArrowLeft,
  IconCheck,
  IconClock,
  IconCurrencyDollar,
  IconFileCertificate,
  IconFileText,
  IconFlag,
  IconFolders,
  IconInfoCircle,
  IconPhoto,
  IconPlus,
  IconSelector,
  IconShieldCheck,
  IconSparkles,
  IconTrash,
  IconWorld,
} from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

// ─── Interfaces & Types ────────────────────────────────────────────────────────

interface I18nText {
  en: string;
  id: string;
  tr: string;
}

interface FormPackageItem {
  id?: string;
  name: I18nText;
  description: I18nText;
  processing_time_days: number | string;
  embassy_fee: number | string;
  service_fee: number | string;
  total_price: number | string;
  is_active: boolean;
  itemLangTab?: "en" | "id" | "tr";
}

interface FormRequirementItem {
  id?: string;
  name: I18nText;
  description: I18nText;
  allowed_file_types: string;
  max_file_size_mb: number | string;
  is_mandatory: boolean;
  example_file_url?: string;
  order_priority: number;
  itemLangTab?: "en" | "id" | "tr";
}

interface VisaFormProps {
  initialData?: DocumentVisaItem | null;
  isEdit?: boolean;
}

// ─── Helper Functions ──────────────────────────────────────────────────────────

const extractI18nRecord = (val: any, fallbackObj?: any): I18nText => {
  if (fallbackObj && typeof fallbackObj === "object") {
    return {
      en: String(fallbackObj.en || fallbackObj.en_US || ""),
      id: String(fallbackObj.id || fallbackObj.id_ID || ""),
      tr: String(fallbackObj.tr || fallbackObj.tr_TR || ""),
    };
  }
  if (!val) return { en: "", id: "", tr: "" };
  if (typeof val === "object") {
    return {
      en: String(val.en || val.en_US || ""),
      id: String(val.id || val.id_ID || ""),
      tr: String(val.tr || val.tr_TR || ""),
    };
  }
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (typeof parsed === "object" && parsed !== null) {
          return {
            en: String(parsed.en || parsed.en_US || ""),
            id: String(parsed.id || parsed.id_ID || ""),
            tr: String(parsed.tr || parsed.tr_TR || ""),
          };
        }
      } catch {
        // Fall back to plain string
      }
    }
    return { en: trimmed, id: trimmed, tr: trimmed };
  }
  return { en: String(val), id: String(val), tr: String(val) };
};

const normalizeVisaType = (raw: string | undefined): string => {
  if (!raw) return "tourist";
  const lower = raw.toLowerCase().replace(/[\s-]/g, "_");
  if (lower.includes("business")) return "business";
  if (lower.includes("student") || lower.includes("study")) return "study";
  if (lower.includes("transit")) return "transit";
  if (lower.includes("umrah") || lower.includes("hajj")) return "umrah_hajj";
  if (lower.includes("renewal") || lower.includes("perpanjang")) return "passport_renewal";
  if (lower.includes("passport") || lower.includes("paspor")) return "passport_new";
  if (lower.includes("other") || lower.includes("working")) return "other";
  return "tourist";
};

const normalizeEntryType = (raw: string | undefined): string => {
  if (!raw) return "single_entry";
  const lower = raw.toLowerCase().replace(/[\s-]/g, "_");
  if (lower.includes("multiple")) return "multiple_entry";
  if (lower.includes("not") || lower.includes("na") || lower.includes("applicable")) return "not_applicable";
  return "single_entry";
};

// Create completely blank package and requirement factories (NO pre-filled dummy values)
const createBlankPackage = (lang: "en" | "id" | "tr" = "en"): FormPackageItem => ({
  name: { en: "", id: "", tr: "" },
  description: { en: "", id: "", tr: "" },
  processing_time_days: "",
  embassy_fee: "",
  service_fee: "",
  total_price: "",
  is_active: true,
  itemLangTab: lang,
});

const createBlankRequirement = (
  order = 1,
  lang: "en" | "id" | "tr" = "en"
): FormRequirementItem => ({
  name: { en: "", id: "", tr: "" },
  description: { en: "", id: "", tr: "" },
  allowed_file_types: "pdf,jpg,jpeg,png",
  max_file_size_mb: 5,
  is_mandatory: true,
  example_file_url: "",
  order_priority: order,
  itemLangTab: lang,
});

// ─── Main Component ───────────────────────────────────────────────────────────

export default function VisaForm({ initialData, isEdit = false }: VisaFormProps) {
  const router = useRouter();

  const [createVisa, { isLoading: isCreating }] = useCreateDocumentVisaMutation();
  const [updateVisa, { isLoading: isUpdating }] = useUpdateDocumentVisaMutation();
  const isSubmitting = isCreating || isUpdating;

  // Master Data Queries
  const { data: categoriesData, isLoading: isLoadingCategories } = useFindDocumentVisaCategoriesQuery();
  const { data: locationsData, isLoading: isLoadingLocations } = useFindAllLocationsQuery();

  const categories = useMemo(() => {
    return categoriesData?.data || (categoriesData as any)?.datas || [];
  }, [categoriesData]);

  const countriesList = useMemo(() => {
    return locationsData?.data || (locationsData as any)?.datas || [];
  }, [locationsData]);

  const [openCountryCombobox, setOpenCountryCombobox] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // ─── General Configuration State ──────────────────────────────────────────
  const [categoryId, setCategoryId] = useState<string>(
    () => initialData?.category_id || initialData?.category?.id || ""
  );
  const [countryId, setCountryId] = useState<string>(
    () => initialData?.country_id || initialData?.country?.id || ""
  );
  const [countryName, setCountryName] = useState<string>(
    () => initialData?.country_name || initialData?.country?.name || ""
  );
  const [countryCode, setCountryCode] = useState<string>(
    () => initialData?.country_code || (initialData?.country as any)?.iso || ""
  );
  const [flagUrl, setFlagUrl] = useState<string>(() => initialData?.flag_url || "");
  const [originCountryId, setOriginCountryId] = useState<string>(
    () => initialData?.origin_country_id || initialData?.origin_country?.id || ""
  );
  const [visaType, setVisaType] = useState<string>(() => normalizeVisaType(initialData?.visa_type));
  const [entryType, setEntryType] = useState<string>(() => normalizeEntryType(initialData?.entry_type));
  const [validityDays, setValidityDays] = useState<number | string>(() =>
    initialData?.validity_days != null ? initialData.validity_days : ""
  );
  const [maxStayDays, setMaxStayDays] = useState<number | string>(() =>
    initialData?.max_stay_days != null ? initialData.max_stay_days : ""
  );
  const [thumbnail, setThumbnail] = useState<string>(() => initialData?.thumbnail || "");
  const [isInterviewRequired, setIsInterviewRequired] = useState<boolean>(
    () => Boolean(initialData?.is_interview_required)
  );
  const [isBiometricRequired, setIsBiometricRequired] = useState<boolean>(
    () => Boolean(initialData?.is_biometric_required)
  );
  const [isActive, setIsActive] = useState<boolean>(() => initialData?.is_active !== false);

  // ─── Active Language Tab for General View ─────────────────────────────────
  const [activeLangTab, setActiveLangTab] = useState<"en" | "id" | "tr">("en");

  // ─── Multi-Language General Translations ─────────────────────────────────
  const enTransInitial = initialData?.translations?.find((t) => t.language_code === "en");
  const idTransInitial = initialData?.translations?.find((t) => t.language_code === "id");
  const trTransInitial = initialData?.translations?.find((t) => t.language_code === "tr");

  const [enTitle, setEnTitle] = useState<string>(
    () => enTransInitial?.title || enTransInitial?.name || initialData?.title || initialData?.name || ""
  );
  const [enDescription, setEnDescription] = useState<string>(
    () => enTransInitial?.description || initialData?.description || ""
  );

  const [idTitle, setIdTitle] = useState<string>(() => idTransInitial?.title || idTransInitial?.name || "");
  const [idDescription, setIdDescription] = useState<string>(() => idTransInitial?.description || "");

  const [trTitle, setTrTitle] = useState<string>(() => trTransInitial?.title || trTransInitial?.name || "");
  const [trDescription, setTrDescription] = useState<string>(() => trTransInitial?.description || "");

  // ─── Packages State (Starts completely blank when creating new) ───────────
  const [packages, setPackages] = useState<FormPackageItem[]>(() => {
    if (initialData?.packages && initialData.packages.length > 0) {
      return initialData.packages.map((p) => {
        const nameRecord = extractI18nRecord(p.name, p.name_i18n);
        const descRecord = extractI18nRecord(p.description, p.description_i18n);
        const emb = p.embassy_fee != null ? Number(p.embassy_fee) : "";
        const srv = p.service_fee != null ? Number(p.service_fee) : "";
        const total = p.total_price != null ? Number(p.total_price) : "";
        return {
          id: p.id,
          name: nameRecord,
          description: descRecord,
          processing_time_days: p.processing_time_days != null ? p.processing_time_days : "",
          embassy_fee: emb,
          service_fee: srv,
          total_price: total,
          is_active: p.is_active !== false,
        };
      });
    }
    // For new create: start with 1 blank package
    return [createBlankPackage("en")];
  });

  // ─── Requirements State (Starts completely blank when creating new) ───────
  const [requirements, setRequirements] = useState<FormRequirementItem[]>(() => {
    const rawReqs =
      (initialData as any)?.requirements_details ||
      (Array.isArray(initialData?.requirements) ? initialData?.requirements : []);

    if (rawReqs.length > 0) {
      return rawReqs.map((r: any, idx: number) => {
        if (typeof r === "string") {
          return {
            name: { en: r, id: r, tr: r },
            description: { en: "", id: "", tr: "" },
            allowed_file_types: "pdf,jpg,jpeg,png",
            max_file_size_mb: 5,
            is_mandatory: true,
            order_priority: idx + 1,
          };
        }
        const nameRecord = extractI18nRecord(r.name, r.name_i18n);
        const descRecord = extractI18nRecord(r.description, r.description_i18n);
        return {
          id: r.id,
          name: nameRecord,
          description: descRecord,
          allowed_file_types: r.allowed_file_types || "pdf,jpg,jpeg,png",
          max_file_size_mb: r.max_file_size_mb != null ? Number(r.max_file_size_mb) : 5,
          is_mandatory: r.is_mandatory !== false,
          example_file_url: r.example_file_url || "",
          order_priority: Number(r.order_priority ?? idx + 1),
        };
      });
    }
    // For new create: start with 1 blank requirement
    return [createBlankRequirement(1, "en")];
  });

  // ─── Populate Edit Data on Change ─────────────────────────────────────────
  useEffect(() => {
    if (initialData) {
      setCategoryId(initialData.category_id || initialData.category?.id || "");
      setCountryId(initialData.country_id || initialData.country?.id || "");
      setCountryName(initialData.country_name || initialData.country?.name || "");
      setCountryCode(initialData.country_code || (initialData.country as any)?.iso || "");
      setFlagUrl(initialData.flag_url || "");
      setOriginCountryId(initialData.origin_country_id || initialData.origin_country?.id || "");
      setVisaType(normalizeVisaType(initialData.visa_type));
      setEntryType(normalizeEntryType(initialData.entry_type));
      setValidityDays(initialData.validity_days != null ? initialData.validity_days : "");
      setMaxStayDays(initialData.max_stay_days != null ? initialData.max_stay_days : "");
      setThumbnail(initialData.thumbnail || "");
      setIsInterviewRequired(Boolean(initialData.is_interview_required));
      setIsBiometricRequired(Boolean(initialData.is_biometric_required));
      setIsActive(initialData.is_active !== false);

      // Populate Translations
      const transList = initialData.translations || [];
      const enTrans = transList.find((t) => t.language_code === "en");
      const idTrans = transList.find((t) => t.language_code === "id");
      const trTrans = transList.find((t) => t.language_code === "tr");

      if (enTrans) {
        setEnTitle(enTrans.title || enTrans.name || initialData.title || initialData.name || "");
        setEnDescription(enTrans.description || initialData.description || "");
      } else {
        setEnTitle(initialData.title || initialData.name || "");
        setEnDescription(initialData.description || "");
      }

      if (idTrans) {
        setIdTitle(idTrans.title || idTrans.name || "");
        setIdDescription(idTrans.description || "");
      }

      if (trTrans) {
        setTrTitle(trTrans.title || trTrans.name || "");
        setTrDescription(trTrans.description || "");
      }

      // Populate Packages
      if (initialData.packages && initialData.packages.length > 0) {
        const loadedPkgs: FormPackageItem[] = initialData.packages.map((p) => {
          const nameRecord = extractI18nRecord(p.name, p.name_i18n);
          const descRecord = extractI18nRecord(p.description, p.description_i18n);
          const emb = p.embassy_fee != null ? Number(p.embassy_fee) : "";
          const srv = p.service_fee != null ? Number(p.service_fee) : "";
          const total = p.total_price != null ? Number(p.total_price) : "";
          return {
            id: p.id,
            name: nameRecord,
            description: descRecord,
            processing_time_days: p.processing_time_days != null ? p.processing_time_days : "",
            embassy_fee: emb,
            service_fee: srv,
            total_price: total,
            is_active: p.is_active !== false,
          };
        });
        setPackages(loadedPkgs);
      }

      // Populate Requirements
      const rawReqs =
        (initialData as any).requirements_details ||
        (Array.isArray(initialData.requirements) ? initialData.requirements : []);

      if (rawReqs.length > 0) {
        const loadedReqs: FormRequirementItem[] = rawReqs.map((r: any, idx: number) => {
          if (typeof r === "string") {
            return {
              name: { en: r, id: r, tr: r },
              description: { en: "", id: "", tr: "" },
              allowed_file_types: "pdf,jpg,jpeg,png",
              max_file_size_mb: 5,
              is_mandatory: true,
              order_priority: idx + 1,
            };
          }
          const nameRecord = extractI18nRecord(r.name, r.name_i18n);
          const descRecord = extractI18nRecord(r.description, r.description_i18n);
          return {
            id: r.id,
            name: nameRecord,
            description: descRecord,
            allowed_file_types: r.allowed_file_types || "pdf,jpg,jpeg,png",
            max_file_size_mb: r.max_file_size_mb != null ? Number(r.max_file_size_mb) : 5,
            is_mandatory: r.is_mandatory !== false,
            example_file_url: r.example_file_url || "",
            order_priority: Number(r.order_priority ?? idx + 1),
          };
        });
        setRequirements(loadedReqs);
      }
    }
  }, [initialData]);

  // Derive Destination Country Display
  const selectedCountry = useMemo(() => {
    return countriesList.find((c: any) => c.id === countryId);
  }, [countriesList, countryId]);

  // Derive Starting Price (calculated from lowest active package price)
  const computedStartingPrice = useMemo(() => {
    const activePrices = packages
      .filter(
        (p) =>
          p.is_active &&
          p.total_price !== "" &&
          p.total_price != null &&
          Number(p.total_price) > 0
      )
      .map((p) => Number(p.total_price));
    if (activePrices.length === 0) return 0;
    return Math.min(...activePrices);
  }, [packages]);

  // ─── Package Handlers ─────────────────────────────────────────────────────

  const handleAddPackage = () => {
    setPackages([...packages, createBlankPackage(activeLangTab)]);
  };

  const handleRemovePackage = (index: number) => {
    setPackages(packages.filter((_, i) => i !== index));
  };

  const handlePackageLangText = (
    index: number,
    lang: "en" | "id" | "tr",
    field: "name" | "description",
    val: string
  ) => {
    const updated = [...packages];
    updated[index] = {
      ...updated[index],
      [field]: {
        ...updated[index][field],
        [lang]: val,
      },
    };
    setPackages(updated);
  };

  const handlePackageNumber = (
    index: number,
    field: "processing_time_days" | "embassy_fee" | "service_fee" | "total_price",
    rawVal: string
  ) => {
    const updated = [...packages];
    const item = { ...updated[index] };

    (item as any)[field] = rawVal;

    // Auto-update total_price when embassy_fee or service_fee changes
    if (field === "embassy_fee" || field === "service_fee") {
      const embStr = field === "embassy_fee" ? rawVal : String(item.embassy_fee || "");
      const srvStr = field === "service_fee" ? rawVal : String(item.service_fee || "");

      if (embStr === "" && srvStr === "") {
        item.total_price = "";
      } else {
        const embNum = embStr === "" ? 0 : Number(embStr);
        const srvNum = srvStr === "" ? 0 : Number(srvStr);
        item.total_price = embNum + srvNum;
      }
    }

    updated[index] = item;
    setPackages(updated);
  };

  const handlePackageActiveToggle = (index: number, checked: boolean) => {
    const updated = [...packages];
    updated[index] = { ...updated[index], is_active: checked };
    setPackages(updated);
  };

  const handlePackageItemTab = (index: number, tab: "en" | "id" | "tr") => {
    const updated = [...packages];
    updated[index] = { ...updated[index], itemLangTab: tab };
    setPackages(updated);
  };

  // ─── Requirement Handlers ─────────────────────────────────────────────────

  const handleAddRequirement = () => {
    setRequirements([
      ...requirements,
      createBlankRequirement(requirements.length + 1, activeLangTab),
    ]);
  };

  const handleRemoveRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const handleRequirementLangText = (
    index: number,
    lang: "en" | "id" | "tr",
    field: "name" | "description",
    val: string
  ) => {
    const updated = [...requirements];
    updated[index] = {
      ...updated[index],
      [field]: {
        ...updated[index][field],
        [lang]: val,
      },
    };
    setRequirements(updated);
  };

  const handleRequirementField = (
    index: number,
    field: keyof FormRequirementItem,
    val: any
  ) => {
    const updated = [...requirements];
    updated[index] = { ...updated[index], [field]: val };
    setRequirements(updated);
  };

  const handleRequirementItemTab = (index: number, tab: "en" | "id" | "tr") => {
    const updated = [...requirements];
    updated[index] = { ...updated[index], itemLangTab: tab };
    setRequirements(updated);
  };

  // ─── Form Submit ──────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ─── 1. Zod Manual Validation ──────────────────────────────────────────
    const validationData = {
      category_id: categoryId,
      country_id: countryId,
      origin_country_id: originCountryId || undefined,
      visa_type: visaType,
      entry_type: entryType,
      validity_days: validityDays !== "" ? validityDays : undefined,
      max_stay_days: maxStayDays !== "" ? maxStayDays : undefined,
      thumbnail: thumbnail.trim() || undefined,
      is_interview_required: isInterviewRequired,
      is_biometric_required: isBiometricRequired,
      is_active: isActive,
      translations: [
        { language_code: "en" as const, title: enTitle.trim(), description: enDescription.trim() },
        { language_code: "id" as const, title: idTitle.trim(), description: idDescription.trim() },
        { language_code: "tr" as const, title: trTitle.trim(), description: trDescription.trim() },
      ],
      packages: packages.map((p) => ({
        id: p.id || undefined,
        name: p.name,
        description: p.description,
        processing_time_days: p.processing_time_days === "" ? 1 : Number(p.processing_time_days),
        embassy_fee: p.embassy_fee === "" ? 0 : Number(p.embassy_fee),
        service_fee: p.service_fee === "" ? 0 : Number(p.service_fee),
        total_price:
          p.total_price !== "" && p.total_price != null ? Number(p.total_price) : undefined,
        is_active: p.is_active,
      })),
      requirements: requirements.map((r, idx) => ({
        id: r.id || undefined,
        name: r.name,
        description: r.description,
        allowed_file_types: r.allowed_file_types.trim() || "pdf,jpg,jpeg,png",
        max_file_size_mb: r.max_file_size_mb === "" ? 5 : Number(r.max_file_size_mb),
        is_mandatory: r.is_mandatory,
        example_file_url: r.example_file_url?.trim() || undefined,
        order_priority: idx + 1,
      })),
    };

    const parseResult = documentVisaSchema.safeParse(validationData);
    if (!parseResult.success) {
      const errMap: Record<string, string> = {};
      parseResult.error.issues.forEach((issue) => {
        const key = issue.path.join(".");
        if (!errMap[key]) {
          errMap[key] = issue.message;
        }
      });
      setFieldErrors(errMap);
      const firstError = parseResult.error.issues[0]?.message || "Please check your form inputs";
      toast.error(firstError);
      return;
    }

    setFieldErrors({});

    // Prepare multi-language translations array
    const fallbackTitle = enTitle.trim() || idTitle.trim() || trTitle.trim();
    const fallbackDesc = enDescription.trim() || idDescription.trim() || trDescription.trim();

    const translations = [
      {
        language_code: "en",
        title: enTitle.trim() || fallbackTitle,
        description: enDescription.trim() || fallbackDesc,
      },
      {
        language_code: "id",
        title: idTitle.trim() || fallbackTitle,
        description: idDescription.trim() || fallbackDesc,
      },
      {
        language_code: "tr",
        title: trTitle.trim() || fallbackTitle,
        description: trDescription.trim() || fallbackDesc,
      },
    ];

    // Prepare Packages array
    const formattedPackages = packages.map((p) => {
      const fallbackPkgName =
        p.name.en.trim() || p.name.id.trim() || p.name.tr.trim() || "Standard Processing";
      const fallbackPkgDesc =
        p.description.en.trim() || p.description.id.trim() || p.description.tr.trim() || "";

      const nameObj = {
        en: p.name.en.trim() || fallbackPkgName,
        id: p.name.id.trim() || fallbackPkgName,
        tr: p.name.tr.trim() || fallbackPkgName,
      };

      const descObj = {
        en: p.description.en.trim() || fallbackPkgDesc,
        id: p.description.id.trim() || fallbackPkgDesc,
        tr: p.description.tr.trim() || fallbackPkgDesc,
      };

      const emb = p.embassy_fee === "" || p.embassy_fee == null ? 0 : Number(p.embassy_fee);
      const srv = p.service_fee === "" || p.service_fee == null ? 0 : Number(p.service_fee);
      const total =
        p.total_price !== undefined && p.total_price !== null && p.total_price !== ""
          ? Number(p.total_price)
          : emb + srv;

      return {
        id: p.id || undefined,
        name: nameObj,
        description: descObj,
        processing_time_days: Math.max(1, Number(p.processing_time_days || 1)),
        embassy_fee: emb,
        service_fee: srv,
        total_price: total,
        is_active: p.is_active,
      };
    });

    // Prepare Requirements array
    const formattedRequirements = requirements.map((r, idx) => {
      const fallbackReqName =
        r.name.en.trim() || r.name.id.trim() || r.name.tr.trim() || "Document Requirement";
      const fallbackReqDesc =
        r.description.en.trim() || r.description.id.trim() || r.description.tr.trim() || "";

      const nameObj = {
        en: r.name.en.trim() || fallbackReqName,
        id: r.name.id.trim() || fallbackReqName,
        tr: r.name.tr.trim() || fallbackReqName,
      };

      const descObj = {
        en: r.description.en.trim() || fallbackReqDesc,
        id: r.description.id.trim() || fallbackReqDesc,
        tr: r.description.tr.trim() || fallbackReqDesc,
      };

      return {
        id: r.id || undefined,
        name: nameObj,
        description: descObj,
        allowed_file_types: r.allowed_file_types.trim() || "pdf,jpg,jpeg,png",
        max_file_size_mb: Math.max(1, Number(r.max_file_size_mb || 5)),
        is_mandatory: r.is_mandatory,
        example_file_url: r.example_file_url?.trim() || undefined,
        order_priority: idx + 1,
      };
    });

    const payload: CreateDocumentVisaPayload = {
      category_id: categoryId,
      country_id: countryId,
      origin_country_id: originCountryId || undefined,
      visa_type: visaType,
      entry_type: entryType,
      validity_days: validityDays ? Number(validityDays) : undefined,
      max_stay_days: maxStayDays ? Number(maxStayDays) : undefined,
      thumbnail: thumbnail.trim() || undefined,
      is_interview_required: isInterviewRequired,
      is_biometric_required: isBiometricRequired,
      starting_price: computedStartingPrice,
      is_active: isActive,
      translations,
      packages: formattedPackages,
      requirements: formattedRequirements,
    };

    try {
      if (isEdit && initialData?.id) {
        await updateVisa({ id: initialData.id, data: payload }).unwrap();
        toast.success("Visa service updated successfully");
      } else {
        await createVisa(payload).unwrap();
        toast.success("Visa service created successfully");
      }
      router.push("/dashboard/services/document-visa");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save visa service");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-16">
      {/* ─── 1. Header Action Bar ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-3.5 sm:px-5 sm:py-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            asChild
            className="size-8.5 rounded-lg border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-2xs">
            <Link href="/dashboard/services/document-visa">
              <IconArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                Document & Visa Services
              </span>
              <Badge
                variant="outline"
                className={`text-[10px] font-semibold px-2 py-0.5 ${
                  isEdit
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}>
                {isEdit ? "Update Mode" : "New Service Package"}
              </Badge>
            </div>
            <h1 className="text-xl font-bold text-slate-900 leading-snug pt-0.5">
              {isEdit
                ? `Edit Visa: ${enTitle || countryName || "Details"}`
                : "Create New Document & Visa Service"}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            asChild
            className="h-8.5 text-xs font-semibold text-slate-700 border-slate-200 bg-white hover:bg-slate-50">
            <Link href="/dashboard/services/document-visa">Cancel</Link>
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting}
            className="h-8.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold gap-1.5 shadow-sm hover:shadow-md transition-all min-w-32.5">
            {isSubmitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <IconCheck className="size-4" />
                <span>{isEdit ? "Save Changes" : "Publish Visa Service"}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ─── 2. Main Grid Layout ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ─── Left Column: Core Setup, Category & Rules (5 Cols) ───────────── */}
        <div className="lg:col-span-5 space-y-5">
          {/* Card 1: Destination & Classification */}
          <Card className="border-slate-200/80 shadow-xs bg-white py-0 gap-0 overflow-hidden">
            <CardHeader className="px-5 py-3.5 border-b border-slate-100 [.border-b]:pb-3.5 flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                <IconFileCertificate className="size-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">
                  Classification & Destination
                </CardTitle>
                <CardDescription className="text-[11px] text-slate-500">
                  Target destination country, visa category, and issuance rules.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-3.5">
              {/* Category Select */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  Document / Visa Category <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={categoryId}
                  onValueChange={(val) => {
                    setCategoryId(val);
                    if (fieldErrors.category_id) {
                      setFieldErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.category_id;
                        return copy;
                      });
                    }
                  }}>
                  <SelectTrigger
                    className={cn(
                      "h-9 text-xs bg-slate-50/50 border-slate-200",
                      fieldErrors.category_id && "border-rose-500 ring-1 ring-rose-500"
                    )}>
                    <SelectValue placeholder={isLoadingCategories ? "Loading categories..." : "Select category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id} className="text-xs">
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.category_id && (
                  <p className="text-[11px] font-medium text-rose-500">{fieldErrors.category_id}</p>
                )}
              </div>

              {/* Destination Country Combobox */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  Destination Country <span className="text-rose-500">*</span>
                </Label>
                <Popover open={openCountryCombobox} onOpenChange={setOpenCountryCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCountryCombobox}
                      className={cn(
                        "w-full h-9 justify-between text-xs font-normal bg-slate-50/50 border-slate-200",
                        !countryId && "text-slate-400",
                        fieldErrors.country_id && "border-rose-500 ring-1 ring-rose-500"
                      )}>
                      <span className="flex items-center gap-2 truncate">
                        {selectedCountry ? (
                          <>
                            <span className="font-medium text-slate-900">{selectedCountry.name}</span>
                            {selectedCountry.iso && (
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1 py-0 uppercase font-mono text-slate-500">
                                {selectedCountry.iso}
                              </Badge>
                            )}
                          </>
                        ) : countryName ? (
                          <span>{countryName}</span>
                        ) : (
                          "Select destination country"
                        )}
                      </span>
                      <IconSelector className="size-4 text-slate-400 shrink-0 ml-1" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[320px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search destination country..." className="h-8.5 text-xs" />
                      <CommandList className="max-h-60 overflow-y-auto">
                        <CommandEmpty className="py-2 text-center text-xs text-slate-500">
                          No country found.
                        </CommandEmpty>
                        <CommandGroup heading="Available Countries">
                          {countriesList.map((country: any) => (
                            <CommandItem
                              key={country.id}
                              value={`${country.name} ${country.iso || ""}`}
                              onSelect={() => {
                                setCountryId(country.id);
                                setCountryName(country.name);
                                setCountryCode(country.iso || "");
                                if (country.flag) setFlagUrl(country.flag);
                                setOpenCountryCombobox(false);
                                if (fieldErrors.country_id) {
                                  setFieldErrors((prev) => {
                                    const copy = { ...prev };
                                    delete copy.country_id;
                                    return copy;
                                  });
                                }
                              }}
                              className="cursor-pointer text-xs font-normal py-1.5 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <IconCheck
                                  className={cn(
                                    "size-3.5",
                                    country.id === countryId ? "opacity-100 text-blue-600" : "opacity-0"
                                  )}
                                />
                                <span>{country.name}</span>
                              </div>
                              {country.iso && (
                                <span className="font-mono text-[10px] text-slate-400 uppercase">
                                  {country.iso}
                                </span>
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {fieldErrors.country_id && (
                  <p className="text-[11px] font-medium text-rose-500">{fieldErrors.country_id}</p>
                )}
              </div>

              {/* Passport Origin Country (Optional) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-slate-700">
                    Applicant Passport Origin
                  </Label>
                  <span className="text-[10px] text-slate-400">Optional</span>
                </div>
                <Select
                  value={originCountryId || "all"}
                  onValueChange={(val) => setOriginCountryId(val === "all" ? "" : val)}>
                  <SelectTrigger className="h-9 text-xs bg-slate-50/50 border-slate-200">
                    <SelectValue placeholder="All Nationalities (Global Default)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs font-medium text-blue-600">
                      All Nationalities / Standard Indonesia
                    </SelectItem>
                    {countriesList.map((c: any) => (
                      <SelectItem key={c.id} value={c.id} className="text-xs">
                        {c.name} ({c.iso})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Visa Type & Entry Classification */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Visa Classification</Label>
                  <Select value={visaType} onValueChange={(val) => setVisaType(val)}>
                    <SelectTrigger className="h-9 text-xs bg-slate-50/50 border-slate-200">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tourist" className="text-xs">Tourist Visa</SelectItem>
                      <SelectItem value="business" className="text-xs">Business Visa</SelectItem>
                      <SelectItem value="study" className="text-xs">Study / Student Visa</SelectItem>
                      <SelectItem value="transit" className="text-xs">Transit Visa</SelectItem>
                      <SelectItem value="umrah_hajj" className="text-xs">Umrah & Hajj</SelectItem>
                      <SelectItem value="passport_new" className="text-xs">New Passport</SelectItem>
                      <SelectItem value="passport_renewal" className="text-xs">Passport Renewal</SelectItem>
                      <SelectItem value="other" className="text-xs">Other Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Entry Classification</Label>
                  <Select value={entryType} onValueChange={(val) => setEntryType(val)}>
                    <SelectTrigger className="h-9 text-xs bg-slate-50/50 border-slate-200">
                      <SelectValue placeholder="Select entry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single_entry" className="text-xs">Single Entry</SelectItem>
                      <SelectItem value="multiple_entry" className="text-xs">Multiple Entry</SelectItem>
                      <SelectItem value="not_applicable" className="text-xs">Not Applicable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Validity & Stay Duration */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Validity (Days)</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="e.g. 30, 90, 365"
                    value={validityDays}
                    onChange={(e) => setValidityDays(e.target.value)}
                    className="h-9 text-xs bg-slate-50/50 border-slate-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Max Stay (Days)</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="e.g. 15, 30, 90"
                    value={maxStayDays}
                    onChange={(e) => setMaxStayDays(e.target.value)}
                    className="h-9 text-xs bg-slate-50/50 border-slate-200"
                  />
                </div>
              </div>

              {/* Special Consular Conditions & Visibility Switches */}
              <div className="rounded-lg border border-slate-200/90 bg-slate-50/60 p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-semibold text-slate-800">Interview Required</Label>
                    <p className="text-[10px] text-slate-500">
                      Applicant must attend consular or embassy interview
                    </p>
                  </div>
                  <Switch
                    checked={isInterviewRequired}
                    onCheckedChange={setIsInterviewRequired}
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-semibold text-slate-800">Biometric Required</Label>
                    <p className="text-[10px] text-slate-500">
                      Fingerprints or photo session required at VAC / VFS
                    </p>
                  </div>
                  <Switch
                    checked={isBiometricRequired}
                    onCheckedChange={setIsBiometricRequired}
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-semibold text-slate-800">Service Active</Label>
                    <p className="text-[10px] text-slate-500">
                      Display publicly in traveler catalog and search
                    </p>
                  </div>
                  <Switch
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Visual Media & Destination Banner */}
          <Card className="border-slate-200/80 shadow-xs bg-white py-0 gap-0 overflow-hidden">
            <CardHeader className="px-5 py-3.5 border-b border-slate-100 [.border-b]:pb-3.5 flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-amber-50 text-amber-600">
                <IconPhoto className="size-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">Visual Destination Banner</CardTitle>
                <CardDescription className="text-[11px] text-slate-500">
                  Hero image representation for the visa service card.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-3.5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Country Banner Image URL</Label>
                <Input
                  placeholder="https://images.unsplash.com/photo-..."
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  className="h-9 text-xs bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500"
                />
                {thumbnail && (
                  <div className="relative mt-2 aspect-video w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-2xs">
                    <img
                      src={thumbnail}
                      alt="Visa Destination Banner"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80";
                      }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Dynamic Price Overview Card */}
          <Card className="border-blue-200/70 shadow-xs bg-linear-to-br from-blue-50/60 to-indigo-50/40 py-0 gap-0 overflow-hidden">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                  Calculated Starting Price
                </span>
                <p className="text-xs text-slate-600">
                  Derived from lowest active package option
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold font-mono text-blue-700">
                  ${computedStartingPrice.toLocaleString()}
                </span>
                <span className="block text-[10px] text-slate-400">USD / applicant</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ─── Right Column: Multi-Language Content, Packages & Requirements (7 Cols) ─ */}
        <div className="lg:col-span-7 space-y-5">
          {/* Section 1: General Visa Content & Guidelines */}
          <Card className="border-slate-200/80 shadow-xs bg-white py-0 gap-0 overflow-hidden">
            <CardHeader className="px-5 py-3.5 border-b border-slate-100 [.border-b]:pb-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-md bg-purple-50 text-purple-600">
                  <IconFileCertificate className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">
                    Multilingual Content & Guidelines
                  </CardTitle>
                  <CardDescription className="text-[11px] text-slate-500">
                    Visa service title and description guidelines across supported languages.
                  </CardDescription>
                </div>
              </div>

              {/* Language Switcher Tabs */}
              <Tabs
                value={activeLangTab}
                onValueChange={(val) => setActiveLangTab(val as "en" | "id" | "tr")}
                className="w-fit">
                <TabsList className="bg-slate-100 p-0.5 rounded-lg h-7.5">
                  <TabsTrigger
                    value="en"
                    className="text-xs font-semibold px-2.5 py-0.5 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-2xs rounded-md">
                    English (EN)
                  </TabsTrigger>
                  <TabsTrigger
                    value="id"
                    className="text-xs font-semibold px-2.5 py-0.5 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-2xs rounded-md">
                    Indonesia (ID)
                  </TabsTrigger>
                  <TabsTrigger
                    value="tr"
                    className="text-xs font-semibold px-2.5 py-0.5 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-2xs rounded-md">
                    Turkish (TR)
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              {fieldErrors.translations && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium">
                  {fieldErrors.translations}
                </div>
              )}
              {/* 1. English Fields */}
              {activeLangTab === "en" && (
                <div className="space-y-3.5 animate-in fade-in-50 duration-150">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      Service Title (English) <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      placeholder="e.g. Japan Single Entry Tourist Visa Assistance"
                      value={enTitle}
                      onChange={(e) => setEnTitle(e.target.value)}
                      className="h-9 text-xs bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      Service Description & Guidelines (English)
                    </Label>
                    <Textarea
                      placeholder="Describe application procedures, consular guidelines, and applicant qualifications..."
                      rows={4}
                      value={enDescription}
                      onChange={(e) => setEnDescription(e.target.value)}
                      className="text-xs bg-slate-50/50 border-slate-200 leading-relaxed resize-y focus-visible:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* 2. Indonesian Fields */}
              {activeLangTab === "id" && (
                <div className="space-y-3.5 animate-in fade-in-50 duration-150">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      Nama Layanan Visa (Bahasa Indonesia) <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      placeholder="contoh: Jasa Pengurusan Visa Turis Jepang (Single Entry)"
                      value={idTitle}
                      onChange={(e) => setIdTitle(e.target.value)}
                      className="h-9 text-xs bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      Deskripsi Layanan (Bahasa Indonesia)
                    </Label>
                    <Textarea
                      placeholder="Jelaskan alur pengurusan, syarat kelayakan, serta panduan kedutaan..."
                      rows={4}
                      value={idDescription}
                      onChange={(e) => setIdDescription(e.target.value)}
                      className="text-xs bg-slate-50/50 border-slate-200 leading-relaxed resize-y focus-visible:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* 3. Turkish Fields */}
              {activeLangTab === "tr" && (
                <div className="space-y-3.5 animate-in fade-in-50 duration-150">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      Vize Hizmet Başlığı (Türkçe) <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      placeholder="Örn: Japonya Tek Girişli Turist Vizesi Danışmanlığı"
                      value={trTitle}
                      onChange={(e) => setTrTitle(e.target.value)}
                      className="h-9 text-xs bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      Hizmet Açıklaması (Türkçe)
                    </Label>
                    <Textarea
                      placeholder="Başvuru kurallarını, konsolosluk politikalarını açıklayınız..."
                      rows={4}
                      value={trDescription}
                      onChange={(e) => setTrDescription(e.target.value)}
                      className="text-xs bg-slate-50/50 border-slate-200 leading-relaxed resize-y focus-visible:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ─── Section 2: Packages Management (Multi-Language UX) ─────────── */}
          <Card className="border-slate-200/80 shadow-xs bg-white py-0 gap-0 overflow-hidden">
            <CardHeader className="px-5 py-3.5 border-b border-slate-100 [.border-b]:pb-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
                  <IconFolders className="size-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-bold text-slate-900">
                      Service Packages & Processing Options
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-600">
                      {packages.length} {packages.length === 1 ? "Option" : "Options"}
                    </Badge>
                  </div>
                  <CardDescription className="text-[11px] text-slate-500">
                    Tiered pricing, embassy fees, service fees, and multilingual descriptions.
                  </CardDescription>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddPackage}
                className="h-8 text-xs font-semibold text-emerald-600 border-emerald-200 bg-emerald-50/40 hover:bg-emerald-100/60 hover:text-emerald-700 gap-1 self-start sm:self-auto">
                <IconPlus className="size-3.5" />
                Add Package
              </Button>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              {fieldErrors.packages && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium">
                  {fieldErrors.packages}
                </div>
              )}
              {packages.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-center">
                  <div className="size-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                    <IconFolders className="size-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-800">No service packages added</p>
                  <p className="text-[11px] text-slate-500 mb-3 max-w-xs">
                    Define package options to set up application fees and processing times.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddPackage}
                    className="h-8 text-xs font-semibold text-emerald-600 border-emerald-200 hover:bg-emerald-50 gap-1">
                    <IconPlus className="size-3.5" />
                    Add First Package
                  </Button>
                </div>
              ) : (
                packages.map((pkg, idx) => {
                  const itemLang = pkg.itemLangTab || activeLangTab;
                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-200 bg-slate-50/30 p-4 space-y-3.5 transition-all hover:border-slate-300">
                      {/* Package Card Top Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
                        <div className="flex items-center gap-2.5">
                          <span className="flex size-6 items-center justify-center rounded-md bg-emerald-600 text-white font-bold text-xs">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {pkg.name[itemLang] || pkg.name.en || `Package Option #${idx + 1}`}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <Label className="text-[11px] font-medium text-slate-600">Active</Label>
                            <Switch
                              checked={pkg.is_active}
                              onCheckedChange={(checked) => handlePackageActiveToggle(idx, checked)}
                            />
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemovePackage(idx)}
                            className="size-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Remove package">
                            <IconTrash className="size-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Language Switcher for this package */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-slate-600">
                          Language Content:
                        </span>
                        <Tabs
                          value={itemLang}
                          onValueChange={(val) =>
                            handlePackageItemTab(idx, val as "en" | "id" | "tr")
                          }
                          className="w-fit">
                          <TabsList className="bg-slate-100 p-0.5 rounded-lg h-7.5">
                            <TabsTrigger
                              value="en"
                              className="text-xs font-semibold px-2.5 py-0.5 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-2xs rounded-md">
                              English (EN)
                            </TabsTrigger>
                            <TabsTrigger
                              value="id"
                              className="text-xs font-semibold px-2.5 py-0.5 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-2xs rounded-md">
                              Indonesia (ID)
                            </TabsTrigger>
                            <TabsTrigger
                              value="tr"
                              className="text-xs font-semibold px-2.5 py-0.5 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-2xs rounded-md">
                              Turkish (TR)
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>

                      {/* Localized Name & Description Inputs */}
                      <div className="space-y-2.5">
                        <div className="space-y-1">
                          <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                            Package Name ({itemLang.toUpperCase()}) <span className="text-rose-500">*</span>
                          </Label>
                          <Input
                            placeholder={
                              itemLang === "en"
                                ? "e.g. Standard Processing (5 - 7 Days)"
                                : itemLang === "id"
                                ? "contoh: Pengurusan Reguler (5 - 7 Hari)"
                                : "Örn: Standart İşlem (5 - 7 Gün)"
                            }
                            value={pkg.name[itemLang] || ""}
                            onChange={(e) =>
                              handlePackageLangText(idx, itemLang, "name", e.target.value)
                            }
                            className="h-8.5 text-xs bg-white border-slate-200 focus-visible:ring-blue-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs font-semibold text-slate-700">
                            Package Description ({itemLang.toUpperCase()})
                          </Label>
                          <Input
                            placeholder={
                              itemLang === "en"
                                ? "e.g. Full consular review, schedule slot booking, fast turnaround"
                                : itemLang === "id"
                                ? "contoh: Pengecekan berkas, booking slot kedutaan, panduan wawancara"
                                : "Örn: Belge kontrolü, randevu alma ve başvuru takibi"
                            }
                            value={pkg.description[itemLang] || ""}
                            onChange={(e) =>
                              handlePackageLangText(idx, itemLang, "description", e.target.value)
                            }
                            className="h-8.5 text-xs bg-white border-slate-200 focus-visible:ring-blue-500"
                          />
                        </div>
                      </div>

                      {/* Fees & Processing Time Matrix */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-200/60 bg-white p-3 rounded-lg border">
                        <div className="space-y-1">
                          <Label className="text-[11px] font-semibold text-slate-600">
                            Processing (Days)
                          </Label>
                          <Input
                            type="number"
                            min="1"
                            placeholder="e.g. 5"
                            value={pkg.processing_time_days}
                            onChange={(e) =>
                              handlePackageNumber(idx, "processing_time_days", e.target.value)
                            }
                            className="h-8 text-xs font-mono font-medium"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[11px] font-semibold text-slate-600">
                            Embassy Fee ($)
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            step="any"
                            placeholder="0.00"
                            value={pkg.embassy_fee}
                            onChange={(e) =>
                              handlePackageNumber(idx, "embassy_fee", e.target.value)
                            }
                            className="h-8 text-xs font-mono font-medium"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[11px] font-semibold text-slate-600">
                            Service Fee ($)
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            step="any"
                            placeholder="0.00"
                            value={pkg.service_fee}
                            onChange={(e) =>
                              handlePackageNumber(idx, "service_fee", e.target.value)
                            }
                            className="h-8 text-xs font-mono font-medium"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <Label className="text-[11px] font-bold text-blue-700">Total ($)</Label>
                            <span className="text-[9px] text-slate-400 font-medium">Auto</span>
                          </div>
                          <Input
                            type="number"
                            min="0"
                            step="any"
                            placeholder="0.00"
                            value={pkg.total_price}
                            onChange={(e) =>
                              handlePackageNumber(idx, "total_price", e.target.value)
                            }
                            className="h-8 text-xs font-mono font-bold text-blue-700 bg-blue-50/40 border-blue-200"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* ─── Section 3: Requirements Checklist (Multi-Language UX) ──────── */}
          <Card className="border-slate-200/80 shadow-xs bg-white py-0 gap-0 overflow-hidden">
            <CardHeader className="px-5 py-3.5 border-b border-slate-100 [.border-b]:pb-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                  <IconFileText className="size-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-bold text-slate-900">
                      Required Documents Checklist
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-600">
                      {requirements.length} {requirements.length === 1 ? "Doc" : "Docs"}
                    </Badge>
                  </div>
                  <CardDescription className="text-[11px] text-slate-500">
                    Specify mandatory and optional documents needed from visa applicants.
                  </CardDescription>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddRequirement}
                className="h-8 text-xs font-semibold text-blue-600 border-blue-200 bg-blue-50/40 hover:bg-blue-100/60 hover:text-blue-700 gap-1 self-start sm:self-auto">
                <IconPlus className="size-3.5" />
                Add Document
              </Button>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              {fieldErrors.requirements && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium">
                  {fieldErrors.requirements}
                </div>
              )}
              {requirements.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-center">
                  <div className="size-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                    <IconFileText className="size-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-800">No requirement documents added</p>
                  <p className="text-[11px] text-slate-500 mb-3 max-w-xs">
                    Add required document items that applicants must prepare and upload.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddRequirement}
                    className="h-8 text-xs font-semibold text-blue-600 border-blue-200 hover:bg-blue-50 gap-1">
                    <IconPlus className="size-3.5" />
                    Add First Document
                  </Button>
                </div>
              ) : (
                requirements.map((req, idx) => {
                  const itemLang = req.itemLangTab || activeLangTab;
                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-200 bg-slate-50/30 p-4 space-y-3.5 transition-all hover:border-slate-300">
                      {/* Requirement Card Top Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
                        <div className="flex items-center gap-2.5">
                          <span className="flex size-6 items-center justify-center rounded-md bg-blue-600 text-white font-bold text-xs">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {req.name[itemLang] || req.name.en || `Document #${idx + 1}`}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <Label className="text-[11px] font-medium text-slate-600">
                              {req.is_mandatory ? "Mandatory" : "Optional"}
                            </Label>
                            <Switch
                              checked={req.is_mandatory}
                              onCheckedChange={(checked) =>
                                handleRequirementField(idx, "is_mandatory", checked)
                              }
                            />
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveRequirement(idx)}
                            className="size-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Remove document">
                            <IconTrash className="size-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Language Switcher for this requirement */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-slate-600">
                          Language Content:
                        </span>
                        <Tabs
                          value={itemLang}
                          onValueChange={(val) =>
                            handleRequirementItemTab(idx, val as "en" | "id" | "tr")
                          }
                          className="w-fit">
                          <TabsList className="bg-slate-100 p-0.5 rounded-lg h-7.5">
                            <TabsTrigger
                              value="en"
                              className="text-xs font-semibold px-2.5 py-0.5 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-2xs rounded-md">
                              English (EN)
                            </TabsTrigger>
                            <TabsTrigger
                              value="id"
                              className="text-xs font-semibold px-2.5 py-0.5 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-2xs rounded-md">
                              Indonesia (ID)
                            </TabsTrigger>
                            <TabsTrigger
                              value="tr"
                              className="text-xs font-semibold px-2.5 py-0.5 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-2xs rounded-md">
                              Turkish (TR)
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>

                      {/* Localized Document Name & Requirements Notes */}
                      <div className="space-y-2.5">
                        <div className="space-y-1">
                          <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                            Document Title ({itemLang.toUpperCase()}) <span className="text-rose-500">*</span>
                          </Label>
                          <Input
                            placeholder={
                              itemLang === "en"
                                ? "e.g. Original Passport Scan"
                                : itemLang === "id"
                                ? "contoh: Scan Paspor Asli (Halaman Biodata)"
                                : "Örn: Pasaport Biyometrik Sayfası Taraması"
                            }
                            value={req.name[itemLang] || ""}
                            onChange={(e) =>
                              handleRequirementLangText(idx, itemLang, "name", e.target.value)
                            }
                            className="h-8.5 text-xs bg-white border-slate-200 focus-visible:ring-blue-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs font-semibold text-slate-700">
                            Document Specification Notes ({itemLang.toUpperCase()})
                          </Label>
                          <Input
                            placeholder={
                              itemLang === "en"
                                ? "e.g. Valid min. 6 months with at least 2 consecutive blank pages"
                                : itemLang === "id"
                                ? "contoh: Masa berlaku min. 6 bulan dengan minimal 2 halaman kosong"
                                : "Örn: En az 6 ay geçerli ve 2 boş vize sayfası bulunmalıdır"
                            }
                            value={req.description[itemLang] || ""}
                            onChange={(e) =>
                              handleRequirementLangText(idx, itemLang, "description", e.target.value)
                            }
                            className="h-8.5 text-xs bg-white border-slate-200 focus-visible:ring-blue-500"
                          />
                        </div>
                      </div>

                      {/* File Attachment Rules Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-200/60 bg-white p-3 rounded-lg border">
                        <div className="space-y-1">
                          <Label className="text-[11px] font-semibold text-slate-600">
                            Allowed Types
                          </Label>
                          <Input
                            placeholder="pdf,jpg,png"
                            value={req.allowed_file_types}
                            onChange={(e) =>
                              handleRequirementField(idx, "allowed_file_types", e.target.value)
                            }
                            className="h-8 text-xs font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[11px] font-semibold text-slate-600">
                            Max Size (MB)
                          </Label>
                          <Input
                            type="number"
                            min="1"
                            max="50"
                            placeholder="5"
                            value={req.max_file_size_mb}
                            onChange={(e) =>
                              handleRequirementField(
                                idx,
                                "max_file_size_mb",
                                e.target.value === "" ? "" : Math.max(1, Number(e.target.value))
                              )
                            }
                            className="h-8 text-xs font-mono font-medium"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[11px] font-semibold text-slate-600">
                            Template / Sample URL
                          </Label>
                          <Input
                            placeholder="https://..."
                            value={req.example_file_url || ""}
                            onChange={(e) =>
                              handleRequirementField(idx, "example_file_url", e.target.value)
                            }
                            className="h-8 text-xs text-slate-600"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
