"use client";

import { useEffect, useState } from "react";

type BatchSummary = {
  id: number;
  batch_code: string;
  quantity: number;
  created_at: string;
  part_number?: string | null;
};

type Stats = {
  batches: BatchSummary[];
  totalBatches: number;
  totalQuantity: number;
  totalProducts: number;
  productTypes: Record<string, number>;
};

export default function Home() {
  const [stats, setStats] = useState<Stats>({
    batches: [],
    totalBatches: 0,
    totalQuantity: 0,
    totalProducts: 0,
    productTypes: {},
  });

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const batchesRes = await fetch("/api/batches");

        const batches = (await batchesRes.json()) as BatchSummary[];

        const totalBatches = batches.length;
        const totalQuantity = batches.reduce(
          (sum, b) => sum + (b.quantity || 0),
          0,
        );

        if (!cancelled) {
          setStats({
            batches: batches.slice(0, 5),
            totalBatches,
            totalQuantity,
            totalProducts: 0,
            productTypes: {},
          });
        }
      } catch (error) {
        console.error("Failed to load stats:", error);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, []);

  const formatDate = (date: string | Date | null | undefined) => {
    const d = date instanceof Date ? date : new Date(date ?? "");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div
      className="bg-white p-4"
      style={{ fontFamily: "var(--font-geist-sans)" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-1 tracking-tight">
            Production Tracker 
          </h1>
          <p className="text-sm text-slate-600">Kenrax</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-white border border-slate-200 rounded p-4">
            <div className="text-xs text-slate-600 font-semibold uppercase tracking-wide">
              Till Date
            </div>
            <div className="text-2xl font-bold text-black mt-1">

              {stats.totalBatches}<span className="text-xs text-slate-600 font-semibold uppercase tracking-wide"> Batches</span>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded p-4">
            <div className="text-xs text-slate-600 font-semibold uppercase tracking-wide">
              Total Quantity
            </div>
            <div className="text-2xl font-bold text-black mt-1">
              {stats.totalQuantity}<span className="text-xs text-slate-600 font-semibold uppercase tracking-wide"> PCS</span>
            </div>
          </div>
          {/* <div className="bg-white border border-slate-200 rounded p-4">
            <div className="text-xs text-slate-600 font-semibold uppercase tracking-wide">
              Total Products
            </div>
            <div className="text-2xl font-bold text-black mt-1">
              {stats.totalProducts}
            </div>
          </div> */}
          {/* <div className="bg-white border border-slate-200 rounded p-4">
            <div className="text-xs text-slate-600 font-semibold uppercase tracking-wide">
              Product Types
            </div>
            <div className="text-2xl font-bold text-black mt-1">
              {Object.keys(stats.productTypes).length}
            </div>
          </div> */}
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <a
            href="/batches/add"
            className="px-4 py-3 bg-black text-white font-semibold text-center rounded hover:bg-slate-900 transition-colors text-sm tracking-wide uppercase flex items-center justify-center col-span-2"
          >
            + New Production Batch
          </a>
          {/* <a
            href="/products/add"
            className="px-4 py-3 bg-black text-white font-semibold text-center rounded hover:bg-slate-900 transition-colors text-sm tracking-wide uppercase flex items-center justify-center"
          >
            + Product
          </a> */}
          <a
            href="/batches"
            className="px-4 py-3 bg-slate-200 text-black font-medium text-center rounded hover:bg-slate-300 transition-colors text-sm flex items-center justify-center"
          >
            All Batches
          </a>
          <a
            href="/products"
            className="px-4 py-3 bg-slate-200 text-black font-medium text-center rounded hover:bg-slate-300 transition-colors text-sm flex items-center justify-center"
          >
            All Products
          </a>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Production Batches */}
          <div className="border border-slate-200 rounded overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
              <h2 className="text-sm font-semibold text-black uppercase tracking-wide">
                Recent Batches
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-black">
                      Date
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-black">
                      Part
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-black">
                      Qty
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-black">
                      Code
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.batches.length > 0 ? (
                    stats.batches.map((batch, idx) => (
                      <tr
                        key={batch.id}
                        className={
                          idx !== stats.batches.length - 1
                            ? "border-b border-slate-100"
                            : ""
                        }
                      >
                        <td className="px-3 py-2 text-slate-600">
                          {formatDate(batch.created_at)}
                        </td>
                        <td className="px-3 py-2 text-black underline decoration-dashed underline-offset-2">
                          {batch.part_number || "-"}
                        </td>
                        <td className="px-3 py-2 text-right text-black font-medium">
                          {batch.quantity}
                        </td>
                        <td className="px-3 py-2 font-mono font-medium text-black">
                          {batch.batch_code}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-3 py-4 text-center text-slate-500 text-xs"
                      >
                        No batches yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
