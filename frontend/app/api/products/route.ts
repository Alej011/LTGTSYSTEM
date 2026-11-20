import type { NextRequest } from 'next/server';

import { PaginatedProductsSchema, ProductSchema } from '@/features/products/products.schemas';
import { proxyToBackend, readJsonBody } from '@/shared/api/bff.server';

// Los filtros llegan tal cual al backend, que los valida con QueryProductsDto
export function GET(request: NextRequest) {
  return proxyToBackend({
    path: `/api/products${request.nextUrl.search}`,
    schema: PaginatedProductsSchema,
    errorMessage: 'Error al obtener productos',
  });
}

export async function POST(request: Request) {
  const body = await readJsonBody(request);
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
