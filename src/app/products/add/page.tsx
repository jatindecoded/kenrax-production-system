'use client';

import { Suspense } from 'react';
import AddProductContent from './content';

export default function AddProductPage() {
  return (
    <Suspense fallback={<div className="bg-white flex items-center justify-center p-4 min-h-screen">Loading...</div>}>
      <AddProductContent />
    </Suspense>
  );
}
