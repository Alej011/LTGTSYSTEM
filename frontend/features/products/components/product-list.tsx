'use client';

import { Edit, Eye, Package, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ApiClientError } from '@/lib/shared/api-client';
import { useCan } from '@/lib/shared/use-can';

import { type Product, type ProductStatus, useCategories, useDeleteProduct, useProducts } from '../products.client';
import { PRODUCT_STATUSES, ProductStatusBadge, productStatusLabel, StockBadge } from './product-badges';
import { ProductDetailModal } from './product-detail-modal';

const PAGE_SIZE = 20;
const ALL = 'all';
const COLUMNS = 8;

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiClientError ? error.getUserMessage() : fallback;
}

interface ProductListProps {
  onEdit: (product: Product) => void;
  onAdd: () => void;
}

export function ProductList({ onEdit, onAdd }: ProductListProps) {
  const can = useCan();
  const canEdit = can('products', 'edit');
  const canDelete = can('products', 'delete');

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(ALL);
  const [status, setStatus] = useState<ProductStatus | typeof ALL>(ALL);
  const [page, setPage] = useState(1);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [detailProductId, setDetailProductId] = useState<string | null>(null);

  const products = useProducts({
    search: search || undefined,
    category: category === ALL ? undefined : category,
    status: status === ALL ? undefined : status,
    page,
    limit: PAGE_SIZE,
  });
  const categories = useCategories();
  const deleteProduct = useDeleteProduct();

  const pagination = products.data?.meta;
  const rows = products.data?.data ?? [];

  // Cambiar un filtro vuelve a la primera página
  const changeFilter = (apply: () => void) => {
    apply();
    setPage(1);
  };

  const closeDeleteDialog = () => {
    setProductToDelete(null);
    deleteProduct.reset();
  };

  const confirmDelete = () => {
    if (!productToDelete) return;
    deleteProduct.mutate(productToDelete.id, { onSuccess: closeDeleteDialog });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Gestión de Productos
              </CardTitle>
              <CardDescription>Administra el catálogo de productos y sus marcas asociadas</CardDescription>
            </div>
            {can('products', 'create') && (
              <Button onClick={onAdd}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Producto
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por nombre, SKU o marca..."
                  value={search}
                  onChange={(e) => changeFilter(() => setSearch(e.target.value))}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={category} onValueChange={(value) => changeFilter(() => setCategory(value))}>
              <SelectTrigger className="w-full md:w-48" aria-label="Categoría">
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todas las categorías</SelectItem>
                {categories.data?.map((item) => (
                  <SelectItem key={item.id} value={item.name}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={status}
              onValueChange={(value) => changeFilter(() => setStatus(value as ProductStatus | typeof ALL))}
            >
              <SelectTrigger className="w-full md:w-40" aria-label="Estado">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos los estados</SelectItem>
                {PRODUCT_STATUSES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {productStatusLabel(value)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-center">Categoría</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.isPending ? (
                  <TableRow>
                    <TableCell colSpan={COLUMNS} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
                        <span className="text-muted-foreground">Cargando productos...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : products.isError ? (
                  <TableRow>
                    <TableCell colSpan={COLUMNS} role="alert" className="text-center py-8 text-destructive">
                      {errorMessage(products.error, 'No se pudieron cargar los productos')}
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={COLUMNS} className="text-center py-8 text-muted-foreground">
                      No se encontraron productos
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">{product.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>{product.brand.name}</TableCell>
                      <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          {product.categories.map((item) => (
                            <Badge key={item.id} variant="outline" className="text-xs">
                              {item.name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>Q{product.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <StockBadge stock={product.stock} />
                      </TableCell>
                      <TableCell>
                        <ProductStatusBadge status={product.status} />
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          {can('products', 'view_details') && !canEdit && !canDelete && (
                            <Button variant="outline" size="sm" onClick={() => setDetailProductId(product.id)}>
                              <Eye className="h-4 w-4 mr-1" />
                              Ver Detalles
                            </Button>
                          )}
                          {canEdit && (
                            <Button
                              variant="outline"
                              size="sm"
                              aria-label={`Editar ${product.name}`}
                              onClick={() => onEdit(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="outline"
                              size="sm"
                              aria-label={`Eliminar ${product.name}`}
                              onClick={() => setProductToDelete(product)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {(pagination.page - 1) * pagination.limit + 1} a{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} productos
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(pagination.page - 1)}
                  disabled={!pagination.hasPrevPage || products.isFetching}
                >
                  Anterior
                </Button>
                <div className="text-sm">
                  Página {pagination.page} de {pagination.totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(pagination.page + 1)}
                  disabled={!pagination.hasNextPage || products.isFetching}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={productToDelete !== null}
        onOpenChange={(open) => {
          if (!open) closeDeleteDialog();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto "{productToDelete?.name}" será eliminado permanentemente del
              sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteProduct.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {errorMessage(deleteProduct.error, 'No se pudo eliminar el producto. Intente nuevamente.')}
              </AlertDescription>
            </Alert>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteProduct.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                // El diálogo solo se cierra si el borrado funciona
                e.preventDefault();
                confirmDelete();
              }}
              disabled={deleteProduct.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProduct.isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ProductDetailModal
        productId={detailProductId}
        open={detailProductId !== null}
        onOpenChange={(open) => {
          if (!open) setDetailProductId(null);
        }}
      />
    </div>
  );
}
