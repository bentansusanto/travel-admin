import { generateMeta } from "@/lib/utils";
import MotorForm from "@/modules/Motorcycle/MotorForm";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "Add Motorcycle",
    description: "Register a new motorcycle model, brand, specifications, and rental pricing.",
  });
}

export default function CreateMotorcyclePage() {
  return <MotorForm isEdit={false} />;
}
