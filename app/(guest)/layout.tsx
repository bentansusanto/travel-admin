import Providers from "@/components/providers";
import { Toaster } from "sonner";
export default function GuestLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Providers>
    {children}
    
    </Providers>;
}
