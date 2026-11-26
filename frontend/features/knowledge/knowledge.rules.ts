/**
 * Quién ve cada artículo (docs/roles-y-permisos.md, sección 2). Funciones puras: las usa el adaptador mock para
 * responder como lo hará el backend. Solo preguntan permisos, nunca el nombre del rol.
 */
import { can } from '@/shared/permissions';
import type { Role } from '@/shared/roles';

import type { Article } from './knowledge.schemas';

export type Viewer = { id: string; name: string; role: Role };

/** Quien puede editar artículos ve también borradores y archivados. */
export function managesArticles(viewer: Viewer | null | undefined): boolean {
  return !!viewer && can(viewer.role, 'knowledge', 'edit');
}

/**
 * El autor y quien gestiona artículos siempre lo ven. El resto, solo si está publicado y es de toda la empresa
 * o de su departamento. Los usuarios aún no tienen departamento (llega en la fase I).
 */
export function canSeeArticle(
  article: Pick<Article, 'author' | 'status' | 'isCompanyWide' | 'departmentIds'>,
  viewer: Viewer | null | undefined,
  viewerDepartmentId?: string,
): boolean {
  if (!viewer || !can(viewer.role, 'knowledge', 'view')) return false;
  if (article.author?.id === viewer.id || managesArticles(viewer)) return true;
  if (article.status !== 'PUBLISHED') return false;
  return article.isCompanyWide || (!!viewerDepartmentId && article.departmentIds.includes(viewerDepartmentId));
}
