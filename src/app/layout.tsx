import type { Metadata, Viewport } from "next";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
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
import { WhatsAppFloatingButton } from "@/components/whatsapp-floating-button";
import { AntiCopyWrapper } from "@/components/anti-copy-wrapper";

export const dynamic = 'force-dynamic';

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

export async function generateMetadata(): Promise<Metadata> {
  const { db } = await import('@/lib/db');
  let settings: any = null;
  try {
    settings = await db.siteSetting.findFirst();
  } catch (e) {
    console.error('Failed to fetch settings for metadata:', e);
  }

  const faviconUrl = settings?.faviconUrl || '/icons/icon-192x192.png?v=new';
  const ogImageUrl = settings?.ogImageUrl || settings?.appLogoUrl || settings?.logoUrl || '/brand-logo.png';
  const metaTitle = settings?.metaTitle || "చౌటుప్పల్ సూపర్ యాప్ | Choutuppal App";
  const metaDescription = settings?.metaDescription || "ఇకపై మన ఊరి షాపులు, హాస్పిటల్స్, రియల్ ఎస్టేట్ వివరాలు అన్నీ ఒకే క్లిక్ లో! చౌటుప్పల్ సొంత సూపర్ యాప్ ని ఇప్పుడే ఓపెన్ చేయండి.";

  return {
    metadataBase: new URL('https://choutuppal.in'),
    title: metaTitle,
    description: metaDescription,
    manifest: '/manifest.webmanifest?v=fresh',
    icons: {
      icon: [
        { url: faviconUrl, sizes: '192x192', type: 'image/png' },
        { url: faviconUrl, sizes: '512x512', type: 'image/png' },
      ],
      apple: [
        { url: faviconUrl, sizes: '152x152', type: 'image/png' },
        { url: faviconUrl, sizes: '192x192', type: 'image/png' },
      ],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: 'Choutuppal',
      startupImage: [faviconUrl],
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: 'https://choutuppal.in',
      siteName: 'Choutuppal App',
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: 'Choutuppal App' }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: [ogImageUrl],
    },
    keywords: ["Choutuppal", "local business", "real estate", "Telangana", "hyper-local", "super app"],
    authors: [{ name: "Choutuppal App Team" }],
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        suppressHydrationWarning={true}
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen w-full bg-gray-50 flex flex-col`}
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

              <main className="flex-1 w-full max-w-7xl mx-auto flex flex-col pt-0 pb-16 md:pb-0 safe-bottom">
                <AntiCopyWrapper>
                  {children}
                </AntiCopyWrapper>
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

              <ErrorBoundary name="WhatsAppFloatingButton">
                <WhatsAppFloatingButton />
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
        <Analytics />
        <SpeedInsights />
        {/* Service Worker Killer */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(registrations => {
                  registrations.forEach(r => r.unregister());
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
