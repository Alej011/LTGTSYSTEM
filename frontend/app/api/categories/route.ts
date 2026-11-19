import { CategoriesResponseSchema } from '@/features/products/products.schemas';
import { proxyToBackend } from '@/lib/server/backend';

export function GET() {
  return proxyToBackend({
    path: '/api/categories',
    schema: CategoriesResponseSchema,
    errorMessage: 'Error al obtener categorías',
  });
}
