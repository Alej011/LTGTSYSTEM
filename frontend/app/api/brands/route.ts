import { BrandsResponseSchema } from '@/lib/schemas/product.schema';
import { proxyToBackend } from '@/lib/server/backend';

export function GET() {
  return proxyToBackend({
    path: '/api/brands',
    schema: BrandsResponseSchema,
    errorMessage: 'Error al obtener marcas',
  });
}
