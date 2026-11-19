import { describe, expect, it } from 'vitest';

import {
  CreateProductRequestSchema,
  PaginatedProductsSchema,
  ProductSchema,
  UpdateProductRequestSchema,
} from './products.schemas';

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

describe('CreateProductRequestSchema', () => {
  const request = {
    name: 'Cable HDMI',
    sku: 'HDMI-001',
    price: 0,
    stock: 10,
    status: 'active',
    brandId: 'clbrand1',
    categoryIds: ['clcat1'],
  };

  it('accepts price 0 and no description, like the backend DTO', () => {
    expect(CreateProductRequestSchema.safeParse(request).success).toBe(true);
  });

  it('rejects a negative price', () => {
    expect(CreateProductRequestSchema.safeParse({ ...request, price: -1 }).success).toBe(false);
  });
});

describe('UpdateProductRequestSchema', () => {
  it('accepts clearing the description and setting price 0', () => {
    expect(UpdateProductRequestSchema.safeParse({ description: '', price: 0 }).success).toBe(true);
  });
});
