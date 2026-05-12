import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/header";
import { MobileBottomWrapper } from "@/components/mobile-bottom-wrapper";
import { FloatingOverlays } from "@/components/floating-overlays";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Choutuppal 2.0 - Your Hyper-Local Super App",
  description: "Discover businesses, services, real estate, and local news in Choutuppal. Your city's digital revolution.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Mobile: locked app height. Desktop: normal scrollable web page */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-[100dvh] md:h-auto md:min-h-screen w-screen md:w-full overflow-hidden md:overflow-auto bg-gray-50 flex md:flex flex-col overscroll-none md:overscroll-auto`}
      >
        {/* Header: Flex-none on both, sticky on desktop */}
        <Header className="flex-none md:flex-none z-50" />

        {/* Main Content: Scroll container on mobile, normal block on desktop */}
        <main className="flex-1 md:flex-none overflow-y-auto md:overflow-y-auto overflow-x-hidden scroll-smooth">
          {children}
        </main>

        {/* Bottom Wrapper: Only exists on mobile */}
        <MobileBottomWrapper className="flex-none z-50 md:hidden" />

        {/* Floating overlays (position:fixed, z-indexed) */}
        <FloatingOverlays />

        <Toaster />
      </body>
    </html>
  );
}
