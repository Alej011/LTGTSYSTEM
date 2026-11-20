import { describe, expect, it } from 'vitest';

import { PaginatedProductsSchema, ProductFormSchema, ProductSchema } from './products.schemas';

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

describe('ProductFormSchema', () => {
  const input = {
    name: 'Cable HDMI',
    sku: 'HDMI-001',
    price: 0,
    stock: 10,
    status: 'active',
    brandId: 'clbrand1',
    categoryIds: ['clcat1'],
  };

  it('accepts price 0 and no description, like CreateProductDto', () => {
    expect(ProductFormSchema.safeParse(input).success).toBe(true);
    expect(ProductFormSchema.safeParse({ ...input, description: '' }).success).toBe(true);
  });

  it.each([
    [{ price: -1 }, 'El precio no puede ser negativo'],
    [{ price: 10.005 }, 'El precio admite hasta 2 decimales'],
    [{ stock: 1.5 }, 'El stock debe ser un número entero'],
    [{ name: '   ' }, 'Ingresa el nombre del producto'],
    [{ categoryIds: [] }, 'Selecciona una categoría'],
  ])('rejects %j with a message for the user', (change, message) => {
    const result = ProductFormSchema.safeParse({ ...input, ...change });
    expect(result.error?.issues[0]?.message).toBe(message);
  });

  it('accepts a price with two decimals', () => {
    expect(ProductFormSchema.safeParse({ ...input, price: 1299.99 }).success).toBe(true);
  });
});
