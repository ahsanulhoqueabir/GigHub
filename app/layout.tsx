import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { CentralDataInitializer } from "@/components/shared/central-initializer";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans } from "next/font/google";
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
      )}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <CentralDataInitializer />
        <Header />
        <main className="flex-1 px-4 lg:px-10 py-5">{children}</main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
