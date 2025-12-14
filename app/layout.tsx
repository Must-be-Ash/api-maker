import type { Metadata } from "next";
import { Geist, Geist_Mono, Caprasimo } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import Providers from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const caprasimo = Caprasimo({
  variable: "--font-caprasimo",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Dittod - Browser Automation API Creator",
  description: "Turn any browser task into a reusable API. Record once, execute infinitely with different inputs.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Dittod - Browser Automation API Creator',
    description: 'Turn any browser task into a reusable API. Record once, execute infinitely with different inputs.',
    url: process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
    siteName: 'Dittod',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dittod - Browser Automation API Creator',
    description: 'Turn any browser task into a reusable API. Record once, execute infinitely with different inputs.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${caprasimo.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
