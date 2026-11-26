'use client';

import { Headphones, Loader2 } from 'lucide-react';
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
import { useSession } from '@/shared/session/session.client';

import { useCreateTicket } from '../tickets.client';
import { TICKET_CATEGORIES, TICKET_PRIORITIES, TicketFormSchema } from '../tickets.schemas';
import { ticketCategoryLabel, ticketPriorityLabel } from './ticket-badges';

interface TicketFormProps {
  onSuccess: (ticketId: string) => void;
  onCancel: () => void;
}

const INITIAL = { title: '', description: '', category: '', priority: 'MEDIUM' };

type FormState = typeof INITIAL;
type FieldErrors = Partial<Record<keyof FormState, string>>;

export function TicketForm({ onSuccess, onCancel }: TicketFormProps) {
  const { user } = useSession();
  const [formData, setFormData] = useState<FormState>(INITIAL);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const createTicket = useCreateTicket();

  const error = createTicket.isError
    ? createTicket.error instanceof ApiClientError
      ? createTicket.error.getUserMessage()
      : 'Error al crear el ticket. Intente nuevamente.'
    : '';

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = TicketFormSchema.safeParse(formData);
    if (!input.success) {
      setFieldErrors(fieldErrorsOf<keyof FormState>(input.error.issues));
      return;
    }
    createTicket.mutate(input.data, { onSuccess: (ticket) => onSuccess(ticket.id) });
  };

  const handleChange = (field: keyof FormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Headphones className="h-5 w-5" />
          Nuevo Ticket de Soporte
        </CardTitle>
        <CardDescription>
          Describe tu problema o solicitud de soporte técnico. Nuestro equipo te ayudará lo antes posible.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título del Problema</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Ej: No puedo acceder al sistema de correo"
              {...fieldErrorProps('title', fieldErrors.title)}
            />
            <FieldError id="title" message={fieldErrors.title} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción Detallada</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe el problema con el mayor detalle posible: pasos para reproducirlo, mensajes de error, etc."
              rows={4}
              {...fieldErrorProps('description', fieldErrors.description)}
            />
            <FieldError id="description" message={fieldErrors.description} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                <SelectTrigger id="category" {...fieldErrorProps('category', fieldErrors.category)}>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {TICKET_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {ticketCategoryLabel(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError id="category" message={fieldErrors.category} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridad</Label>
              <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
                <SelectTrigger id="priority" {...fieldErrorProps('priority', fieldErrors.priority)}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TICKET_PRIORITIES.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {ticketPriorityLabel(priority)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError id="priority" message={fieldErrors.priority} />
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Información del Solicitante</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                <strong>Nombre:</strong> {user?.name}
              </p>
              <p>
                <strong>Email:</strong> {user?.email}
              </p>
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
            <Button type="submit" disabled={createTicket.isPending}>
              {createTicket.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando Ticket...
                </>
              ) : (
                'Crear Ticket'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
