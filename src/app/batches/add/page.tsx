'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { validateBatch } from '@/lib/validation';
import { Product } from '@/lib/db';

export default function AddBatchPage() {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  const [formData, setFormData] = useState({
    batch_code: '',
    product_id: '',
    product_search: '',
    quantity: '',
    produced_by: '',
    production_line: '',
    remarks: '',
  });
  const [errors, setErrors] = useState<{ field: string; message: string }[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProductDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await fetch('/api/products');
      const data = await response.json();
      if (response.ok) {
        setProducts(data);
        setFilteredProducts(data);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Handle product search
    if (name === 'product_search') {
      if (value.trim() === '') {
        setFilteredProducts(products);
      } else {
        const filtered = products.filter(
          (p) =>
            p.part_number.toLowerCase().includes(value.toLowerCase()) ||
            p.product_type.toLowerCase().includes(value.toLowerCase()) ||
            (p.description && p.description.toLowerCase().includes(value.toLowerCase()))
        );
        setFilteredProducts(filtered);
      }
      setShowProductDropdown(true);
    }
  };

  const handleProductSelect = (product: Product) => {
    setFormData((prev) => ({
      ...prev,
      product_id: String(product.id),
      product_search: `${product.part_number} - ${product.product_type}`,
    }));
    setShowProductDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrors([]);

    if (!formData.product_id) {
      setError('Please select a product');
      return;
    }

    // Validate
    const validation = validateBatch({
      product_id: formData.product_id,
      quantity: formData.quantity,
      produced_by: formData.produced_by,
      production_line: formData.production_line,
      remarks: formData.remarks,
    });
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Submit directly
    setLoading(true);

    try {
      const response = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batch_code: formData.batch_code,
          product_id: parseInt(formData.product_id, 10),
          quantity: parseInt(formData.quantity, 10),
          produced_by: formData.produced_by || null,
          production_line: formData.production_line || null,
          remarks: formData.remarks || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create batch');
        return;
      }

      setSuccess(true);
      setFormData({
        batch_code: '',
        product_id: '',
        product_search: '',
        quantity: '',
        produced_by: '',
        production_line: '',
        remarks: '',
      });

      // Redirect to batches list after 2 seconds
      setTimeout(() => {
        router.push('/batches');
      }, 2000);
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white flex flex-col items-center p-4" style={{ fontFamily: 'var(--font-geist-sans)' }}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-black tracking-tight">New Production Batch</h1>
          {formData.product_search && (
            <p className="text-sm text-slate-600 mt-2">Product: <span className="font-medium text-black">{formData.product_search}</span></p>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm font-medium">
            ✓ Production batch created. Redirecting...
          </div>
        )}

        {/* Loading State */}
        {productsLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-300 border-t-blue-600 mb-2"></div>
            <p className="text-sm text-slate-600">Loading...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-600 mb-3">No products available</p>
            <a href="/products/add" className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded hover:bg-blue-700 transition-colors">
              Add Product
            </a>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product Search */}
              <div ref={dropdownRef}>
                <label htmlFor="product_search" className="block text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2">
                  Product <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <input
                    id="product_search"
                    name="product_search"
                    type="text"
                    value={formData.product_search}
                    onChange={handleChange}
                    onFocus={() => setShowProductDropdown(true)}
                    onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                    enterKeyHint="done"
                    placeholder="Search products..."
                    autoComplete="off"
                    className={`w-full px-3 py-2 border rounded text-base bg-white text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all ${
                      errors.some((e) => e.field === 'product_id') ? 'border-red-300 bg-red-50' : 'border-slate-300'
                    }`}
                  />
                  
                  {showProductDropdown && filteredProducts.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded shadow-md max-h-56 overflow-y-auto">
                      {filteredProducts.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => handleProductSelect(product)}
                          className="w-full text-left px-3 py-2 hover:bg-slate-100 transition-colors border-b border-slate-100 last:border-b-0 text-sm"
                        >
                          <div className="font-medium text-slate-900 underline decoration-dashed underline-offset-2">{product.part_number}</div>
                          <div className="text-xs text-slate-600">{product.product_type}</div>
                        </button>
                      ))}
                    </div>
                  )}

                  {showProductDropdown && filteredProducts.length === 0 && formData.product_search && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded shadow-md overflow-hidden">
                      <div className="p-3 text-center text-slate-500 text-xs border-b border-slate-200">
                        No products found
                      </div>
                      <a
                        href={`/products/add?part_number=${encodeURIComponent(formData.product_search)}`}
                        className="block w-full px-3 py-2 text-left text-xs font-medium text-black hover:bg-slate-50 transition-colors uppercase tracking-wide"
                      >
                        + Create New Product
                      </a>
                    </div>
                  )}
                </div>
                {errors.some((e) => e.field === 'product_id') && (
                  <p className="text-xs text-red-600 mt-1">{errors.find((e) => e.field === 'product_id')?.message}</p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label htmlFor="quantity" className="block text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2">
                  Quantity <span className="text-red-600">*</span>
                </label>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  inputMode="numeric"
                  enterKeyHint="done"
                  min="1"
                  value={formData.quantity}
                  onChange={handleChange}
                  onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                  placeholder="0"
                  className={`w-full px-3 py-2 border rounded text-base bg-white text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all ${
                    errors.some((e) => e.field === 'quantity') ? 'border-red-300 bg-red-50' : 'border-slate-300'
                  }`}
                />
                {errors.some((e) => e.field === 'quantity') && (
                  <p className="text-xs text-red-600 mt-1">{errors.find((e) => e.field === 'quantity')?.message}</p>
                )}
              </div>

              {/* Batch Code */}
              <div>
                <label htmlFor="batch_code" className="block text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2">
                  Batch Code
                </label>
                <input
                  id="batch_code"
                  name="batch_code"
                  type="text"
                  inputMode="numeric"
                  enterKeyHint="done"
                  value={formData.batch_code}
                  onChange={handleChange}
                  onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                  placeholder="240701001"
                  className={`w-full px-3 py-2 border rounded text-base bg-white text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all font-mono ${
                    errors.some((e) => e.field === 'batch_code') ? 'border-red-300 bg-red-50' : 'border-slate-300'
                  }`}
                  style={{ fontFamily: 'var(--font-jetbrains-mono)', letterSpacing: '0.05em' }}
                />
                <p className="text-xs text-slate-500 mt-1">Format: YYMMXXX (year, month, quantity)</p>
                {errors.some((e) => e.field === 'batch_code') && (
                  <p className="text-xs text-red-600 mt-1">{errors.find((e) => e.field === 'batch_code')?.message}</p>
                )}
              </div>


              {/* Produced By */}
              <div>
                <label htmlFor="produced_by" className="block text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2">
                  Produced By <span className="font-normal text-slate-500">(Optional)</span>
                </label>
                <input
                  id="produced_by"
                  name="produced_by"
                  type="text"
                  enterKeyHint="done"
                  value={formData.produced_by}
                  onChange={handleChange}
                  onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                  placeholder="Name"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-base bg-white text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                />
              </div>

              {/* Production Line */}
              <div>
                <label htmlFor="production_line" className="block text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2">
                  Line <span className="font-normal text-slate-500">(Optional)</span>
                </label>
                <input
                  id="production_line"
                  name="production_line"
                  type="text"
                  enterKeyHint="done"
                  value={formData.production_line}
                  onChange={handleChange}
                  onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                  placeholder="Line A"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-base bg-white text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                />
              </div>

              {/* Remarks */}
              <div>
                <label htmlFor="remarks" className="block text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2">
                  Remarks <span className="font-normal text-slate-500">(Optional)</span>
                </label>
                <textarea
                  id="remarks"
                  name="remarks"
                  enterKeyHint="done"
                  value={formData.remarks}
                  onChange={handleChange}
                  placeholder="Notes..."
                  rows={2}
                  className={`w-full px-3 py-2 border rounded text-base bg-white text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all resize-none ${
                    errors.some((e) => e.field === 'remarks') ? 'border-red-300 bg-red-50' : 'border-slate-300'
                  }`}
                />
                {errors.some((e) => e.field === 'remarks') && (
                  <p className="text-xs text-red-600 mt-1">{errors.find((e) => e.field === 'remarks')?.message}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-black text-white font-semibold rounded hover:bg-slate-900 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors text-sm tracking-wide uppercase"
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-4 py-3 bg-slate-200 text-slate-900 font-semibold rounded hover:bg-slate-300 transition-colors text-sm tracking-wide uppercase"
                >
                  Cancel
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}