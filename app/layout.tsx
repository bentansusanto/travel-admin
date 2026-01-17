import { ReduxProvider } from "@/store/ReduxProvider";
import { SessionProvider } from "@/store/SessionProvider";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ReduxProvider>
          <SessionProvider>{children}</SessionProvider>
          <Toaster position="top-center" richColors />
        </ReduxProvider>
      </body>
    </html>
  );
}
