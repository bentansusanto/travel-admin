import { generateMeta } from "@/lib/utils";
import { RegisterPage } from "@/modules/Authentication/Register/RegisterPage";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "Register Admin - Pacific Travelindo",
    description: "Create an administrator account for Pacific Travelindo internal management portal."
  });
}

export default function Register() {
  return <RegisterPage />;
}
