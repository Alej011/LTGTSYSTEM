"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { type KnowledgeArticle, incrementViews, rateArticle, getCategoryLabel } from "@/lib/features/knowledge/knowledge.service"
import { useAuth } from "@/contexts/auth-context"
import { ArrowLeft, ThumbsUp, ThumbsDown, Eye, Clock, User, Tag } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import ReactMarkdown from "react-markdown"

interface ArticleViewerProps {
  article: KnowledgeArticle
  onBack: () => void
}

export function ArticleViewer({ article, onBack }: ArticleViewerProps) {
  const { user } = useAuth()
  const [hasRated, setHasRated] = useState(false)
  const [isRating, setIsRating] = useState(false)

  useEffect(() => {
    // Increment view count when article is opened
    incrementViews(article.id)
  }, [article.id])

  const handleRate = async (isHelpful: boolean) => {
    if (!user || hasRated || isRating) return

    setIsRating(true)
    try {
      await rateArticle(article.id, user.id, isHelpful)
      setHasRated(true)
    } catch (error) {
      console.error("Error rating article:", error)
    } finally {
      setIsRating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-balance">{article.title}</h1>
          <p className="text-muted-foreground">{article.summary}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="pt-6">
              <div className="prose prose-slate max-w-none dark:prose-invert">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 text-foreground">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xl font-semibold mb-3 text-foreground">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-lg font-medium mb-2 text-foreground">{children}</h3>,
                    p: ({ children }) => <p className="mb-4 text-foreground leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="mb-4 ml-6 list-disc text-foreground">{children}</ul>,
                    ol: ({ children }) => <ol className="mb-4 ml-6 list-decimal text-foreground">{children}</ol>,
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    code: ({ children }) => (
                      <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">{children}</code>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4">{children}</pre>
                    ),
                  }}
                >
                  {article.content}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>¿Te resultó útil este artículo?</CardTitle>
              <CardDescription>Tu feedback nos ayuda a mejorar la base de conocimientos</CardDescription>
            </CardHeader>
            <CardContent>
              {hasRated ? (
                <Alert>
                  <AlertDescription>Gracias por tu feedback. Tu valoración ha sido registrada.</AlertDescription>
                </Alert>
              ) : (
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => handleRate(true)}
                    disabled={isRating}
                    className="flex items-center gap-2"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    Sí, fue útil
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleRate(false)}
                    disabled={isRating}
                    className="flex items-center gap-2"
                  >
                    <ThumbsDown className="h-4 w-4" />
                    No fue útil
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Artículo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Categoría</label>
                <div className="mt-1">
                  <Badge variant="outline">{getCategoryLabel(article.category)}</Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Autor</label>
                <p className="mt-1 flex items-center text-sm">
                  <User className="h-3 w-3 mr-1" />
                  {article.authorName}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Visualizaciones</label>
                <p className="mt-1 flex items-center text-sm">
                  <Eye className="h-3 w-3 mr-1" />
                  {article.views} veces
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Creado</label>
                <p className="mt-1 flex items-center text-sm">
                  <Clock className="h-3 w-3 mr-1" />
                  {format(article.createdAt, "PPP", { locale: es })}
                </p>
              </div>

              {article.updatedAt.getTime() !== article.createdAt.getTime() && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Actualizado</label>
                  <p className="mt-1 flex items-center text-sm">
                    <Clock className="h-3 w-3 mr-1" />
                    {format(article.updatedAt, "PPP", { locale: es })}
                  </p>
                </div>
              )}

              <Separator />

              <div>
                <label className="text-sm font-medium text-muted-foreground">Valoraciones</label>
                <div className="mt-2 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-green-600">
                    <ThumbsUp className="h-3 w-3" />
                    {article.helpful}
                  </div>
                  <div className="flex items-center gap-1 text-red-600">
                    <ThumbsDown className="h-3 w-3" />
                    {article.notHelpful}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {article.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Etiquetas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
