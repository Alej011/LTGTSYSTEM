import type { Product } from './products.client';

// Datos de prueba con la forma que devuelve el BFF
export const product: Product = {
  id: 'p1',
  name: 'Cable HDMI',
  description: '',
  sku: 'HDMI-001',
  price: 0,
  stock: 3,
  status: 'active',
  brandId: 'b1',
  brand: { id: 'b1', name: 'Genérica' },
  categories: [{ id: 'c1', name: 'Accesorios' }],
  createdAt: '2026-11-18T00:00:00.000Z',
  updatedAt: '2026-11-18T00:00:00.000Z',
};

export const page = (data: Product[], total = data.length) => ({
  data,
  meta: { page: 1, limit: 20, total, totalPages: 1, hasPrevPage: false, hasNextPage: false },
});
