'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import type { ReactNode } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ApiClientError } from '@/shared/api/api-client';

import { useTicket } from '../tickets.client';
import { autoCloseAt } from '../tickets.rules';
import { TicketActions } from './ticket-actions';
import { closeReasonLabel, ticketCategoryLabel, TicketPriorityBadge, TicketStatusBadge } from './ticket-badges';
import { TicketComments } from './ticket-comments';

interface TicketDetailProps {
  ticketId: string;
  onBack: () => void;
}

const FULL_DATE = "PPP 'a las' p";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

const fullDate = (iso: string) => format(new Date(iso), FULL_DATE, { locale: es });

export function TicketDetail({ ticketId, onBack }: TicketDetailProps) {
  const query = useTicket(ticketId);

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
        <p className="text-muted-foreground">Cargando ticket...</p>
      </div>
    );
  }

  if (query.isError || !query.data) {
    const message = query.isError
      ? query.error instanceof ApiClientError
        ? query.error.getUserMessage()
        : 'No se pudo cargar el ticket'
      : 'El ticket no existe o fue eliminado.';
    return (
      <div className="space-y-4">
        {back}
        <Alert variant="destructive">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const ticket = query.data;
  const closesAt = autoCloseAt(ticket);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {back}
        <div>
          <h1 className="text-2xl font-bold">{ticket.title}</h1>
          <p className="text-muted-foreground">Ticket #{ticket.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Descripción del Problema</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed whitespace-pre-line">{ticket.description}</p>
            </CardContent>
          </Card>

          {ticket.solution && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  Solución
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed whitespace-pre-line">{ticket.solution}</p>
              </CardContent>
            </Card>
          )}

          <TicketComments ticket={ticket} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Ticket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Estado">
                <TicketStatusBadge status={ticket.status} />
                {ticket.closeReason && (
                  <p className="mt-1 text-xs text-muted-foreground">{closeReasonLabel(ticket.closeReason)}</p>
                )}
              </Field>
              <Field label="Prioridad">
                <TicketPriorityBadge priority={ticket.priority} />
              </Field>
              <Field label="Categoría">{ticketCategoryLabel(ticket.category)}</Field>
              <Field label="Solicitante">{ticket.requester.name}</Field>
              <Field label="Asignado a">{ticket.assignee?.name ?? 'Sin asignar'}</Field>
              <Field label="Creado el">
                <span className="flex items-center text-sm">
                  <Clock className="h-3 w-3 mr-1" />
                  {fullDate(ticket.createdAt)}
                </span>
              </Field>
              {ticket.resolvedAt && (
                <Field label="Resuelto el">
                  <span className="flex items-center text-sm">
                    <CheckCircle className="h-3 w-3 mr-1 text-success" />
                    {fullDate(ticket.resolvedAt)}
                  </span>
                  {closesAt && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Se cierra automáticamente el {format(closesAt, FULL_DATE, { locale: es })} si el solicitante no
                      responde.
                    </p>
                  )}
                </Field>
              )}
              {ticket.closedAt && <Field label="Cerrado el">{fullDate(ticket.closedAt)}</Field>}
            </CardContent>
          </Card>

          <TicketActions key={`${ticket.id}-${ticket.status}`} ticket={ticket} />
        </div>
      </div>
    </div>
  );
}
