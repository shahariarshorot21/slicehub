import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteChrome } from "@/components/layout/site-chrome";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "SliceHub | Pizza Ordering & Delivery",
  description: "Discover neighbourhood pizzerias, order your favourites and track every slice from oven to doorstep.",
};

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("antialiased", fontMono.variable, "font-sans", geist.variable)}>
      <body>
        <Providers>
          <SiteChrome>{children}</SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
