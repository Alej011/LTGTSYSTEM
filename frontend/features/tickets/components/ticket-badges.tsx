import { Badge } from '@/components/ui/badge';
import { TONE_CLASSES } from '@/shared/lib/tones';

import type { CloseReason, TicketCategory, TicketPriority, TicketStatus } from '../tickets.schemas';

// Los valores del modelo están en inglés; en pantalla siempre en español
const STATUS: Record<TicketStatus, { label: string; tone: string }> = {
  OPEN: { label: 'Abierto', tone: TONE_CLASSES.info },
  IN_PROGRESS: { label: 'En progreso', tone: TONE_CLASSES.warning },
  RESOLVED: { label: 'Resuelto', tone: TONE_CLASSES.success },
  CLOSED: { label: 'Cerrado', tone: TONE_CLASSES.neutral },
};

const PRIORITY: Record<TicketPriority, { label: string; tone: string }> = {
  LOW: { label: 'Baja', tone: TONE_CLASSES.neutral },
  MEDIUM: { label: 'Media', tone: TONE_CLASSES.info },
  HIGH: { label: 'Alta', tone: TONE_CLASSES.warning },
  CRITICAL: { label: 'Crítica', tone: TONE_CLASSES.danger },
};

const CATEGORY: Record<TicketCategory, string> = {
  HARDWARE: 'Hardware',
  SOFTWARE: 'Software',
  NETWORK: 'Red/Conectividad',
  ACCESS: 'Acceso/Permisos',
  OTHER: 'Otro',
};

const CLOSE_REASON: Record<CloseReason, string> = {
  CONFIRMED: 'Cerrado por el solicitante',
  AUTO: 'Cerrado automáticamente',
  ADMIN: 'Cerrado por un Administrador',
};

export const ticketStatusLabel = (status: TicketStatus) => STATUS[status].label;
export const ticketPriorityLabel = (priority: TicketPriority) => PRIORITY[priority].label;
export const ticketCategoryLabel = (category: TicketCategory) => CATEGORY[category];
export const closeReasonLabel = (reason: CloseReason) => CLOSE_REASON[reason];

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return (
    <Badge variant="outline" className={STATUS[status].tone}>
      {STATUS[status].label}
    </Badge>
  );
}

export function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
  return (
    <Badge variant="outline" className={PRIORITY[priority].tone}>
      {PRIORITY[priority].label}
    </Badge>
  );
}
