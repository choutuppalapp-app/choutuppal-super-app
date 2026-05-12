import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { FloatingOverlays } from "@/components/floating-overlays";
import { AuthProvider } from "@/lib/auth-context";
import { LoginModal } from "@/components/auth/login-modal";
import { Toaster } from "@/components/ui/sonner";

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
      {/* Mobile: locked app height. Desktop: normal scrollable web page */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-[100dvh] md:h-auto md:min-h-screen w-screen md:w-full overflow-hidden md:overflow-auto bg-gray-50 flex flex-col overscroll-none md:overscroll-auto`}
      >
        <AuthProvider>
          {/* Header: Sticky on desktop, compact on mobile */}
          <Header className="flex-none z-50" />

          {/* Main Content: Scroll container on mobile, normal block on desktop */}
          <main className="flex-1 md:flex-none overflow-y-auto md:overflow-y-auto overflow-x-hidden scroll-smooth">
            {children}
          </main>

          {/* Mobile Bottom Nav: position:fixed overlay, NOT a flex child */}
          <MobileBottomNav />

          {/* Floating overlays (position:fixed, z-indexed) */}
          <FloatingOverlays />

          {/* Login Modal */}
          <LoginModal />

          {/* Sonner Toast Notifications */}
          <Toaster
            position="bottom-center"
            toastOptions={{
              className: "!bg-white !text-gray-900 !border !border-gray-200 !shadow-lg !rounded-xl",
            }}
            richColors
          />
        </AuthProvider>
      </body>
    </html>
  );
}
