import { Badge } from '@/components/ui/badge';
import { TONE_CLASSES } from '@/shared/lib/tones';

import type { ArticleCategory, ArticleStatus } from '../knowledge.schemas';

// Los valores del modelo están en inglés; en pantalla siempre en español
const STATUS: Record<ArticleStatus, { label: string; tone: string }> = {
  DRAFT: { label: 'Borrador', tone: TONE_CLASSES.warning },
  PUBLISHED: { label: 'Publicado', tone: TONE_CLASSES.success },
  ARCHIVED: { label: 'Archivado', tone: TONE_CLASSES.neutral },
};

const CATEGORY: Record<ArticleCategory, string> = {
  HARDWARE: 'Hardware',
  SOFTWARE: 'Software',
  NETWORK: 'Red/Conectividad',
  ACCESS: 'Acceso/Permisos',
  PROCEDURES: 'Procedimientos',
  FAQ: 'Preguntas Frecuentes',
};

export const articleStatusLabel = (status: ArticleStatus) => STATUS[status].label;
export const articleCategoryLabel = (category: ArticleCategory) => CATEGORY[category];

export function ArticleStatusBadge({ status }: { status: ArticleStatus }) {
  return (
    <Badge variant="outline" className={STATUS[status].tone}>
      {STATUS[status].label}
    </Badge>
  );
}

export function TagBadge({ children }: { children: string }) {
  return (
    <Badge variant="outline" className={`text-xs ${TONE_CLASSES.neutral}`}>
      {children}
    </Badge>
  );
}
