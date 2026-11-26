'use client';

import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, Eye, Headphones, Plus, Search } from 'lucide-react';
import { useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ApiClientError } from '@/shared/api/api-client';
import { useCan } from '@/shared/use-can';

import { useTickets } from '../tickets.client';
import {
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  type TicketFilters,
  type TicketPriority,
  type TicketStatus,
} from '../tickets.schemas';
import {
  ticketCategoryLabel,
  TicketPriorityBadge,
  ticketPriorityLabel,
  TicketStatusBadge,
  ticketStatusLabel,
} from './ticket-badges';

interface TicketListProps {
  onView: (ticketId: string) => void;
  onAdd: () => void;
}

const ALL = 'all';

export function TicketList({ onView, onAdd }: TicketListProps) {
  const can = useCan();
  const [filters, setFilters] = useState<TicketFilters>({});
  const tickets = useTickets(filters);

  const canCreate = can('tickets', 'create');
  const handles = can('tickets', 'handle');
  const columns = handles ? 8 : 7;

  const setFilter = <K extends keyof TicketFilters>(key: K, value: TicketFilters[K] | typeof ALL | '') => {
    setFilters((prev) => ({ ...prev, [key]: value === ALL || value === '' ? undefined : value }));
  };

  const loadError = tickets.isError
    ? tickets.error instanceof ApiClientError
      ? tickets.error.getUserMessage()
      : 'Error al cargar los tickets'
    : '';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Headphones className="h-5 w-5" />
                Tickets de Soporte
              </CardTitle>
              <CardDescription>
                {handles
                  ? 'Atiende y da seguimiento a los tickets de soporte'
                  : 'Reporta problemas y da seguimiento a tus solicitudes'}
              </CardDescription>
            </div>
            {canCreate && (
              <Button onClick={onAdd}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Ticket
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                aria-label="Buscar tickets"
                placeholder="Buscar por título, descripción o solicitante..."
                value={filters.search ?? ''}
                onChange={(e) => setFilter('search', e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select
                value={filters.status ?? ALL}
                onValueChange={(value) => setFilter('status', value as TicketStatus)}
              >
                <SelectTrigger className="w-full sm:w-44" aria-label="Filtrar por estado">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todos los estados</SelectItem>
                  {TICKET_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {ticketStatusLabel(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.priority ?? ALL}
                onValueChange={(value) => setFilter('priority', value as TicketPriority)}
              >
                <SelectTrigger className="w-full sm:w-44" aria-label="Filtrar por prioridad">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todas las prioridades</SelectItem>
                  {TICKET_PRIORITIES.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {ticketPriorityLabel(priority)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {handles && (
                <Select
                  value={filters.assignment ?? ALL}
                  onValueChange={(value) => setFilter('assignment', value as TicketFilters['assignment'])}
                >
                  <SelectTrigger className="w-full sm:w-44" aria-label="Filtrar por asignación">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>Todos</SelectItem>
                    <SelectItem value="mine">Mis tickets</SelectItem>
                    <SelectItem value="unassigned">Sin asignar</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {loadError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{loadError}</AlertDescription>
            </Alert>
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Solicitante</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Creado</TableHead>
                  {handles && <TableHead>Asignado a</TableHead>}
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.isPending ? (
                  <TableRow>
                    <TableCell colSpan={columns} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
                        <span className="text-muted-foreground">Cargando tickets...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : !tickets.data?.length ? (
                  <TableRow>
                    <TableCell colSpan={columns} className="text-center py-8 text-muted-foreground">
                      No se encontraron tickets
                    </TableCell>
                  </TableRow>
                ) : (
                  tickets.data.map((ticket) => (
                    <TableRow
                      key={ticket.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onView(ticket.id)}
                    >
                      <TableCell>
                        <div className="font-medium">{ticket.title}</div>
                        <div className="text-sm text-muted-foreground">#{ticket.id}</div>
                      </TableCell>
                      <TableCell>{ticket.requester.name}</TableCell>
                      <TableCell>{ticketCategoryLabel(ticket.category)}</TableCell>
                      <TableCell>
                        <TicketPriorityBadge priority={ticket.priority} />
                      </TableCell>
                      <TableCell>
                        <TicketStatusBadge status={ticket.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true, locale: es })}
                        </div>
                      </TableCell>
                      {handles && (
                        <TableCell>
                          {ticket.assignee?.name ?? <span className="text-muted-foreground">Sin asignar</span>}
                        </TableCell>
                      )}
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          aria-label={`Ver ticket #${ticket.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onView(ticket.id);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
