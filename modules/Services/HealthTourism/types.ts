export interface HealthPackageItem {
  id: string;
  title: string;
  facility: string;
  category: "Medical Checkup" | "Dental Care" | "Aesthetic & Dermatology" | "Wellness & Thermal Spa" | "Eye Care";
  city: string;
  country: string;
  duration: string;
  inclusions: string[];
  price: number;
  rating: number;
  thumbnail: string;
  status: "Active" | "Temporarily Unavailable";
}
