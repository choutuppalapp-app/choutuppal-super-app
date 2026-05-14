import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { FloatingOverlays } from "@/components/floating-overlays";
import { AuthProvider } from "@/lib/auth-context";
import { LoginModal } from "@/components/auth/login-modal";
import { SettingsInitializer } from "@/components/settings-initializer";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/error-boundary";
import { GlobalErrorHandler } from "@/components/global-error-handler";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://choutuppal.com'),
  title: "Choutuppal 2.0 - Your Hyper-Local Super App",
  description: "Discover businesses, services, real estate, and local news in Choutuppal. Your city's digital revolution.",
  openGraph: {
    title: "Choutuppal 2.0 - Your Hyper-Local Super App",
    description: "Discover businesses, services, real estate, and local news in Choutuppal. Your city's digital revolution.",
    siteName: "Choutuppal 2.0",
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Choutuppal 2.0 - Your Hyper-Local Super App",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Choutuppal 2.0 - Your Hyper-Local Super App",
    description: "Discover businesses, services, real estate, and local news in Choutuppal.",
    images: ["/og-image.png"],
  },
  keywords: ["Choutuppal", "local business", "real estate", "Telangana", "hyper-local", "super app"],
  authors: [{ name: "Choutuppal 2.0 Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/*
        Mobile: h-[100dvh] locked viewport, overflow-hidden on body, scroll inside <main>
        Desktop: h-auto min-h-screen normal scrollable page
      */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-[100dvh] md:h-auto md:min-h-screen w-full overflow-hidden md:overflow-auto bg-gray-50 flex flex-col overscroll-none md:overscroll-auto`}
      >
        {/* Global error handler — catches unhandled promise rejections and errors */}
        <GlobalErrorHandler />
        {/* AuthProvider wrapped in ErrorBoundary — if auth crashes, page still renders */}
        <ErrorBoundary name="AuthProvider">
          <AuthProvider>
            {/* Initialize site settings from API (runs once) */}
            <ErrorBoundary name="SettingsInitializer">
              <SettingsInitializer />
            </ErrorBoundary>
            {/* Header: compact on mobile, sticky on desktop */}
            <ErrorBoundary name="Header">
              <Header className="flex-none" />
            </ErrorBoundary>

            {/* Main Content: ONLY this scrolls on mobile; desktop scrolls naturally */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth md:overflow-visible flex flex-col">
              <ErrorBoundary name="PageContent">
                {children}
              </ErrorBoundary>
            </main>

            {/* Mobile Bottom Nav: position:fixed overlay, not a flex child */}
            <ErrorBoundary name="MobileBottomNav">
              <MobileBottomNav />
            </ErrorBoundary>

            {/* Floating overlays (position:fixed, z-indexed) */}
            <ErrorBoundary name="FloatingOverlays">
              <FloatingOverlays />
            </ErrorBoundary>

            {/* Login Modal */}
            <ErrorBoundary name="LoginModal">
              <LoginModal />
            </ErrorBoundary>

            {/* Sonner Toast Notifications */}
            <ErrorBoundary name="Toaster">
              <Toaster
                position="bottom-center"
                toastOptions={{
                  className: "!bg-white !text-gray-900 !border !border-gray-200 !shadow-lg !rounded-xl",
                }}
                richColors
              />
            </ErrorBoundary>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
