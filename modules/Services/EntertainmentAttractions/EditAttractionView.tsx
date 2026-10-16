"use client";

import { Button } from "@/components/ui/button";
import { useFindEntertainmentByIdQuery } from "@/store/services/entertainment.service";
import { IconAlertTriangle, IconArrowLeft } from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AttractionForm from "./AttractionForm";

export default function EditAttractionView() {
  const params = useParams();
  const id = params?.id as string;

  const {
    data: entertainmentData,
    isLoading,
    error,
  } = useFindEntertainmentByIdQuery(id, {
    skip: !id,
  });

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="size-8 animate-spin text-blue-600" />
        <p className="text-xs font-medium">Loading attraction details...</p>
      </div>
    );
  }

  if (error || !entertainmentData?.data) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <IconAlertTriangle className="size-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900">Attraction Not Found</h2>
          <p className="max-w-sm text-xs text-slate-500">
            We were unable to locate the attraction or entertainment item with the specified ID.
          </p>
        </div>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="mt-2 h-9 gap-1.5 text-xs font-semibold">
          <Link href="/dashboard/services/entertainment-attractions">
            <IconArrowLeft className="size-4" />
            Back to Attractions
          </Link>
        </Button>
      </div>
    );
  }

  return <AttractionForm key={entertainmentData.data.id} initialData={entertainmentData.data} isEdit={true} />;
}
