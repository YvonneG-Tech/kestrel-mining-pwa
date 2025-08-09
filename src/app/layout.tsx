import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@tabler/core/dist/css/tabler.min.css";
import "./globals.css";
import Navigation from "./components/Navigation";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kestrel Mining - Workforce Management",
  description: "Mining workforce compliance and training management",
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
          <div className="page">
            <Navigation />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
