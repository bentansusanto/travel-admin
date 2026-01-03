"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useState } from "react";
import { TourReligion } from "./data-table";

interface ServiceDetailModalProps {
  service: TourReligion | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ServiceDetailModal({ service, isOpen, onClose }: ServiceDetailModalProps) {
  const [lang, setLang] = useState<string>("en");

  useEffect(() => {
    if (service) {
      // Default to English if available, otherwise first available
      const hasEn = service.translations.some((t) => t.language_code === "en");
      setLang(hasEn ? "en" : service.translations[0]?.language_code || "en");
    }
  }, [service]);

  if (!service) return null;

  const translation =
    service.translations.find((t) => t.language_code === lang) || service.translations[0];
  const highlights = translation?.detail_tour || [];
  const facilities = translation?.facilities || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto p-0">
        <DialogHeader className="bg-background sticky top-0 z-10 flex flex-row items-center justify-between space-y-0 border-b px-6 py-4">
          <DialogTitle className="text-xl font-bold">Service Details</DialogTitle>
          {service.translations.length > 1 && (
            <Tabs value={lang} onValueChange={setLang} className="mr-8">
              <TabsList className="grid h-8 w-40 grid-cols-2">
                <TabsTrigger value="id" className="text-xs">
                  Indonesia
                </TabsTrigger>
                <TabsTrigger value="en" className="text-xs">
                  English
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </DialogHeader>

        <div className="space-y-6 px-6 py-4">
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
              General Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-muted-foreground">Category</Label>
                <div className="text-sm font-medium">
                  <Badge variant="outline" className="capitalize">
                    {service.category}
                  </Badge>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Status</Label>
                <div className="text-sm font-medium">
                  <Badge
                    className={cn("capitalize", {
                      "bg-green-100 text-green-700 hover:bg-green-100": service.status === "active",
                      "bg-gray-100 text-gray-700 hover:bg-gray-100": service.status === "inactive"
                    })}>
                    {service.status}
                  </Badge>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Created At</Label>
                <div className="text-sm">
                  {new Date(service.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Base Price</Label>
                <div className="text-sm font-semibold">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR"
                  }).format(service.price)}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Section 2: Service Content (Mimicking Item Package) */}
          <div className="space-y-4">
            <h3 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
              Service Content
            </h3>
            <div className="bg-muted/30 rounded-lg border p-4">
              <div className="flex flex-col gap-4 sm:flex-row">
                {service.thumbnail ? (
                  <Image
                    width={400}
                    height={300}
                    src={service.thumbnail}
                    alt={service.name}
                    className="aspect-video w-full rounded-md border object-cover sm:aspect-square sm:h-24 sm:w-24"
                  />
                ) : (
                  <div className="bg-muted text-muted-foreground flex aspect-video w-full items-center justify-center rounded-md border p-2 text-center text-xs sm:aspect-square sm:h-24 sm:w-24">
                    No Image Available
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <div className="text-lg font-bold">{translation?.name || service.name}</div>
                  <div className="text-muted-foreground text-sm">
                    Location:{" "}
                    <span className="text-foreground font-medium">{service.location}</span>
                  </div>
                  {translation?.description && (
                    <p className="text-muted-foreground line-clamp-3 text-xs sm:line-clamp-2">
                      {translation.description}
                    </p>
                  )}
                  <div className="flex gap-4 pt-2">
                    <div className="text-xs">
                      <Label className="text-muted-foreground text-[10px]">Max Capacity</Label>
                      <div className="font-medium">Varies</div>
                    </div>
                    <div className="text-xs">
                      <Label className="text-muted-foreground text-[10px]">Duration</Label>
                      <div className="font-medium">Flexible</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Section 3: Additional Details (Mimicking Package Type/Dimensions) */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-semibold">
                  {highlights.length > 0 ? "Itinerary / Highlights" : "Facilities"}
                </Label>
                <div className="space-y-2">
                  {(highlights.length ? highlights : facilities).map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <div className="bg-primary h-1.5 w-1.5 rounded-full" />
                      <span className="capitalize">{item}</span>
                    </div>
                  ))}
                  {!highlights.length && !facilities.length && (
                    <div className="text-muted-foreground text-xs italic">
                      No additional details available.
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Location Details</Label>
                <div className="bg-muted/20 rounded-md border p-3">
                  <div className="text-sm font-medium">{service.location}</div>
                  <div className="text-muted-foreground mt-1 text-xs">
                    Meeting point details and transportation instructions will be provided after
                    booking.
                  </div>
                </div>
                {service.images && service.images.length > 0 && (
                  <div className="mt-4">
                    <Label className="text-muted-foreground mb-2 block text-[10px] uppercase">
                      Service Images
                    </Label>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {service.images.map((img, i) => (
                        <Image
                          width={100}
                          height={100}
                          key={i}
                          src={img}
                          alt={`Slide ${i}`}
                          className="h-16 w-16 flex-shrink-0 rounded-md border object-cover"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-background sticky bottom-0 z-10 flex justify-end gap-3 border-t px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button>Edit Service</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
