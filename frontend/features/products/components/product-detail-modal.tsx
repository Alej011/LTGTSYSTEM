'use client';

import { Box, Calendar, DollarSign, Hash, Package, Tag } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ApiClientError } from '@/lib/shared/api-client';

import { useProduct } from '../products.client';
import { ProductStatusBadge, StockBadge } from './product-badges';

interface ProductDetailModalProps {
  productId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailModal({ productId, open, onOpenChange }: ProductDetailModalProps) {
  const product = useProduct(open ? productId : null);
  const item = product.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Detalles del Producto
          </DialogTitle>
          <DialogDescription>Información completa del producto</DialogDescription>
        </DialogHeader>

        {product.isError ? (
          <div role="alert" className="text-center py-8 text-destructive">
            {product.error instanceof ApiClientError
              ? product.error.getUserMessage()
              : 'No se pudo cargar la información del producto'}
          </div>
        ) : product.isPending ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
            <span className="text-muted-foreground">Cargando detalles...</span>
          </div>
        ) : item ? (
          <div className="space-y-6">
            {/* Información básica */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Hash className="h-4 w-4" />
                    <span>SKU</span>
                  </div>
                  <p className="font-mono text-sm font-medium">{item.sku}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Tag className="h-4 w-4" />
                    <span>Marca</span>
                  </div>
                  <p className="text-sm font-medium">{item.brand.name}</p>
                </div>
              </div>
            </div>

            {/* Precio y Stock */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>Precio</span>
                </div>
                <p className="text-2xl font-bold">Q{item.price.toFixed(2)}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Box className="h-4 w-4" />
                  <span>Stock</span>
                </div>
                <div className="mt-2">
                  <StockBadge stock={item.stock} />
                </div>
              </div>
            </div>

            {/* Categorías y Estado */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Categorías</h4>
                <div className="flex gap-2 flex-wrap">
                  {item.categories.map((cat) => (
                    <Badge key={cat.id} variant="outline">
                      {cat.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Estado</h4>
                <div>
                  <ProductStatusBadge status={item.status} />
                </div>
              </div>
            </div>

            {/* Fechas */}
            <div className="pt-4 border-t space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Creado: {new Date(item.createdAt).toLocaleDateString('es-ES')}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Actualizado: {new Date(item.updatedAt).toLocaleDateString('es-ES')}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">El producto no existe o fue eliminado</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
