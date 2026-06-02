import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { FloatingOverlays } from "@/components/floating-overlays";
import { AuthProvider } from "@/lib/auth-context";
import { AppConfigProvider } from "@/hooks/use-app-config";
import { LoginModal } from "@/components/auth/login-modal";
import { SettingsInitializer } from "@/components/settings-initializer";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/error-boundary";
import { GlobalErrorHandler } from "@/components/global-error-handler";
import { PWAInstallProvider } from "@/components/pwa-install-provider";
import { PWAInstallPopup } from "@/components/pwa-install-popup";
import { PWAIOSBanner } from "@/components/pwa-ios-banner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: '#4169E1',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://choutuppal.com'),
  title: "Choutuppal 2.0 - Your Hyper-Local Super App",
  description: "Discover businesses, services, real estate, and local news in Choutuppal. Your city's digital revolution.",
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Choutuppal',
    startupImage: ['/icons/icon-192x192.png'],
  },
  openGraph: {
    title: "Choutuppal 2.0 - Your Hyper-Local Super App",
    description: "Discover businesses, services, real estate, and local news in Choutuppal. Your city's digital revolution.",
    siteName: "Choutuppal 2.0",
    type: "website",
    locale: "en_IN",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Choutuppal 2.0" }],
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-[100dvh] md:h-auto md:min-h-screen w-full overflow-hidden md:overflow-auto bg-gray-50 flex flex-col overscroll-none md:overscroll-auto`}
      >
        <GlobalErrorHandler />
        <ErrorBoundary name="AuthProvider">
          <AuthProvider>
            <AppConfigProvider>
            <PWAInstallProvider>
              <ErrorBoundary name="SettingsInitializer">
                <SettingsInitializer />
              </ErrorBoundary>
              <ErrorBoundary name="Header">
                <Header className="flex-none" />
              </ErrorBoundary>

              <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth md:overflow-visible flex flex-col">
                <ErrorBoundary name="PageContent">
                  {children}
                </ErrorBoundary>
              </main>

              <ErrorBoundary name="MobileBottomNav">
                <MobileBottomNav />
              </ErrorBoundary>

              <ErrorBoundary name="FloatingOverlays">
                <FloatingOverlays />
              </ErrorBoundary>

              <ErrorBoundary name="LoginModal">
                <LoginModal />
              </ErrorBoundary>

              {/* PWA Install Popup — auto-shows on mobile when installable */}
              <ErrorBoundary name="PWAInstallPopup">
                <PWAInstallPopup />
              </ErrorBoundary>

              {/* PWA iOS Banner — manual instructions for iOS Safari */}
              <ErrorBoundary name="PWAIOSBanner">
                <PWAIOSBanner />
              </ErrorBoundary>

              <ErrorBoundary name="Toaster">
                <Toaster
                  position="bottom-center"
                  toastOptions={{
                    className: "!bg-white !text-gray-900 !border !border-gray-200 !shadow-lg !rounded-xl",
                  }}
                  richColors
                />
              </ErrorBoundary>
            </PWAInstallProvider>
            </AppConfigProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
