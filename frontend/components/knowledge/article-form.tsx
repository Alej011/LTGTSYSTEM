"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  type KnowledgeArticle,
  type ArticleCategory,
  type ArticleStatus,
  createArticle,
  updateArticle,
  getCategoryLabel,
} from "@/lib/knowledge"
import { useAuth } from "@/contexts/auth-context"
import { Loader2, BookOpen, X } from "lucide-react"

interface ArticleFormProps {
  article?: KnowledgeArticle
  onSuccess: () => void
  onCancel: () => void
}

export function ArticleForm({ article, onSuccess, onCancel }: ArticleFormProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: article?.title || "",
    summary: article?.summary || "",
    content: article?.content || "",
    category: article?.category || ("" as ArticleCategory),
    status: article?.status || ("draft" as ArticleStatus),
    tags: article?.tags || [],
  })
  const [newTag, setNewTag] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setError("")
    setIsLoading(true)

    try {
      if (article) {
        await updateArticle(article.id, formData)
      } else {
        await createArticle({
          ...formData,
          authorId: user.id,
          authorName: user.name,
        })
      }
      onSuccess()
    } catch (err) {
      setError("Error al guardar el artículo. Intente nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const categories: ArticleCategory[] = ["hardware", "software", "red", "acceso", "procedimientos", "faq"]
  const statuses: ArticleStatus[] = ["draft", "published", "archived"]

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          {article ? "Editar Artículo" : "Nuevo Artículo"}
        </CardTitle>
        <CardDescription>
          {article
            ? "Modifica la información del artículo de la base de conocimientos"
            : "Crea un nuevo artículo para la base de conocimientos"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título del Artículo</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Ej: Cómo reiniciar el router de la oficina"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">Resumen</Label>
                <Textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => handleInputChange("summary", e.target.value)}
                  placeholder="Breve descripción del contenido del artículo..."
                  rows={2}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Contenido</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  placeholder="Contenido completo del artículo. Puedes usar Markdown para formato..."
                  rows={15}
                  className="font-mono text-sm"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Tip: Usa Markdown para dar formato (# para títulos, ## para subtítulos, etc.)
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {getCategoryLabel(category)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        <span className="capitalize">
                          {status === "draft" ? "Borrador" : status === "published" ? "Publicado" : "Archivado"}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Etiquetas</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Nueva etiqueta"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    Agregar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Información del Autor</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    <strong>Nombre:</strong> {user?.name}
                  </p>
                  <p>
                    <strong>Rol:</strong> {user?.role}
                  </p>
                  <p>
                    <strong>Departamento:</strong> {user?.department}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !formData.category}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : article ? (
                "Actualizar Artículo"
              ) : (
                "Crear Artículo"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
