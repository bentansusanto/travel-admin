"use client";

import { Button } from "@/components/ui/button";
import { useFindVisaByIdQuery } from "@/store/services/visa.service";
import { IconAlertTriangle, IconArrowLeft } from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import VisaForm from "./VisaForm";

export default function EditVisaView() {
  const params = useParams();
  const id = params?.id as string;

  const {
    data: visaData,
    isLoading,
    error,
  } = useFindVisaByIdQuery(id, {
    skip: !id,
  });

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="size-8 animate-spin text-blue-600" />
        <p className="text-xs font-medium">Loading visa service details...</p>
      </div>
    );
  }

  if (error || !visaData?.data) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <IconAlertTriangle className="size-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900">Visa Service Not Found</h2>
          <p className="max-w-sm text-xs text-slate-500">
            We were unable to locate the visa service item with the specified ID.
          </p>
        </div>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="mt-2 h-9 gap-1.5 text-xs font-semibold">
          <Link href="/dashboard/services/document-visa">
            <IconArrowLeft className="size-4" />
            Back to Visa Services
          </Link>
        </Button>
      </div>
    );
  }

  return <VisaForm initialData={visaData.data} isEdit={true} />;
}
