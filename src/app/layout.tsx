import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header.tsx/Header";
import Footer from "@/components/Footer/Footer";
import SessionProvideWrapper from "@/providers/SessionProvideWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zenith",
  description: "AI TimeTable Generation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* ✅ Wrap the entire app with the SessionProvider */}
        <SessionProvideWrapper>
          <Header />
          {children}
          <Footer />
        </SessionProvideWrapper>
      </body>
    </html>
  );
}
