'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { validateProduct } from '@/lib/validation';

export default function AddProductContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    part_number: '',
    product_type: '',
    description: '',
  });
  const [errors, setErrors] = useState<{ field: string; message: string }[]>([]);

  useEffect(() => {
    const partNumber = searchParams.get('part_number');
    if (partNumber) {
      setFormData((prev) => ({ ...prev, part_number: partNumber.toUpperCase() }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Convert part_number to uppercase
    const finalValue = name === 'part_number' ? value.toUpperCase() : value;
    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleProductTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, product_type: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const validation = validateProduct(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    setError(null);
    setErrors([]);

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create product');
        return;
      }

      setSuccess(true);
      setFormData({ part_number: '', product_type: '', description: '' });

      // Redirect to products list after 2 seconds
      setTimeout(() => {
        router.push('/products');
      }, 2000);
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white flex flex-col items-center justify-center p-4 pb-8" style={{ fontFamily: 'var(--font-geist-sans)' }}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-black tracking-tight">New Product</h1>
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
            ✓ Product created. Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Part Number */}
          <div>
            <label htmlFor="part_number" className="block text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2">
              Part Number
            </label>
            <input
              id="part_number"
              name="part_number"
              type="text"
              value={formData.part_number}
              onChange={handleChange}
              placeholder="e.g., AB123"
              autoComplete="off"
              className={`w-full px-3 py-2 border rounded text-base bg-white text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all uppercase font-mono tracking-widest ${
                errors.some((e) => e.field === 'part_number') ? 'border-red-300 bg-red-50' : 'border-slate-300'
              }`}
              style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
            />
            {errors.some((e) => e.field === 'part_number') && (
              <p className="text-xs text-red-600 mt-1">{errors.find((e) => e.field === 'part_number')?.message}</p>
            )}
          </div>

          {/* Product Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wide mb-3">
              Type <span className="text-red-600">*</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'AIR_FILTER', label: 'Air Filter' },
                { value: 'OIL_FILTER', label: 'Oil Filter' },
                { value: 'AIR_OIL_SEPARATOR', label: 'Air Oil Separator' },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`px-4 py-2 border rounded-full cursor-pointer text-sm font-medium transition-all ${
                    formData.product_type === option.value
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-slate-300 hover:border-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="product_type"
                    value={option.value}
                    checked={formData.product_type === option.value}
                    onChange={(e) => handleProductTypeChange(e.target.value)}
                    className="hidden"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            {errors.some((e) => e.field === 'product_type') && (
              <p className="text-xs text-red-600 mt-1">{errors.find((e) => e.field === 'product_type')?.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2">
              Description <span className="font-normal text-slate-500">(Optional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Details..."
              rows={3}
              className={`w-full px-3 py-2 border rounded text-base bg-white text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all resize-none ${
                errors.some((e) => e.field === 'description') ? 'border-red-300 bg-red-50' : 'border-slate-300'
              }`}
            />
            {errors.some((e) => e.field === 'description') && (
              <p className="text-xs text-red-600 mt-1">{errors.find((e) => e.field === 'description')?.message}</p>
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
      </div>
    </div>
  );
}
