import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiClientError } from '@/lib/shared/api-client';

import { createProduct, deleteProduct, getProductById, getProducts } from './products.service';

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

const product = {
  id: 'clprod1',
  name: 'Cable HDMI',
  description: '',
  sku: 'HDMI-001',
  price: 0,
  stock: 10,
  status: 'active',
  brandId: 'clbrand1',
  brand: { id: 'clbrand1', name: 'Genérica' },
  categories: [],
  createdAt: '2026-11-18T00:00:00.000Z',
  updatedAt: '2026-11-18T00:00:00.000Z',
};

describe('products service', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    fetchMock.mockReset();
  });

  describe('REST paths', () => {
    it('lists products from the collection with the filters as query', async () => {
      fetchMock.mockResolvedValue(
        jsonResponse(200, {
          data: [product],
          meta: { page: 2, limit: 20, total: 21, totalPages: 2, hasPrevPage: true, hasNextPage: false },
        }),
      );

      await getProducts({ search: 'cable', page: 2 });

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/products?search=cable&page=2',
        expect.objectContaining({ method: 'GET' }),
      );
    });

    it('creates a product by posting to the collection', async () => {
      fetchMock.mockResolvedValue(jsonResponse(201, product));

      await createProduct({
        name: 'Cable HDMI',
        description: '',
        sku: 'HDMI-001',
        price: 0,
        stock: 10,
        status: 'active',
        brandId: 'clbrand1',
        categoryIds: ['clcat1'],
      });

      expect(fetchMock).toHaveBeenCalledWith('/api/products', expect.objectContaining({ method: 'POST' }));
    });
  });

  describe('deleteProduct', () => {
    it('resolves when the BFF deletes the product', async () => {
      fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

      await expect(deleteProduct('clprod1')).resolves.toBeUndefined();
      expect(fetchMock).toHaveBeenCalledWith('/api/products/clprod1', expect.objectContaining({ method: 'DELETE' }));
    });

    it('rejects with ApiClientError when the delete fails', async () => {
      fetchMock.mockResolvedValue(jsonResponse(409, { message: 'Producto en uso', error: 'CONFLICT' }));

      const error = await deleteProduct('clprod1').catch((e: unknown) => e);

      expect(error).toBeInstanceOf(ApiClientError);
      expect(error).toMatchObject({ statusCode: 409, message: 'Producto en uso' });
    });
  });

  describe('getProductById', () => {
    it('returns the mapped product', async () => {
      fetchMock.mockResolvedValue(jsonResponse(200, product));

      await expect(getProductById('clprod1')).resolves.toMatchObject({ id: 'clprod1', price: 0 });
    });

    it('returns null when the product does not exist', async () => {
      fetchMock.mockResolvedValue(jsonResponse(404, { message: 'No encontrado' }));

      await expect(getProductById('missing')).resolves.toBeNull();
    });

    it('rejects when the server fails instead of reporting a missing product', async () => {
      fetchMock.mockResolvedValue(jsonResponse(502, { message: 'No se pudo conectar con el servidor' }));

      await expect(getProductById('clprod1')).rejects.toMatchObject({ statusCode: 502 });
    });
  });
});
