import { type ClassValue, clsx } from "clsx";
import { Metadata } from "next";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateAvatarFallback(string: string) {
  const names = string.split(" ").filter((name: string) => name);
  const mapped = names.map((name: string) => name.charAt(0).toUpperCase());

  return mapped.join("");
}

export function generateMeta({
  title,
  description,
}: {
  title: string;
  description: string;
}): Metadata {
  return {
    title: `${title} - Pacific Travelindo`,
    description: description,
    openGraph: {
      images: [`/seo.jpg`]
    }
  };
}

export function formatMultilingual(val: any, lang: string = "id"): string {
  if (val === null || val === undefined) return "";
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmed);
        return formatMultilingual(parsed, lang);
      } catch {
        return val;
      }
    }
    return val;
  }
  if (typeof val === "number") return String(val);
  if (typeof val === "object") {
    if (val[lang]) return String(val[lang]);
    if (val.id) return String(val.id);
    if (val.en) return String(val.en);
    if (val.tr) return String(val.tr);
    const first = Object.values(val)[0];
    if (first && typeof first !== "object") return String(first);
    return "";
  }
  return String(val || "");
}
