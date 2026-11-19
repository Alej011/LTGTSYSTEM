import { BrandsResponseSchema } from '@/features/products/products.schemas';
import { proxyToBackend } from '@/lib/server/backend';

export function GET() {
  return proxyToBackend({
    path: '/api/brands',
    schema: BrandsResponseSchema,
    errorMessage: 'Error al obtener marcas',
  });
}
