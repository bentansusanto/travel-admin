import { generateMeta } from "@/lib/utils";
import { OrderPage } from "@/modules/Orders";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "Orders & Bookings",
    description: "Manage real-time bookings, payment confirmations, and customer travel orders."
  });
}

export default function OrdersV1() {
  return <OrderPage />;
}
