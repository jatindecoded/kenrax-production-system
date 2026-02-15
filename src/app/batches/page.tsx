"use client";

import { useEffect, useState, Suspense } from "react";

import { useSearchParams } from "next/navigation";
import { BatchWithProduct } from "@/lib/db";
import * as XLSX from "xlsx";

function BatchesPageContent() {
  const searchParams = useSearchParams();
  const [allBatches, setAllBatches] = useState<BatchWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    // If there's a search parameter, update the search term
    const querySearch = searchParams.get("search");
    if (querySearch) {
      setSearchTerm(querySearch);
    }
  }, [searchParams]);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/batches");
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to load batches");
        return;
      }

      setAllBatches(data);
    } catch (err) {
      setError("An unexpected error occurred while fetching batches");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter batches locally based on search term
  const filteredBatches = allBatches.filter((batch) => {
    if (!searchTerm) return true;

    const normalizedSearch = searchTerm.replace(/\s/g, "").toLowerCase();
    return (
      batch.batch_code
        .replace(/\s/g, "")
        .toLowerCase()
        .includes(normalizedSearch) ||
      (batch.part_number &&
        batch.part_number
          .replace(/\s/g, "")
          .toLowerCase()
          .includes(normalizedSearch))
    );
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBatches();
  };

  const highlightMatch = (
    text: string | null | undefined,
    searchTerm: string,
  ) => {
    if (!text || !searchTerm) return text;

    // Remove spaces from both text and searchTerm for matching
    const normalizedText = text.replace(/\s/g, "");
    const normalizedSearch = searchTerm.replace(/\s/g, "");

    // If no match in normalized version, return original text
    if (
      !normalizedText.toLowerCase().includes(normalizedSearch.toLowerCase())
    ) {
      return text;
    }

    // Find the matching portion and highlight it in the original text

    const matchIndex = normalizedText
      .toLowerCase()
      .indexOf(normalizedSearch.toLowerCase());

    if (matchIndex === -1) return text;

    let charCount = 0;
    let matchStart = 0;
    let matchEnd = 0;
    let foundStart = false;

    // Map positions from normalized to original text
    for (let i = 0; i < text.length; i++) {
      if (text[i] !== " ") {
        if (!foundStart && charCount === matchIndex) {
          matchStart = i;
          foundStart = true;
        }
        charCount++;
        if (charCount === matchIndex + normalizedSearch.length) {
          matchEnd = i + 1;
          break;
        }
      }
    }

    // Split and highlight
    const before = text.substring(0, matchStart);
    const matched = text.substring(matchStart, matchEnd);
    const after = text.substring(matchEnd);

    return (
      <>
        {before}
        <mark className="bg-yellow-200 font-semibold">{matched}</mark>
        {after}
      </>
    );
  };

  const handleExport = () => {
    if (filteredBatches.length === 0) {
      alert("No batches to export");
      return;
    }

    // Prepare data for export
    const exportData = filteredBatches.map((batch) => ({
      "Batch Code": batch.batch_code,
      "Part Number": batch.part_number || "-",
      "Product Type": batch.product_type || "-",
      Quantity: batch.quantity,
      "Produced By": batch.produced_by || "-",
      "Production Line": batch.production_line || "-",
      Remarks: batch.remarks || "-",
      "Created At": formatDate(batch.created_at),
      "Updated At": batch.updated_at ? formatDate(batch.updated_at) : "-",
    }));

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Production Batches");

    // Set column widths
    const colWidths = [
      { wch: 15 }, // Batch Code
      { wch: 15 }, // Part Number
      { wch: 12 }, // Product Type
      { wch: 10 }, // Quantity
      { wch: 15 }, // Produced By
      { wch: 15 }, // Production Line
      { wch: 20 }, // Remarks
      { wch: 15 }, // Created At
      { wch: 15 }, // Updated At
    ];
    ws["!cols"] = colWidths;

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `production_batches_${timestamp}.xlsx`;

    // Download
    XLSX.writeFile(wb, filename);
  };

  const formatDate = (date: string | Date) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      className="bg-white overflow-x-hidden"
      style={{ fontFamily: "var(--font-geist-sans)" }}
    >
      {/* Header */}
      <div className="border-b border-black">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-black tracking-tight mb-1">
                Production Batches
              </h1>
            </div>
            <a
              href="/batches/add"
              className="px-3 md:px-4 py-2 bg-black text-white font-semibold rounded hover:bg-slate-900 transition-colors text-xs md:text-sm tracking-wide uppercase whitespace-nowrap"
            >
              + New Prod Batch
            </a>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Search */}
        <form
          onSubmit={handleSearchSubmit}
          className="mb-6 flex flex-wrap gap-2"
        >
          <input
            type="text"
            placeholder="Search batch code or part number..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full md:flex-1 px-3 py-2 border border-slate-300 rounded text-base bg-white text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
            autoComplete="off"
          />
          <div className="flex w-full md:w-auto gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="flex-1 md:flex-none px-1 py-2 border border-slate-700 text-slate-700 font-semibold rounded hover:bg-slate-100 transition-colors text-xs tracking-wide uppercase"
            >
              Export to Excel
            </button>
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="flex-1 md:flex-none px-1 py-2 border border-slate-400 text-slate-700 font-semibold rounded hover:bg-slate-100 transition-colors text-xs tracking-wide uppercase"
            >
              {showDetails ? "Hide" : "Show"} Details
            </button>
            <button
              type="submit"
              className="flex-1 md:flex-none px-1 py-2 bg-black text-white font-semibold rounded hover:bg-slate-900 transition-colors text-xs tracking-wide uppercase"
            >
              Search
            </button>
          </div>
        </form>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-300 border-t-black mx-auto mb-2"></div>
            <p className="text-sm text-slate-600">Loading...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && filteredBatches.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-slate-600 mb-4">
              {searchTerm
                ? "No production batches found."
                : "No production batches yet."}
            </p>
            <a
              href="/batches/add"
              className="inline-block px-4 py-2 bg-black text-white font-semibold rounded hover:bg-slate-900 transition-colors text-sm tracking-wide uppercase"
            >
              + New Prod Batch
            </a>
          </div>
        )}

        {/* Cards */}
        {!loading && filteredBatches.length > 0 && (
          <div className="space-y-3">
            {filteredBatches.map((batch) => (
              <div
                key={batch.id}
                className="border border-slate-200 rounded p-4 bg-white"
              >
                <div className="mb-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-semibold uppercase text-slate-500">
                      {formatDate(batch.created_at)}
                    </div>
                    <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
                      Part Number
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs text-slate-500"></div>

                    <div className="font-bold text-black text-lg underline decoration-dashed underline-offset-4">
                      {highlightMatch(batch.part_number, searchTerm)}
                    </div>
                  </div>
                </div>
                <div className="">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
                      Batch Code
                    </div>
                    <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
                      Qty
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-mono font-semibold text-black text-lg">
                      {highlightMatch(batch.batch_code, searchTerm)}
                    </div>
                    <div className="font-bold text-black text-lg">
                      {batch.quantity} PCS
                    </div>
                  </div>
                </div>
                {showDetails && (
                  <div className="space-y-2 text-xs mt-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Type:</span>
                      <span className="font-medium text-black">
                        {batch.product_type || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Qty:</span>
                      <span className="font-medium text-black">
                        {batch.quantity}
                      </span>
                    </div>
                    {batch.produced_by && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">By:</span>
                        <span className="font-medium text-black">
                          {batch.produced_by}
                        </span>
                      </div>
                    )}
                    {batch.production_line && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Line:</span>
                        <span className="font-medium text-black">
                          {batch.production_line}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BatchesPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <BatchesPageContent />
    </Suspense>
  );
}
