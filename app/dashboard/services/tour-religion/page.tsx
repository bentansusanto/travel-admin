"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useFindAllDestinationsWithTranslationQuery } from "@/store/services/destination.service";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import { PackageOpen } from "lucide-react";
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
      const translations = dest.translations || [];
      const translation =
        translations.find((t) => t.language_code === "en") ||
        translations.find((t) => t.language_code === "id") ||
        translations[0];

      return {
        id: dest.id || "",
        state_id: dest.state_id,
        category_destination_id: dest.category_destination_id,
        name: translation?.name || "No Name",
        category: dest.category_destination_name || "Tour",
        price: dest.price,
        location: dest.location || "",
        status: "active", // Defaulting to active as API doesn't provide status yet
        createdAt: translation?.createdAt || new Date().toISOString(),
        description: translation?.description,
        thumbnail: translation?.thumbnail,
        images: translation?.image,
        highlights: translation?.detail_tour,
        facilities: translation?.facilities,
        translations: translations
      };
    });
  }, [destinationsData]);

  const handleAddSubmit = (values: any) => {
    console.log("Adding new service:", values);
    setIsAddModalOpen(false);
  };

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
          {isLoading ? (
            <div className="text-muted-foreground flex h-48 items-center justify-center">
              Loading destinations...
            </div>
          ) : error ? (
            <div className="flex h-48 flex-col items-center justify-center gap-4">
              <PackageOpen className="text-muted-foreground/50 h-16 w-16" />
              <div className="text-center">
                <p className="text-muted-foreground text-lg font-medium">
                  Error loading destinations
                </p>
                <p className="text-muted-foreground/70 text-sm">
                  Please try again later or add a new service
                </p>
              </div>
            </div>
          ) : data.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-4">
              <PackageOpen className="text-muted-foreground/50 h-16 w-16" />
              <div className="text-center">
                <p className="text-muted-foreground text-lg font-medium">No destinations found</p>
                <p className="text-muted-foreground/70 text-sm">
                  Get started by adding your first service
                </p>
              </div>
            </div>
          ) : (
            <TourReligionDataTable data={data} />
          )}
        </CardContent>
      </Card>

      <ServiceFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        service={null}
        onSubmit={handleAddSubmit}
      />
    </>
  );
}
