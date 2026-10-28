import BusShuttleView from "@/modules/Services/BusShuttle/BusShuttleView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bus & Shuttle Schedules | Pacific Travelindo",
  description: "Manage intercity bus routes, shuttle departures, and seat ticket pricing.",
};

export default function BusShuttlePage() {
  return <BusShuttleView />;
}
