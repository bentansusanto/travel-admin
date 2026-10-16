"use client";

import { Button } from "@/components/ui/button";
import { useFindMotorByIdQuery } from "@/store/services/motor.service";
import { IconAlertTriangle, IconArrowLeft } from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import MotorForm from "@/modules/Motorcycle/MotorForm";

export default function EditMotorView() {
  const params = useParams();
  const id = params?.id as string;

  const { data: motorData, isLoading, error } = useFindMotorByIdQuery(id, {
    skip: !id,
  });

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="size-8 animate-spin text-blue-600" />
        <p className="text-xs font-medium">Loading motorcycle specifications & details...</p>
      </div>
    );
  }

  if (error || !motorData?.data) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <IconAlertTriangle className="size-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900">Motorcycle Not Found</h2>
          <p className="text-xs text-slate-500 max-w-sm">
            We were unable to locate the motorcycle with the specified ID. It may have been deleted or the ID is invalid.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="h-9 text-xs font-semibold gap-1.5 mt-2">
          <Link href="/dashboard/services/rent-motor">
            <IconArrowLeft className="size-4" />
            Back to Rent Motorcycles
          </Link>
        </Button>
      </div>
    );
  }

  return <MotorForm key={motorData.data.id} initialData={motorData.data} isEdit={true} />;
}
