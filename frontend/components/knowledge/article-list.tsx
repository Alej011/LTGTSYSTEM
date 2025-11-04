"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  type KnowledgeArticle,
  type ArticleCategory,
  searchArticles,
  getArticles,
  getCategoryLabel,
  getStatusLabel,
} from "@/lib/features/knowledge/knowledge.service"
import { useAuth } from "@/contexts/auth-context"
import { hasPermission } from "@/lib/features/auth/auth.service"
import { Search, Plus, Eye, Edit, BookOpen, ThumbsUp, ThumbsDown, Users } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface ArticleListProps {
  onView: (article: KnowledgeArticle) => void
  onEdit?: (article: KnowledgeArticle) => void
  onAdd?: () => void
  showManagement?: boolean
}

export function ArticleList({ onView, onEdit, onAdd, showManagement = false }: ArticleListProps) {
  const { user } = useAuth()
  const [articles, setArticles] = useState<KnowledgeArticle[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<ArticleCategory | "all">("all")

  useEffect(() => {
    loadArticles()
  }, [searchTerm, categoryFilter, showManagement])

  const loadArticles = () => {
    if (showManagement) {
      // Show all articles for management
      const allArticles = getArticles()
      setArticles(allArticles)
    } else {
      // Show only published articles for public view
      if (searchTerm || categoryFilter !== "all") {
        const filtered = searchArticles(searchTerm, categoryFilter === "all" ? undefined : categoryFilter)
        setArticles(filtered)
      } else {
        const published = getArticles("published")
        setArticles(published.sort((a, b) => b.views - a.views))
      }
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: "secondary",
      published: "default",
      archived: "outline",
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>{getStatusLabel(status as any)}</Badge>
    )
  }

  const categories: ArticleCategory[] = ["hardware", "software", "red", "acceso", "procedimientos", "faq"]
  const canManageKnowledge =
    hasPermission(user?.role || "empleado", "knowledge") && (user?.role === "empleado" || user?.role === "admin")

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {showManagement ? "Gestión de Artículos" : "Base de Conocimientos"}
              </CardTitle>
              <CardDescription>
                {showManagement
                  ? "Administra los artículos de la base de conocimientos"
                  : "Busca soluciones y documentación técnica"}
              </CardDescription>
            </div>
            {canManageKnowledge && onAdd && (
              <Button onClick={onAdd}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Artículo
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
                  placeholder="Buscar artículos, etiquetas o contenido..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={categoryFilter}
              onValueChange={(value) => setCategoryFilter(value as ArticleCategory | "all")}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {getCategoryLabel(category)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No se encontraron artículos</p>
              </div>
            ) : (
              articles.map((article) => (
                <Card
                  key={article.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onView(article)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
                      {showManagement && <div className="flex-shrink-0">{getStatusBadge(article.status)}</div>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {getCategoryLabel(article.category)}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {article.views}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{article.summary}</p>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {article.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {article.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{article.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {article.helpful}
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsDown className="h-3 w-3" />
                          {article.notHelpful}
                        </div>
                      </div>
                      <span>{formatDistanceToNow(article.updatedAt, { addSuffix: true, locale: es })}</span>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs text-muted-foreground">Por {article.authorName}</span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onView(article)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {showManagement && onEdit && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              onEdit(article)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
