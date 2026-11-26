/**
 * Interfaz de la base de conocimientos para los componentes.
 * Los hooks esconden el adaptador de datos, las query keys y la invalidación de caché.
 * Un solo modo de error: toda falla llega como ApiClientError (en `error` o en el rechazo de la mutación).
 * Hoy los datos vienen de knowledge.mock.ts; con el módulo real del backend solo cambia `adapter`.
 */
import { keepPreviousData, skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ApiClientError } from '@/shared/api/api-client';
import { useSession } from '@/shared/session/session.client';

import { knowledgeMock } from './knowledge.mock';
import type { Viewer } from './knowledge.rules';
import type { Article, ArticleFilters, ArticleInput, Rating } from './knowledge.schemas';

const adapter = knowledgeMock;

const articleKeys = {
  all: ['knowledge'] as const,
  // Lo visible y la valoración propia dependen del usuario, por eso las keys llevan su id
  list: (viewerId: string, filters: ArticleFilters) => [...articleKeys.all, 'list', viewerId, filters] as const,
  detail: (viewerId: string, id: string) => [...articleKeys.all, 'detail', viewerId, id] as const,
};

function useViewer(): Viewer | null {
  const { user } = useSession();
  return user ? { id: user.id, name: user.name, role: user.role } : null;
}

function requireViewer(viewer: Viewer | null): Viewer {
  if (!viewer) throw new ApiClientError('Sesión expirada. Por favor inicia sesión nuevamente.', 401);
  return viewer;
}

/** Artículos visibles para el usuario que cumplen los filtros. Mientras filtra se sigue mostrando la lista anterior. */
export function useArticles(filters: ArticleFilters = {}) {
  const viewer = useViewer();
  return useQuery({
    queryKey: articleKeys.list(viewer?.id ?? '', filters),
    queryFn: viewer ? () => adapter.list(filters, viewer) : skipToken,
    placeholderData: keepPreviousData,
  });
}

// null significa "no existe o no es visible"; cualquier otra falla se propaga
async function fetchArticle(id: string, viewer: Viewer): Promise<Article | null> {
  try {
    return await adapter.get(id, viewer);
  } catch (error) {
    if (error instanceof ApiClientError && error.statusCode === 404) return null;
    throw error;
  }
}

/** Detalle de un artículo; `data` es null si no existe o el usuario no puede verlo. Abrirlo cuenta una vista. */
export function useArticle(id: string | null) {
  const viewer = useViewer();
  return useQuery({
    queryKey: articleKeys.detail(viewer?.id ?? '', id ?? ''),
    queryFn: id && viewer ? () => fetchArticle(id, viewer) : skipToken,
  });
}

/** Crea el artículo si no recibe id; si lo recibe, lo actualiza. Refresca listas y detalle al terminar. */
export function useSaveArticle() {
  const viewer = useViewer();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id?: string; input: ArticleInput }) => adapter.save(input, requireViewer(viewer), id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: articleKeys.all }),
  });
}

/** Valora el artículo; valorar de nuevo reemplaza la valoración anterior. */
export function useRateArticle(id: string) {
  const viewer = useViewer();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rating: Rating) => adapter.rate(id, rating, requireViewer(viewer)),
    onSuccess: (article) => {
      queryClient.setQueryData(articleKeys.detail(viewer?.id ?? '', id), article);
      return queryClient.invalidateQueries({ queryKey: [...articleKeys.all, 'list'] });
    },
  });
}

/** Cantidad de artículos publicados visibles para el usuario. */
export function usePublishedArticleCount() {
  const viewer = useViewer();
  return useQuery({
    queryKey: articleKeys.list(viewer?.id ?? '', {}),
    queryFn: viewer ? () => adapter.list({}, viewer) : skipToken,
    select: (articles) => articles.length,
  });
}

/** Los artículos publicados editados más recientemente. */
export function useRecentArticles(limit: number) {
  const viewer = useViewer();
  return useQuery({
    queryKey: articleKeys.list(viewer?.id ?? '', {}),
    queryFn: viewer ? () => adapter.list({}, viewer) : skipToken,
    select: (articles) => [...articles].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, limit),
  });
}
