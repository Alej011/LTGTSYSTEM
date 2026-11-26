'use client';

import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Loader2, MessageSquare, User } from 'lucide-react';
import { useState } from 'react';

import { FieldError, fieldErrorProps } from '@/components/field-error';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ApiClientError } from '@/shared/api/api-client';
import { TONE_CLASSES } from '@/shared/lib/tones';
import { useCan } from '@/shared/use-can';

import { useAddComment, useTicketComments, useViewer } from '../tickets.client';
import { canSeeInternalNotes } from '../tickets.rules';
import { CommentSchema, type Ticket } from '../tickets.schemas';

export function TicketComments({ ticket }: { ticket: Ticket }) {
  const can = useCan();
  const viewer = useViewer();
  const comments = useTicketComments(ticket.id);
  const addComment = useAddComment(ticket.id);
  const [content, setContent] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [contentError, setContentError] = useState<string>();

  const canComment = can('tickets', 'comment') && ticket.status !== 'CLOSED';
  const canWriteInternal = canSeeInternalNotes(viewer);

  const handleSubmit = () => {
    const parsed = CommentSchema.safeParse({ content, isInternal: canWriteInternal && isInternal });
    if (!parsed.success) {
      setContentError(parsed.error.issues[0]?.message);
      return;
    }
    addComment.mutate(parsed.data, {
      onSuccess: () => {
        setContent('');
        setIsInternal(false);
      },
    });
  };

  const error = addComment.isError
    ? addComment.error instanceof ApiClientError
      ? addComment.error.getUserMessage()
      : 'No se pudo agregar el comentario.'
    : '';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comentarios ({comments.data?.length ?? 0})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {comments.isPending ? (
          <p className="text-muted-foreground text-center py-4">Cargando comentarios...</p>
        ) : comments.isError ? (
          <p className="text-destructive text-center py-4">No se pudieron cargar los comentarios</p>
        ) : comments.data.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No hay comentarios aún</p>
        ) : (
          comments.data.map((comment) => (
            <div
              key={comment.id}
              className={`border rounded-lg p-4 ${comment.isInternal ? 'border-dashed bg-muted/40' : ''}`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{comment.author?.name ?? 'Usuario eliminado'}</span>
                  {comment.author?.id === ticket.requester.id && <Badge variant="outline">Solicitante</Badge>}
                  {comment.isInternal && (
                    <Badge variant="outline" className={TONE_CLASSES.warning}>
                      Nota interna
                    </Badge>
                  )}
                </div>
                <span className="text-sm text-muted-foreground shrink-0">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: es })}
                </span>
              </div>
              <p className="text-foreground whitespace-pre-line">{comment.content}</p>
            </div>
          ))
        )}

        <Separator />

        {canComment ? (
          <div className="space-y-3">
            <Label htmlFor="comment">Agregar comentario</Label>
            <Textarea
              id="comment"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setContentError(undefined);
              }}
              placeholder="Escribe tu comentario..."
              rows={3}
              {...fieldErrorProps('comment', contentError)}
            />
            <FieldError id="comment" message={contentError} />
            {canWriteInternal && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="internal"
                  checked={isInternal}
                  onCheckedChange={(checked) => setIsInternal(checked === true)}
                />
                <Label htmlFor="internal" className="text-sm font-normal">
                  Nota interna (no la ve el solicitante)
                </Label>
              </div>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button onClick={handleSubmit} disabled={addComment.isPending}>
              {addComment.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Agregar Comentario'
              )}
            </Button>
          </div>
        ) : (
          ticket.status === 'CLOSED' && (
            <p className="text-sm text-muted-foreground">El ticket está cerrado; ya no admite comentarios.</p>
          )
        )}
      </CardContent>
    </Card>
  );
}
