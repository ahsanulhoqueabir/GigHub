import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { CentralDataInitializer } from "@/components/shared/central-initializer";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import {
  Fraunces,
  Geist,
  Geist_Mono,
  Inter,
  Noto_Sans,
} from "next/font/google";
import { Suspense } from "react";
import "./globals.css";

const notoSans = Noto_Sans({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-fraunces",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: branding.title,
  description: branding.description,
  keywords: [...branding.keywords],
  openGraph: branding.openGraph,
  twitter: branding.twitter,
  robots: branding.robots,
  alternates: branding.alternates,
};

import { Toaster } from "@/components/ui/sonner";
import { branding } from "@/config/brand.config";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        notoSans.variable,
        fraunces.variable,
        inter.variable,
      )}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <CentralDataInitializer />
        <Suspense fallback={null}>
          <Header />
        </Suspense>
        <main className="flex-1 px-4 lg:px-10 py-5">{children}</main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
