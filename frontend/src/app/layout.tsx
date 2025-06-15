import type { Metadata } from "next";
import { Inter, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Tambahkan Inter
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Temudataku",
  description: "Platform untuk booking dan konsultasi dengan mudah.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}