import { Badge } from '@/components/ui/badge';
import { TONE_CLASSES } from '@/lib/shared/tones';

import { type ProductStatus, stockLevel } from '../products.client';

const STATUS_LABELS: Record<ProductStatus, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
  discontinued: 'Descontinuado',
};

const STATUS_TONES: Record<ProductStatus, string> = {
  active: TONE_CLASSES.success,
  inactive: TONE_CLASSES.inactive,
  discontinued: TONE_CLASSES.danger,
};

export const PRODUCT_STATUSES = Object.keys(STATUS_LABELS) as ProductStatus[];

export function productStatusLabel(status: ProductStatus): string {
  return STATUS_LABELS[status];
}

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  return (
    <Badge variant="outline" className={STATUS_TONES[status]}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

export function StockBadge({ stock }: { stock: number }) {
  switch (stockLevel(stock)) {
    case 'out':
      return (
        <Badge variant="outline" className={TONE_CLASSES.danger}>
          Sin stock
        </Badge>
      );
    case 'low':
      return (
        <Badge variant="outline" className={TONE_CLASSES.warning}>
          Stock bajo
        </Badge>
      );
    case 'ok':
      return <Badge variant="outline">{stock} unidades</Badge>;
  }
}
