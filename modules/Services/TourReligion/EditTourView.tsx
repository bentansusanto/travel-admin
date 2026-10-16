"use client";

import { Button } from "@/components/ui/button";
import { useFindDestinationByIdQuery } from "@/store/services/destination.service";
import { IconAlertTriangle, IconArrowLeft } from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import TourForm from "./TourForm";

export default function EditTourView() {
  const params = useParams();
  const id = params?.id as string;

  const {
    data: destinationData,
    isLoading,
    error,
  } = useFindDestinationByIdQuery(id, {
    skip: !id,
  });

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="size-8 animate-spin text-blue-600" />
        <p className="text-xs font-medium">Loading tour package details...</p>
      </div>
    );
  }

  if (error || !destinationData?.data) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <IconAlertTriangle className="size-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900">Tour Package Not Found</h2>
          <p className="max-w-sm text-xs text-slate-500">
            We were unable to locate the tour package with the specified ID. It may have been
            deleted or the ID is invalid.
          </p>
        </div>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="mt-2 h-9 gap-1.5 text-xs font-semibold">
          <Link href="/dashboard/services/tour-religion">
            <IconArrowLeft className="size-4" />
            Back to Tour & Religion
          </Link>
        </Button>
      </div>
    );
  }

  return <TourForm initialData={destinationData.data} isEdit={true} />;
}
