import { describe, expect, it } from 'vitest';

import { PaginatedProductsSchema, ProductSchema } from './products.schemas';

const backendProduct = {
  id: 'clprod1',
  name: 'Cable HDMI',
  description: '',
  sku: 'HDMI-001',
  price: 0,
  stock: 10,
  status: 'active',
  brandId: 'clbrand1',
  brand: { id: 'clbrand1', name: 'Genérica' },
  categories: [{ id: 'clcat1', name: 'Accesorios' }],
  createdAt: '2026-11-18T00:00:00.000Z',
  updatedAt: '2026-11-18T00:00:00.000Z',
};

const meta = { page: 1, limit: 20, total: 1, totalPages: 1, hasPrevPage: false, hasNextPage: false };

describe('ProductSchema', () => {
  it('accepts a free product with an empty description', () => {
    expect(ProductSchema.safeParse(backendProduct).success).toBe(true);
  });

  it('keeps the whole list valid when one product costs 0', () => {
    expect(PaginatedProductsSchema.safeParse({ data: [backendProduct], meta }).success).toBe(true);
  });
});
