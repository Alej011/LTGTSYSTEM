'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowLeft, Clock, Eye, Globe, Tag, ThumbsDown, ThumbsUp, User } from 'lucide-react';
import type { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ApiClientError } from '@/shared/api/api-client';

import { useArticle, useRateArticle } from '../knowledge.client';
import type { Article, Rating } from '../knowledge.schemas';
import { articleCategoryLabel, ArticleStatusBadge, TagBadge } from './article-badges';

interface ArticleViewerProps {
  articleId: string;
  onBack: () => void;
}

const dateOf = (iso: string) => format(new Date(iso), 'PPP', { locale: es });

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm">{children}</div>
    </div>
  );
}

const markdown = {
  h1: ({ children }: { children?: ReactNode }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
  h2: ({ children }: { children?: ReactNode }) => <h2 className="text-xl font-semibold mb-3">{children}</h2>,
  h3: ({ children }: { children?: ReactNode }) => <h3 className="text-lg font-medium mb-2">{children}</h3>,
  p: ({ children }: { children?: ReactNode }) => <p className="mb-4 leading-relaxed">{children}</p>,
  ul: ({ children }: { children?: ReactNode }) => <ul className="mb-4 ml-6 list-disc">{children}</ul>,
  ol: ({ children }: { children?: ReactNode }) => <ol className="mb-4 ml-6 list-decimal">{children}</ol>,
  li: ({ children }: { children?: ReactNode }) => <li className="mb-1">{children}</li>,
  code: ({ children }: { children?: ReactNode }) => (
    <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">{children}</code>
  ),
  pre: ({ children }: { children?: ReactNode }) => (
    <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4">{children}</pre>
  ),
};

function RatingCard({ article }: { article: Article }) {
  const rate = useRateArticle(article.id);
  const chosen = rate.variables ?? article.myRating;

  const button = (rating: Rating, label: string, icon: ReactNode) => (
    <Button
      variant={chosen === rating ? 'default' : 'outline'}
      aria-pressed={chosen === rating}
      disabled={rate.isPending}
      onClick={() => rate.mutate(rating)}
      className="flex items-center gap-2"
    >
      {icon}
      {label}
    </Button>
  );

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>¿Te resultó útil este artículo?</CardTitle>
        <CardDescription>
          {article.myRating ? 'Gracias por tu valoración. Puedes cambiarla.' : 'Tu valoración ayuda a mejorar la base.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-4">
          {button('HELPFUL', 'Sí, fue útil', <ThumbsUp className="h-4 w-4" />)}
          {button('NOT_HELPFUL', 'No fue útil', <ThumbsDown className="h-4 w-4" />)}
        </div>
        {rate.isError && (
          <Alert variant="destructive">
            <AlertDescription>
              {rate.error instanceof ApiClientError ? rate.error.getUserMessage() : 'No se pudo guardar la valoración'}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

export function ArticleViewer({ articleId, onBack }: ArticleViewerProps) {
  const query = useArticle(articleId);

  const back = (
    <Button variant="outline" onClick={onBack}>
      <ArrowLeft className="mr-2 h-4 w-4" />
      Volver
    </Button>
  );

  if (query.isPending) {
    return (
      <div className="space-y-4">
        {back}
        <p className="text-muted-foreground">Cargando artículo...</p>
      </div>
    );
  }

  if (query.isError || !query.data) {
    const message = query.isError
      ? query.error instanceof ApiClientError
        ? query.error.getUserMessage()
        : 'No se pudo cargar el artículo'
      : 'El artículo no existe o no está disponible para ti.';
    return (
      <div className="space-y-4">
        {back}
        <Alert variant="destructive">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const article = query.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {back}
        <div>
          <h1 className="text-3xl font-bold text-balance">{article.title}</h1>
          <p className="text-muted-foreground">{article.summary}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="pt-6 text-foreground">
              <ReactMarkdown components={markdown}>{article.content}</ReactMarkdown>
            </CardContent>
          </Card>
          {article.status === 'PUBLISHED' && <RatingCard article={article} />}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Artículo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {article.status !== 'PUBLISHED' && (
                <Field label="Estado">
                  <ArticleStatusBadge status={article.status} />
                </Field>
              )}
              <Field label="Categoría">
                <Badge variant="outline">{articleCategoryLabel(article.category)}</Badge>
              </Field>
              <Field label="Visibilidad">
                <span className="flex items-center">
                  <Globe className="h-3 w-3 mr-1" />
                  {article.isCompanyWide ? 'Toda la empresa' : 'Departamentos seleccionados'}
                </span>
              </Field>
              <Field label="Autor">
                <span className="flex items-center">
                  <User className="h-3 w-3 mr-1" />
                  {article.author?.name ?? 'Usuario eliminado'}
                </span>
              </Field>
              <Field label="Visualizaciones">
                <span className="flex items-center">
                  <Eye className="h-3 w-3 mr-1" />
                  {article.views} {article.views === 1 ? 'vez' : 'veces'}
                </span>
              </Field>
              <Field label={article.publishedAt ? 'Publicado el' : 'Creado el'}>
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {dateOf(article.publishedAt ?? article.createdAt)}
                </span>
              </Field>
              {article.updatedAt !== article.createdAt && (
                <Field label="Actualizado el">
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {dateOf(article.updatedAt)}
                  </span>
                </Field>
              )}
              <Separator />
              <Field label="Valoraciones">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-success">
                    <ThumbsUp className="h-3 w-3" />
                    {article.helpful}
                  </span>
                  <span className="flex items-center gap-1 text-destructive">
                    <ThumbsDown className="h-3 w-3" />
                    {article.notHelpful}
                  </span>
                </div>
              </Field>
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
                    <TagBadge key={tag}>{tag}</TagBadge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
