import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Production Tracking System",
  description: "Simple internal production tracking for manufacturing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${jetbrainsMono.variable} antialiased bg-white text-slate-900 flex flex-col h-screen`}
        style={{ fontFamily: 'var(--font-geist-sans)', letterSpacing: '0.01em' }}
      >
        <main className="bg-white flex-1 overflow-y-auto pb-24">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
