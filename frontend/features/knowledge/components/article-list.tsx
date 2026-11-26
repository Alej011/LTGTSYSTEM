'use client';

import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { BookOpen, Edit, Eye, Plus, Search, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ApiClientError } from '@/shared/api/api-client';
import { useCan } from '@/shared/use-can';

import { useArticles } from '../knowledge.client';
import { type Article, ARTICLE_CATEGORIES, type ArticleCategory } from '../knowledge.schemas';
import { articleCategoryLabel, ArticleStatusBadge, TagBadge } from './article-badges';

interface ArticleListProps {
  onView: (articleId: string) => void;
  onEdit?: (article: Article) => void;
  onAdd?: () => void;
  /** Muestra todos los estados con su badge y el botón de editar. */
  showManagement?: boolean;
}

const ALL = 'all';
const MAX_TAGS = 3;

export function ArticleList({ onView, onEdit, onAdd, showManagement = false }: ArticleListProps) {
  const can = useCan();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ArticleCategory | undefined>();
  const articles = useArticles({ search, category, scope: showManagement ? 'all' : 'published' });

  const canCreate = can('knowledge', 'create');
  const loadError = articles.isError
    ? articles.error instanceof ApiClientError
      ? articles.error.getUserMessage()
      : 'Error al cargar los artículos'
    : '';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {showManagement ? 'Gestión de Artículos' : 'Base de Conocimientos'}
              </CardTitle>
              <CardDescription>
                {showManagement
                  ? 'Administra los artículos de la base de conocimientos'
                  : 'Busca soluciones antes de abrir un ticket'}
              </CardDescription>
            </div>
            {canCreate && onAdd && (
              <Button onClick={onAdd}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Artículo
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                aria-label="Buscar artículos"
                placeholder="Buscar por título, contenido o etiqueta..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={category ?? ALL}
              onValueChange={(value) => setCategory(value === ALL ? undefined : (value as ArticleCategory))}
            >
              <SelectTrigger className="w-full md:w-52" aria-label="Filtrar por categoría">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todas las categorías</SelectItem>
                {ARTICLE_CATEGORIES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {articleCategoryLabel(value)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loadError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{loadError}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.isPending ? (
              <p className="col-span-full text-center py-12 text-muted-foreground">Cargando artículos...</p>
            ) : !articles.data?.length ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No se encontraron artículos</p>
              </div>
            ) : (
              articles.data.map((article) => (
                <Card
                  key={article.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onView(article.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
                      {showManagement && (
                        <div className="shrink-0">
                          <ArticleStatusBadge status={article.status} />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {articleCategoryLabel(article.category)}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        {article.views}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{article.summary}</p>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {article.tags.slice(0, MAX_TAGS).map((tag) => (
                        <TagBadge key={tag}>{tag}</TagBadge>
                      ))}
                      {article.tags.length > MAX_TAGS && <TagBadge>{`+${article.tags.length - MAX_TAGS}`}</TagBadge>}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {article.helpful}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsDown className="h-3 w-3" />
                          {article.notHelpful}
                        </span>
                      </div>
                      <span>{formatDistanceToNow(new Date(article.updatedAt), { addSuffix: true, locale: es })}</span>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs text-muted-foreground">
                        Por {article.author?.name ?? 'Usuario eliminado'}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          aria-label={`Ver ${article.title}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onView(article.id);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {showManagement && onEdit && can('knowledge', 'edit') && (
                          <Button
                            variant="outline"
                            size="sm"
                            aria-label={`Editar ${article.title}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(article);
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
  );
}
