import { generateMeta } from "@/lib/utils";
import { Metadata } from "next";
import EditMotorView from "../../edit-motor-view";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "Edit Motorcycle",
    description: "Update motorcycle details, specifications, and rental pricing.",
  });
}

export default function EditMotorcyclePage() {
  return <EditMotorView />;
}
