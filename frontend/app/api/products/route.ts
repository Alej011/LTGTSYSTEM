import type { NextRequest } from 'next/server';

import {
  CreateProductRequestSchema,
  PaginatedProductsSchema,
  ProductFiltersSchema,
  ProductSchema,
} from '@/features/products/products.schemas';
import { errorResponse, parseBody, proxyToBackend } from '@/lib/server/backend';

const NUMERIC_FILTERS = new Set(['maxStock', 'page', 'limit']);

export function GET(request: NextRequest) {
  const raw: Record<string, string | number> = {};
  for (const [key, value] of request.nextUrl.searchParams) {
    if (value !== '') raw[key] = NUMERIC_FILTERS.has(key) ? Number(value) : value;
  }

  const filters = ProductFiltersSchema.strict().safeParse(raw);
  if (!filters.success) {
    return errorResponse(400, 'Parámetros de búsqueda inválidos', 'VALIDATION_ERROR', filters.error.issues);
  }

  const query = new URLSearchParams(
    Object.entries(filters.data).map(([key, value]) => [key, String(value)]),
  ).toString();

  return proxyToBackend({
    path: `/api/products${query ? `?${query}` : ''}`,
    schema: PaginatedProductsSchema,
    errorMessage: 'Error al obtener productos',
  });
}

export async function POST(request: Request) {
  const body = await parseBody(request, CreateProductRequestSchema, 'Datos del producto inválidos');
  if (body.response) return body.response;

  return proxyToBackend({
    path: '/api/products',
    method: 'POST',
    body: body.data,
    schema: ProductSchema,
    status: 201,
    errorMessage: 'Error al crear producto',
  });
}
