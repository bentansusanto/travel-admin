"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useFindAllDestinationsWithTranslationQuery } from "@/store/services/destination.service";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import { useMemo, useState } from "react";
import TourReligionDataTable, { TourReligion as TourService } from "./data-table";
import ServiceFormModal from "./service-form-modal";

export default function TourReligion() {
  const { data: destinationsData, isLoading, error } = useFindAllDestinationsWithTranslationQuery();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const data: TourService[] = useMemo(() => {
    if (!destinationsData?.data) return [];

    return destinationsData.data.map((dest) => {
      // Prioritize English translation, fallback to first available
      const translation =
        dest.translations.find((t) => t.language_code === "en") ||
        dest.translations.find((t) => t.language_code === "id") ||
        dest.translations[0];

      return {
        id: dest.id,
        name: translation?.name || "No Name",
        category: dest.category_destination_name || "Tour",
        price: parseFloat(dest.price),
        location: dest.location,
        status: "active", // Defaulting to active as API doesn't provide status yet
        createdAt: translation?.createdAt || new Date().toISOString(),
        description: translation?.description,
        thumbnail: translation?.thumbnail,
        images: translation?.image,
        highlights: translation?.detail_tour,
        facilities: translation?.facilities,
        translations: dest.translations
      };
    });
  }, [destinationsData]);

  const handleAddSubmit = (values: any) => {
    console.log("Adding new service:", values);
    setIsAddModalOpen(false);
  };

  if (isLoading)
    return <div className="flex h-48 items-center justify-center">Loading destinations...</div>;
  if (error)
    return (
      <div className="text-destructive p-4">
        Error loading destinations. Please try again later.
      </div>
    );

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Tour & Religion</h1>
        <Button variant="secondary" onClick={() => setIsAddModalOpen(true)}>
          <PlusCircledIcon className="mr-2 h-4 w-4" /> Add New Service
        </Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          <TourReligionDataTable data={data} />
        </CardContent>
      </Card>

      <ServiceFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSubmit}
      />
    </>
  );
}
