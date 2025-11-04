"use client"

import { useState } from "react"
import { ProductList } from "@/components/products/product-list"
import { ProductForm } from "@/components/products/product-form"
import type { Product } from "@/lib/features/products/products.service"

export default function ProductsPage() {
  const [view, setView] = useState<"list" | "form">("list")
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined)

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setView("form")
  }

  const handleAdd = () => {
    setEditingProduct(undefined)
    setView("form")
  }

  const handleSuccess = () => {
    setView("list")
    setEditingProduct(undefined)
  }

  const handleCancel = () => {
    setView("list")
    setEditingProduct(undefined)
  }

  return (
    <div className="p-6">
      {view === "list" ? (
        <ProductList onEdit={handleEdit} onAdd={handleAdd} />
      ) : (
        <ProductForm product={editingProduct} onSuccess={handleSuccess} onCancel={handleCancel} />
      )}
    </div>
  )
}
