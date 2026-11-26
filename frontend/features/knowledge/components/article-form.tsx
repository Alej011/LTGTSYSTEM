'use client';

import { BookOpen, Globe, Loader2, X } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

import { FieldError, fieldErrorProps, fieldErrorsOf } from '@/components/field-error';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ApiClientError } from '@/shared/api/api-client';
import { TONE_CLASSES } from '@/shared/lib/tones';
import { useSession } from '@/shared/session/session.client';

import { useSaveArticle } from '../knowledge.client';
import {
  type Article,
  ARTICLE_CATEGORIES,
  ARTICLE_STATUSES,
  ArticleFormSchema,
  type ArticleStatus,
} from '../knowledge.schemas';
import { articleCategoryLabel, articleStatusLabel } from './article-badges';

interface ArticleFormProps {
  article?: Article;
  onSuccess: () => void;
  onCancel: () => void;
}

function initialFormState(article?: Article) {
  return {
    title: article?.title ?? '',
    summary: article?.summary ?? '',
    content: article?.content ?? '',
    category: article?.category ?? '',
    status: article?.status ?? 'DRAFT',
    tags: article?.tags ?? [],
  };
}

type FormState = ReturnType<typeof initialFormState>;
type FieldErrors = Partial<Record<keyof FormState, string>>;

// Quien lo usa debe darle un key por artículo para reiniciar el estado al cambiar de artículo
export function ArticleForm({ article, onSuccess, onCancel }: ArticleFormProps) {
  const { user } = useSession();
  const [formData, setFormData] = useState(() => initialFormState(article));
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [newTag, setNewTag] = useState('');
  const saveArticle = useSaveArticle();

  const error = saveArticle.isError
    ? saveArticle.error instanceof ApiClientError
      ? saveArticle.error.getUserMessage()
      : 'Error al guardar el artículo. Intente nuevamente.'
    : '';

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Hasta que existan los departamentos (fase I), todo artículo es de toda la empresa
    const input = ArticleFormSchema.safeParse({ ...formData, isCompanyWide: true, departmentIds: [] });
    if (!input.success) {
      setFieldErrors(fieldErrorsOf<keyof FormState>(input.error.issues));
      return;
    }
    saveArticle.mutate({ id: article?.id, input: input.data }, { onSuccess });
  };

  const handleChange = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const addTag = () => {
    const tag = newTag.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) handleChange('tags', [...formData.tags, tag]);
    setNewTag('');
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          {article ? 'Editar Artículo' : 'Nuevo Artículo'}
        </CardTitle>
        <CardDescription>
          {article
            ? 'Modifica la información del artículo de la base de conocimientos'
            : 'Crea un nuevo artículo para la base de conocimientos'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título del Artículo</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Ej: Cómo reiniciar el router de la oficina"
                  {...fieldErrorProps('title', fieldErrors.title)}
                />
                <FieldError id="title" message={fieldErrors.title} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">Resumen</Label>
                <Textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => handleChange('summary', e.target.value)}
                  placeholder="Breve descripción del contenido del artículo..."
                  rows={2}
                  {...fieldErrorProps('summary', fieldErrors.summary)}
                />
                <FieldError id="summary" message={fieldErrors.summary} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Contenido</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleChange('content', e.target.value)}
                  placeholder="Contenido completo del artículo. Puedes usar Markdown para dar formato..."
                  rows={15}
                  className="font-mono text-sm"
                  {...fieldErrorProps('content', fieldErrors.content)}
                />
                <FieldError id="content" message={fieldErrors.content} />
                <p className="text-xs text-muted-foreground">
                  Usa Markdown para dar formato: # para títulos, ## para subtítulos, - para listas.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                  <SelectTrigger
                    id="category"
                    className="w-full"
                    {...fieldErrorProps('category', fieldErrors.category)}
                  >
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {ARTICLE_CATEGORIES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {articleCategoryLabel(value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError id="category" message={fieldErrors.category} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleChange('status', value as ArticleStatus)}
                >
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ARTICLE_STATUSES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {articleStatusLabel(value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-tag">Etiquetas</Label>
                <div className="flex gap-2">
                  <Input
                    id="new-tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Nueva etiqueta"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    Agregar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className={`flex items-center gap-1 ${TONE_CLASSES.neutral}`}>
                      {tag}
                      <button
                        type="button"
                        aria-label={`Quitar etiqueta ${tag}`}
                        onClick={() =>
                          handleChange(
                            'tags',
                            formData.tags.filter((t) => t !== tag),
                          )
                        }
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium">Visibilidad</p>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  Toda la empresa
                </p>
                <p className="text-xs text-muted-foreground">
                  Elegir departamentos estará disponible cuando el sistema tenga departamentos.
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Autor</h4>
                <p className="text-sm text-muted-foreground">{article?.author?.name ?? user?.name}</p>
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
            <Button type="submit" disabled={saveArticle.isPending}>
              {saveArticle.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : article ? (
                'Actualizar Artículo'
              ) : (
                'Crear Artículo'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
