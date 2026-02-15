'use client';

import { Home, ShoppingCart, FileText, Refresh } from "tabler-icons-react";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <nav className="bg-white border-t border-black fixed bottom-0 left-0 right-0 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex">
          <a
            href="/"
            className={`flex-1 flex flex-col items-center justify-center py-4 transition-colors ${
              isActive("/") ? "bg-black text-white" : "text-black hover:bg-slate-100"
            }`}
          >
            <Home className="w-6 h-6 mb-1 stroke-2" />
            <span className="text-xs font-semibold uppercase tracking-wide">Home</span>
          </a>
          <a
            href="/products"
            className={`flex-1 flex flex-col items-center justify-center py-4 transition-colors ${
              isActive("/products") ? "bg-black text-white" : "text-black hover:bg-slate-100"
            }`}
          >
            <ShoppingCart className="w-6 h-6 mb-1 stroke-2" />
            <span className="text-xs font-semibold uppercase tracking-wide">Products</span>
          </a>
          <a
            href="/batches"
            className={`flex-1 flex flex-col items-center justify-center py-4 transition-colors ${
              isActive("/batches") ? "bg-black text-white" : "text-black hover:bg-slate-100"
            }`}
          >
            <FileText className="w-6 h-6 mb-1 stroke-2" />
            <span className="text-xs font-semibold uppercase tracking-wide">Batches</span>
          </a>
          <button
            onClick={handleRefresh}
            className="flex-1 flex flex-col items-center justify-center py-4 transition-colors text-black hover:bg-slate-100"
          >
            <Refresh className="w-6 h-6 mb-1 stroke-2" />
            <span className="text-xs font-semibold uppercase tracking-wide">Refresh</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
