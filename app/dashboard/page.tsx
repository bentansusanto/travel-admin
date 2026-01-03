import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"

import data from "./data.json"
import { Metadata } from "next";
import { generateMeta } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata>{
  return generateMeta({
    title: "Pacific Travelindo - Dashboard Business",
    description:
      "Pacific Travelindo - Dashboard Business",
  });
}

export default function Page() {
  return (
    <>
      <div className="flex items-center justify-between ">
        <h1 className="text-2xl font-bold">Welcome Toby</h1>
      </div>
      <SectionCards />
        <ChartAreaInteractive />
      <DataTable data={data} />
    </>
  )
}
