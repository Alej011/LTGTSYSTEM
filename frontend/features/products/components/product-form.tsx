'use client';
import { ArrowLeft, Loader2 } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

import { FieldError, fieldErrorProps, fieldErrorsOf } from '@/components/field-error';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ApiClientError } from '@/shared/api/api-client';

import { type Product, type ProductStatus, useBrands, useCategories, useSaveProduct } from '../products.client';
import { ProductFormSchema } from '../products.schemas';
import { PRODUCT_STATUSES, productStatusLabel } from './product-badges';

interface ProductFormProps {
  product?: Product;
  onSuccess: () => void;
  onCancel: () => void;
}

// El formulario elige una sola categoría; el backend recibe una lista
function initialFormState(product?: Product) {
  return {
    name: product?.name ?? '',
    description: product?.description ?? '',
    brandId: product?.brandId ?? '',
    sku: product?.sku ?? '',
    stock: product?.stock ?? 0,
    price: product?.price ?? 0,
    categoryId: product?.categories[0]?.id ?? '',
    status: product?.status ?? 'active',
  };
}

type FormState = ReturnType<typeof initialFormState>;
type FieldErrors = Partial<Record<keyof FormState, string>>;

// Quien lo usa debe darle un key por producto para reiniciar el estado al cambiar de producto
export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState(() => initialFormState(product));
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const brands = useBrands();
  const categories = useCategories();
  const saveProduct = useSaveProduct();

  const loadError = brands.isError || categories.isError ? 'Error al cargar marcas y categorías' : '';
  const saveError = saveProduct.isError
    ? saveProduct.error instanceof ApiClientError
      ? saveProduct.error.getUserMessage()
      : 'Error al guardar el producto. Intente nuevamente.'
    : '';
  const error = saveError || loadError;

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { categoryId, ...rest } = formData;
    const input = ProductFormSchema.safeParse({ ...rest, categoryIds: categoryId ? [categoryId] : [] });
    if (!input.success) {
      setFieldErrors(fieldErrorsOf<keyof FormState>(input.error.issues, { categoryIds: 'categoryId' }));
      return;
    }
    saveProduct.mutate({ id: product?.id, input: input.data }, { onSuccess });
  };

  const handleInputChange = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{product ? 'Editar Producto' : 'Nuevo Producto'}</CardTitle>
        <CardDescription>
          {product ? 'Modifica la información del producto' : 'Registra un nuevo producto en el sistema'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Producto</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ej: Laptop Dell XPS 13"
                required
                {...fieldErrorProps('name', fieldErrors.name)}
              />
              <FieldError id="name" message={fieldErrors.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => handleInputChange('sku', e.target.value)}
                placeholder="Ej: DELL-XPS13-001"
                required
                {...fieldErrorProps('sku', fieldErrors.sku)}
              />
              <FieldError id="sku" message={fieldErrors.sku} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descripción detallada del producto..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Marca</Label>
              <Select value={formData.brandId} onValueChange={(value) => handleInputChange('brandId', value)}>
                <SelectTrigger id="brand" {...fieldErrorProps('brand', fieldErrors.brandId)}>
                  <SelectValue placeholder="Seleccionar marca" />
                </SelectTrigger>
                <SelectContent>
                  {brands.data?.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError id="brand" message={fieldErrors.brandId} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select value={formData.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)}>
                <SelectTrigger id="category" {...fieldErrorProps('category', fieldErrors.categoryId)}>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.data?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError id="category" message={fieldErrors.categoryId} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Precio (Q)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange('price', Number.parseFloat(e.target.value) || 0)}
                required
                {...fieldErrorProps('price', fieldErrors.price)}
              />
              <FieldError id="price" message={fieldErrors.price} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => handleInputChange('stock', Number.parseInt(e.target.value) || 0)}
                required
                {...fieldErrorProps('stock', fieldErrors.stock)}
              />
              <FieldError id="stock" message={fieldErrors.stock} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value as ProductStatus)}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_STATUSES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {productStatusLabel(value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a la Lista
            </Button>
            <Button type="submit" disabled={saveProduct.isPending}>
              {saveProduct.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : product ? (
                'Actualizar'
              ) : (
                'Crear Producto'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
