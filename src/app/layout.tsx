import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Home, ShoppingCart, FileText } from "tabler-icons-react";

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
        <nav className="bg-white border-t border-black fixed bottom-0 left-0 right-0 z-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-around gap-2">
              <a href="/" className="flex-1 flex flex-col items-center justify-center py-4 text-black hover:bg-slate-100 transition-colors rounded-t-lg group">
                <Home className="w-6 h-6 mb-1 group-hover:scale-110 transition-transform stroke-2" />
                <span className="text-xs font-semibold uppercase tracking-wide">Home</span>
              </a>
              <a href="/products" className="flex-1 flex flex-col items-center justify-center py-4 text-black hover:bg-slate-100 transition-colors rounded-t-lg group">
                <ShoppingCart className="w-6 h-6 mb-1 group-hover:scale-110 transition-transform stroke-2" />
                <span className="text-xs font-semibold uppercase tracking-wide">Products</span>
              </a>
              <a href="/batches" className="flex-1 flex flex-col items-center justify-center py-4 text-black hover:bg-slate-100 transition-colors rounded-t-lg group">
                <FileText className="w-6 h-6 mb-1 group-hover:scale-110 transition-transform stroke-2" />
                <span className="text-xs font-semibold uppercase tracking-wide">Batches</span>
              </a>
            </div>
          </div>
        </nav>
      </body>
    </html>
  );
}
