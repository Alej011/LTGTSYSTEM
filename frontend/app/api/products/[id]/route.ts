import { NextResponse } from 'next/server';

import { ProductSchema } from '@/features/products/products.schemas';
import { callBackend, proxyToBackend, readJsonBody } from '@/shared/api/bff.server';

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  const { id } = await params;
  return proxyToBackend({
    path: `/api/products/${id}`,
    schema: ProductSchema,
    errorMessage: 'Error al obtener producto',
  });
}

export async function PATCH(request: Request, { params }: Context) {
  const { id } = await params;
  const body = await readJsonBody(request);
  if (body.response) return body.response;

  return proxyToBackend({
    path: `/api/products/${id}`,
    method: 'PATCH',
    body: body.data,
    schema: ProductSchema,
    errorMessage: 'Error al actualizar producto',
  });
}

export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await params;
  const result = await callBackend({
    path: `/api/products/${id}`,
    method: 'DELETE',
    errorMessage: 'Error al eliminar producto',
  });
  if (!result.ok) return result.response;
  return NextResponse.json({ message: 'Producto eliminado exitosamente' });
}
