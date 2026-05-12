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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-[100dvh] w-screen overflow-hidden bg-gray-50 flex flex-col overscroll-none`}
      >
        {/* Header: Fixed at top, never scrolls */}
        <Header className="flex-none z-50" />

        {/* Main Content: ONLY this section scrolls */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth">
          {children}
        </main>

        {/* Bottom Nav / CTA: Fixed at bottom, never scrolls */}
        <MobileBottomWrapper className="flex-none z-50" />

        {/* Floating overlays (position:fixed, z-indexed) */}
        <FloatingOverlays />

        <Toaster />
      </body>
    </html>
  );
}
