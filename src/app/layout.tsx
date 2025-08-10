import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@tabler/core/dist/css/tabler.min.css";
import "./globals.css";
import Navigation from "./components/Navigation";
import Providers from "./providers";
import PWAInstall from "./components/PWAInstall";
import OfflineIndicator from "./components/OfflineIndicator";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kestrel Mining - Workforce Management",
  description: "Mining workforce compliance and training management",
  manifest: "/manifest.json",
  themeColor: "#007bff",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kestrel Mining",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <OfflineIndicator />
          <div className="page">
            <Navigation />
            {children}
            <PWAInstall />
          </div>
        </Providers>
      </body>
    </html>
  );
}
