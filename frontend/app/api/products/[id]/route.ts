import { NextResponse } from 'next/server';

import { BackendProductSchema, UpdateProductRequestSchema } from '@/lib/schemas/product.schema';
import { callBackend, parseBody, proxyToBackend } from '@/lib/server/backend';

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  const { id } = await params;
  return proxyToBackend({
    path: `/api/products/${id}`,
    schema: BackendProductSchema,
    errorMessage: 'Error al obtener producto',
  });
}

export async function PATCH(request: Request, { params }: Context) {
  const { id } = await params;
  const body = await parseBody(request, UpdateProductRequestSchema, 'Datos del producto inválidos', { partial: true });
  if (body.response) return body.response;

  return proxyToBackend({
    path: `/api/products/${id}`,
    method: 'PATCH',
    body: body.data,
    schema: BackendProductSchema,
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
