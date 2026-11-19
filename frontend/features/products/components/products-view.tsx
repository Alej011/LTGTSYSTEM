'use client';

import { useState } from 'react';

import type { Product } from '../products.client';
import { ProductForm } from './product-form';
import { ProductList } from './product-list';

type View = { mode: 'list' } | { mode: 'form'; product?: Product };

export function ProductsView() {
  const [view, setView] = useState<View>({ mode: 'list' });
  const showList = () => setView({ mode: 'list' });

  return (
    <div className="p-6">
      {view.mode === 'list' ? (
        <ProductList onEdit={(product) => setView({ mode: 'form', product })} onAdd={() => setView({ mode: 'form' })} />
      ) : (
        <ProductForm key={view.product?.id ?? 'new'} product={view.product} onSuccess={showList} onCancel={showList} />
      )}
    </div>
  );
}
