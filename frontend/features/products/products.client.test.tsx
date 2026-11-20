import { act, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiClientError } from '@/shared/api/api-client';
import { bffCalls, mockBff } from '@/test/mock-bff';
import { renderHookWithQuery } from '@/test/render';

import {
  stockLevel,
  useDeleteProduct,
  useProduct,
  useProducts,
  useSaveProduct,
  useStockSummary,
} from './products.client';
import { page, product } from './products.fixtures';

const input = {
  name: 'Cable HDMI',
  description: '',
  sku: 'HDMI-001',
  price: 0,
  stock: 3,
  status: 'active' as const,
  brandId: 'b1',
  categoryIds: ['c1'],
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('stockLevel', () => {
  it.each([
    [0, 'out'],
    [1, 'low'],
    [5, 'low'],
    [6, 'ok'],
  ] as const)('stock %i is %s', (stock, level) => {
    expect(stockLevel(stock)).toBe(level);
  });
});

describe('useProducts', () => {
  it('requests the page with only the filters that have a value', async () => {
    const fetchMock = mockBff({ 'GET /api/products': () => ({ status: 200, body: page([product]) }) });

    const { result } = renderHookWithQuery(() =>
      useProducts({ search: 'cable', category: undefined, status: 'active', page: 2, limit: 20 }),
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data?.data).toEqual([product]);
    expect(bffCalls(fetchMock)).toEqual(['GET /api/products?search=cable&status=active&page=2&limit=20']);
  });

  it('exposes BFF failures as ApiClientError', async () => {
    mockBff({ 'GET /api/products': () => ({ status: 502, body: { message: 'Sin backend' } }) });

    const { result } = renderHookWithQuery(() => useProducts({}));

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.error).toBeInstanceOf(ApiClientError);
    expect(result.current.error).toMatchObject({ statusCode: 502 });
  });
});

describe('useProduct', () => {
  it('returns null when the product does not exist', async () => {
    mockBff({ 'GET /api/products/:id': () => ({ status: 404, body: { message: 'No encontrado' } }) });

    const { result } = renderHookWithQuery(() => useProduct('missing'));

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data).toBeNull();
  });

  it('fails instead of reporting a missing product when the server is down', async () => {
    mockBff({ 'GET /api/products/:id': () => ({ status: 502, body: { message: 'Sin backend' } }) });

    const { result } = renderHookWithQuery(() => useProduct('p1'));

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('does not request anything without an id', () => {
    const fetchMock = mockBff({});

    renderHookWithQuery(() => useProduct(null));

    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('useSaveProduct', () => {
  it('creates without id and updates with id, refreshing the list each time', async () => {
    const fetchMock = mockBff({
      'GET /api/products': () => ({ status: 200, body: page([product]) }),
      'POST /api/products': () => ({ status: 201, body: product }),
      'PATCH /api/products/:id': () => ({ status: 200, body: product }),
    });
    const { result } = renderHookWithQuery(() => ({ list: useProducts({}), save: useSaveProduct() }));
    await waitFor(() => {
      expect(result.current.list.isSuccess).toBe(true);
    });

    await act(() => result.current.save.mutateAsync({ input }));
    await act(() => result.current.save.mutateAsync({ id: 'p1', input }));

    expect(bffCalls(fetchMock)).toEqual([
      'GET /api/products',
      'POST /api/products',
      'GET /api/products',
      'PATCH /api/products/p1',
      'GET /api/products',
    ]);
  });

  it('rejects with the backend message, e.g. a duplicated SKU', async () => {
    mockBff({ 'POST /api/products': () => ({ status: 409, body: { message: 'El SKU ya existe' } }) });
    const { result } = renderHookWithQuery(() => useSaveProduct());

    await expect(act(() => result.current.mutateAsync({ input }))).rejects.toMatchObject({
      statusCode: 409,
      message: 'El SKU ya existe',
    });
  });
});

describe('useDeleteProduct', () => {
  it('deletes and refreshes the list', async () => {
    const fetchMock = mockBff({
      'GET /api/products': () => ({ status: 200, body: page([product]) }),
      'DELETE /api/products/:id': () => ({ status: 200, body: { message: 'ok' } }),
    });
    const { result } = renderHookWithQuery(() => ({ list: useProducts({}), remove: useDeleteProduct() }));
    await waitFor(() => {
      expect(result.current.list.isSuccess).toBe(true);
    });

    await act(() => result.current.remove.mutateAsync('p1'));

    expect(bffCalls(fetchMock)).toEqual(['GET /api/products', 'DELETE /api/products/p1', 'GET /api/products']);
  });

  it('rejects with ApiClientError when the delete fails', async () => {
    mockBff({ 'DELETE /api/products/:id': () => ({ status: 403, body: { message: 'Forbidden' } }) });
    const { result } = renderHookWithQuery(() => useDeleteProduct());

    await expect(act(() => result.current.mutateAsync('p1'))).rejects.toBeInstanceOf(ApiClientError);
  });
});

describe('useStockSummary', () => {
  const stockRoutes = (total: () => number) => ({
    'GET /api/products': ({ url }: { url: URL }) => ({
      status: 200,
      body: page([], url.searchParams.has('maxStock') ? 4 : total()),
    }),
  });

  it('counts all products and those at or below the low stock threshold', async () => {
    const fetchMock = mockBff(stockRoutes(() => 30));

    const { result } = renderHookWithQuery(() => useStockSummary());

    await waitFor(() => {
      expect(result.current.data).toEqual({ total: 30, lowStock: 4 });
    });
    expect(bffCalls(fetchMock)).toEqual(['GET /api/products?limit=1', 'GET /api/products?limit=1&maxStock=5']);
  });

  it('refreshes after a product is deleted', async () => {
    let total = 30;
    mockBff({
      ...stockRoutes(() => total),
      'DELETE /api/products/:id': () => {
        total -= 1;
        return { status: 200, body: { message: 'ok' } };
      },
    });
    const { result } = renderHookWithQuery(() => ({ summary: useStockSummary(), remove: useDeleteProduct() }));
    await waitFor(() => {
      expect(result.current.summary.data?.total).toBe(30);
    });

    await act(() => result.current.remove.mutateAsync('p1'));

    await waitFor(() => {
      expect(result.current.summary.data?.total).toBe(29);
    });
  });
});
