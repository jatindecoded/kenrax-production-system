import Link from "next/link";

async function getStats() {
  try {
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000'
      : `https://${process.env.VERCEL_URL || 'localhost:3000'}`;
    
    console.log('[getStats] Fetching from:', baseUrl);

    const batchesRes = await fetch(`${baseUrl}/api/batches`, { cache: 'no-store' });
    console.log('[getStats] Batches status:', batchesRes.status);
    
    const productsRes = await fetch(`${baseUrl}/api/products`, { cache: 'no-store' });
    console.log('[getStats] Products status:', productsRes.status);

    const batches = await batchesRes.json();
    const products = await productsRes.json();
    
    console.log('[getStats] Batches data:', batches);
    console.log('[getStats] Products data:', products);

    // Calculate aggregations
    const totalBatches = batches?.length || 0;
    const totalQuantity = (batches || []).reduce((sum: number, b: any) => sum + (b.quantity || 0), 0);
    const totalProducts = products?.length || 0;
    const productTypes: any = {};
    (products || []).forEach((p: any) => {
      productTypes[p.product_type] = (productTypes[p.product_type] || 0) + 1;
    });

    return {
      batches: (batches || []).slice(0, 5),
      products: (products || []).slice(0, 5),
      totalBatches,
      totalQuantity,
      totalProducts,
      productTypes,
    };
  } catch (error) {
    console.error(error);
    return {
      batches: [],
      products: [],
      totalBatches: 0,
      totalQuantity: 0,
      totalProducts: 0,
      productTypes: {},
    };
  }
}

const productTypeLabels: {[key: string]: string} = {
  'AIR_FILTER': 'Air Filter',
  'OIL_FILTER': 'Oil Filter',
  'AIR_OIL_SEPARATOR': 'Air Oil Separator',
};

export const revalidate = 0; // No caching - always fresh

export default async function Home() {
  const stats = await getStats();

  const formatDate = (date: any) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white min-h-screen p-4" style={{ fontFamily: 'var(--font-geist-sans)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-1 tracking-tight">Production Tracking</h1>
          <p className="text-sm text-slate-600">Dashboard Overview</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className="bg-white border border-slate-200 rounded p-4">
            <div className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Total Batches</div>
            <div className="text-2xl font-bold text-black mt-1">{stats.totalBatches}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded p-4">
            <div className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Total Quantity</div>
            <div className="text-2xl font-bold text-black mt-1">{stats.totalQuantity}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded p-4">
            <div className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Total Products</div>
            <div className="text-2xl font-bold text-black mt-1">{stats.totalProducts}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded p-4">
            <div className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Product Types</div>
            <div className="text-2xl font-bold text-black mt-1">{Object.keys(stats.productTypes).length}</div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <a href="/batches/add" className="px-4 py-3 bg-black text-white font-semibold text-center rounded hover:bg-slate-900 transition-colors text-sm tracking-wide uppercase">
            + Log Batch
          </a>
          <a href="/products/add" className="px-4 py-3 bg-black text-white font-semibold text-center rounded hover:bg-slate-900 transition-colors text-sm tracking-wide uppercase">
            + Product
          </a>
          <a href="/batches" className="px-4 py-3 bg-slate-200 text-black font-medium text-center rounded hover:bg-slate-300 transition-colors text-sm">
            All Batches
          </a>
          <a href="/products" className="px-4 py-3 bg-slate-200 text-black font-medium text-center rounded hover:bg-slate-300 transition-colors text-sm">
            All Products
          </a>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Production Batches */}
          <div className="border border-slate-200 rounded overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
              <h2 className="text-sm font-semibold text-black uppercase tracking-wide">Recent Batches</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-black">Code</th>
                    <th className="px-3 py-2 text-left font-semibold text-black">Part</th>
                    <th className="px-3 py-2 text-right font-semibold text-black">Qty</th>
                    <th className="px-3 py-2 text-left font-semibold text-black">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.batches.length > 0 ? (
                    stats.batches.map((batch: any, idx: number) => (
                      <tr key={batch.id} className={idx !== stats.batches.length - 1 ? 'border-b border-slate-100' : ''}>
                        <td className="px-3 py-2 font-mono font-medium text-black">{batch.batch_code}</td>
                        <td className="px-3 py-2 text-black">{batch.part_number || '-'}</td>
                        <td className="px-3 py-2 text-right text-black font-medium">{batch.quantity}</td>
                        <td className="px-3 py-2 text-slate-600">{formatDate(batch.created_at)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-3 py-4 text-center text-slate-500 text-xs">
                        No batches yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Products Overview */}
          <div className="border border-slate-200 rounded overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
              <h2 className="text-sm font-semibold text-black uppercase tracking-wide">Recent Products</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-black">Part No.</th>
                    <th className="px-3 py-2 text-left font-semibold text-black">Type</th>
                    <th className="px-3 py-2 text-left font-semibold text-black">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.products.length > 0 ? (
                    stats.products.map((product: any, idx: number) => (
                      <tr key={product.id} className={idx !== stats.products.length - 1 ? 'border-b border-slate-100' : ''}>
                        <td className="px-3 py-2 font-mono font-medium text-black">{product.part_number}</td>
                        <td className="px-3 py-2 text-black text-xs">{productTypeLabels[product.product_type] || product.product_type}</td>
                        <td className="px-3 py-2 text-slate-600">{formatDate(product.created_at)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-3 py-4 text-center text-slate-500 text-xs">
                        No products yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Type Distribution */}
        {Object.keys(stats.productTypes).length > 0 && (
          <div className="mt-6 border border-slate-200 rounded p-4">
            <h2 className="text-sm font-semibold text-black uppercase tracking-wide mb-3">Product Types</h2>
            <div className="flex flex-wrap gap-4">
              {Object.entries(stats.productTypes).map(([type, count]: [string, any]) => (
                <div key={type} className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-black rounded-full"></div>
                  <span className="text-sm text-black font-medium">
                    {productTypeLabels[type] || type}: <span className="font-bold">{count}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}