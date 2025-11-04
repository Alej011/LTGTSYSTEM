"use client"

import { useEffect, useState } from "react"
import { type Product, getProductById } from "@/lib/features/products/products.service"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Package, Tag, DollarSign, Box, Calendar, Hash } from "lucide-react"

interface ProductDetailModalProps {
  productId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductDetailModal({ productId, open, onOpenChange }: ProductDetailModalProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (productId && open) {
      loadProductDetails()
    }
  }, [productId, open])

  const loadProductDetails = async () => {
    if (!productId) return

    try {
      setIsLoading(true)
      const data = await getProductById(productId)
      setProduct(data)
    } catch (error) {
      console.error("Error cargando detalles del producto:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      inactive: "secondary",
      discontinued: "destructive",
    } as const

    const labels = {
      active: "Activo",
      inactive: "Inactivo",
      discontinued: "Descontinuado",
    }

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    )
  }

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive">Sin Stock</Badge>
    } else if (stock <= 5) {
      return <Badge variant="secondary">Stock Bajo</Badge>
    }
    return <Badge variant="outline">{stock} unidades</Badge>
  }

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

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
            <span className="text-muted-foreground">Cargando detalles...</span>
          </div>
        ) : product ? (
          <div className="space-y-6">
            {/* Información básica */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Hash className="h-4 w-4" />
                    <span>SKU</span>
                  </div>
                  <p className="font-mono text-sm font-medium">{product.sku}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Tag className="h-4 w-4" />
                    <span>Marca</span>
                  </div>
                  <p className="text-sm font-medium">{product.brand?.name}</p>
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
                <p className="text-2xl font-bold">${product.price.toFixed(2)}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Box className="h-4 w-4" />
                  <span>Stock</span>
                </div>
                <div className="mt-2">{getStockBadge(product.stock)}</div>
              </div>
            </div>

            {/* Categorías y Estado */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Categorías</h4>
                <div className="flex gap-2 flex-wrap">
                  {product.categories.map((cat) => (
                    <Badge key={cat.id} variant="outline">
                      {cat.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Estado</h4>
                <div>{getStatusBadge(product.status)}</div>
              </div>
            </div>

            {/* Fechas */}
            <div className="pt-4 border-t space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Creado: {new Date(product.createdAt).toLocaleDateString("es-ES")}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Actualizado: {new Date(product.updatedAt).toLocaleDateString("es-ES")}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No se pudo cargar la información del producto
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
