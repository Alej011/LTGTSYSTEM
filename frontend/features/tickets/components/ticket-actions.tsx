'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

import { FieldError, fieldErrorProps } from '@/components/field-error';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ApiClientError } from '@/shared/api/api-client';

import { useAssignableUsers, useTicketAction, useViewer } from '../tickets.client';
import { autoCloseAt, availableActions, type TicketAction } from '../tickets.rules';
import { SolutionSchema, type Ticket } from '../tickets.schemas';

const FULL_DATE = "PPP 'a las' p";

/** Panel con las acciones que el usuario puede hacer sobre el ticket; no se muestra si no hay ninguna. */
export function TicketActions({ ticket }: { ticket: Ticket }) {
  const viewer = useViewer();
  const actions = availableActions(ticket, viewer);
  const ticketAction = useTicketAction();
  const assignable = useAssignableUsers(actions.has('assign'));
  const [assigneeId, setAssigneeId] = useState(ticket.assignee?.id ?? '');
  const [solution, setSolution] = useState('');
  const [solutionError, setSolutionError] = useState<string>();

  if (actions.size === 0) return null;

  const run = (action: TicketAction) => {
    ticketAction.mutate({ id: ticket.id, action });
  };

  const handleResolve = () => {
    const parsed = SolutionSchema.safeParse(solution);
    if (!parsed.success) {
      setSolutionError(parsed.error.issues[0]?.message);
      return;
    }
    run({ type: 'resolve', solution: parsed.data });
  };

  const error = ticketAction.isError
    ? ticketAction.error instanceof ApiClientError
      ? ticketAction.error.getUserMessage()
      : 'No se pudo actualizar el ticket. Intente nuevamente.'
    : '';
  const busy = ticketAction.isPending;
  const closesAt = autoCloseAt(ticket);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestionar Ticket</CardTitle>
        <CardDescription>Acciones disponibles para ti en este ticket</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {actions.has('take') && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Nadie está atendiendo este ticket.</p>
            <Button className="w-full" disabled={busy} onClick={() => run({ type: 'take' })}>
              Tomar ticket
            </Button>
          </div>
        )}

        {actions.has('assign') && (
          <div className="space-y-2">
            <Label htmlFor="assignee">Asignar a</Label>
            <Select value={assigneeId} onValueChange={setAssigneeId}>
              <SelectTrigger id="assignee" className="w-full">
                <SelectValue placeholder={assignable.isPending ? 'Cargando...' : 'Seleccionar agente'} />
              </SelectTrigger>
              <SelectContent>
                {assignable.data?.map((person) => (
                  <SelectItem key={person.id} value={person.id}>
                    {person.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="w-full"
              disabled={busy || !assigneeId || assigneeId === ticket.assignee?.id}
              onClick={() => run({ type: 'assign', assigneeId })}
            >
              {ticket.assignee ? 'Reasignar' : 'Asignar'}
            </Button>
          </div>
        )}

        {actions.has('resolve') && (
          <div className="space-y-2">
            <Label htmlFor="solution">Solución aplicada</Label>
            <Textarea
              id="solution"
              value={solution}
              onChange={(e) => {
                setSolution(e.target.value);
                setSolutionError(undefined);
              }}
              placeholder="Describe qué se hizo para resolver el problema..."
              rows={3}
              {...fieldErrorProps('solution', solutionError)}
            />
            <FieldError id="solution" message={solutionError} />
            <Button className="w-full" disabled={busy} onClick={handleResolve}>
              Marcar como resuelto
            </Button>
          </div>
        )}

        {actions.has('confirm') && (
          <div className="space-y-2">
            <p className="text-sm">Soporte registró una solución. ¿Se resolvió tu problema?</p>
            {closesAt && (
              <p className="text-xs text-muted-foreground">
                Si no respondes, el ticket se cerrará automáticamente el {format(closesAt, FULL_DATE, { locale: es })}.
              </p>
            )}
            <div className="flex gap-2">
              <Button className="flex-1" disabled={busy} onClick={() => run({ type: 'confirm' })}>
                Sí, cerrar ticket
              </Button>
              {actions.has('reopen') && (
                <Button variant="outline" className="flex-1" disabled={busy} onClick={() => run({ type: 'reopen' })}>
                  No, reabrir
                </Button>
              )}
            </div>
          </div>
        )}

        {actions.has('close') && (
          <>
            <Separator />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full hover:bg-destructive/10 hover:text-destructive"
                  disabled={busy}
                >
                  Cerrar ticket
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Cerrar el ticket?</AlertDialogTitle>
                  <AlertDialogDescription>
                    El ticket se cerrará sin la confirmación del solicitante. Un ticket cerrado no se puede reabrir.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => run({ type: 'close' })}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Cerrar ticket
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}

        {busy && (
          <p className="flex items-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Actualizando...
          </p>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
