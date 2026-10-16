import { cn } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "../ui/badge";

type LogoProps = {
  className?: string;
};

export default function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 px-5 py-4 font-bold", className)}>
      <img src="/icon.png" className="block h-6 w-6 object-contain" alt="Pacific Travelindo logo" />
      <span>Pacific Travelindo</span>
    </Link>
  );
}
