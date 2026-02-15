'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/lib/db';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to load products');
        return;
      }

      setProducts(data);
    } catch (err) {
      setError('An unexpected error occurred while fetching products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    if (!searchTerm) return true;

    const normalizedSearch = searchTerm.replace(/\s/g, '').toLowerCase();
    return (
      product.part_number.replace(/\s/g, '').toLowerCase().includes(normalizedSearch) ||
      product.product_type.replace(/\s/g, '').toLowerCase().includes(normalizedSearch) ||
      (product.description && product.description.replace(/\s/g, '').toLowerCase().includes(normalizedSearch))
    );
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const formatDate = (date: string | Date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white" style={{ fontFamily: 'var(--font-geist-sans)' }}>
      {/* Header */}
      <div className="border-b border-black">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-black tracking-tight mb-1">Products</h1>
            </div>
            <a href="/products/add" className="px-3 md:px-4 py-2 bg-black text-white font-semibold rounded hover:bg-slate-900 transition-colors text-xs md:text-sm tracking-wide uppercase whitespace-nowrap">
              + New
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
        <form onSubmit={handleSearchSubmit} className="mb-6 flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Search part number, type, or description..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full md:flex-1 px-3 py-2 border border-slate-300 rounded text-base bg-white text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
            autoComplete="off"
          />
          <div className="flex w-full md:w-auto gap-2">
            <button
              type="submit"
              className="flex-1 md:flex-none px-4 py-2 bg-black text-white font-semibold rounded hover:bg-slate-900 transition-colors text-sm tracking-wide uppercase"
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
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-slate-600 mb-4">
              {searchTerm ? 'No products found.' : 'No products yet.'}
            </p>
            <a href="/products/add" className="inline-block px-4 py-2 bg-black text-white font-semibold rounded hover:bg-slate-900 transition-colors text-sm tracking-wide uppercase">
              Add Product
            </a>
          </div>
        )}

        {/* Cards */}
        {!loading && filteredProducts.length > 0 && (
          <div className="space-y-3">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className="border border-slate-200 rounded p-3 bg-white cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => {
                  window.location.href = `/batches?search=${encodeURIComponent(product.part_number)}`;
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className=" font-bold text-black text-sm underline decoration-dashed underline-offset-4">{product.part_number}</div>
                  <div className="text-xs font-medium bg-slate-100 text-black px-2 py-1 rounded">{product.product_type}</div>
                </div>
                <div className="space-y-1 text-xs">
                  {product.description && (
                    <div className="text-slate-600">{product.description}</div>
                  )}
                  <div className="text-slate-500 pt-1">{formatDate(product.created_at)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
