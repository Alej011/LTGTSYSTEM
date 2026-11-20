'use client';

import { Edit, Plus, Search, Users } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ApiClientError } from '@/shared/api/api-client';
import { TONE_CLASSES } from '@/shared/lib/tones';
import { useCan } from '@/shared/use-can';

import { type User, useUsers } from '../users.client';

const COLUMNS = 4;

const ROLE_BADGES: Record<User['role'], { label: string; tone: string }> = {
  admin: { label: 'Administrador', tone: TONE_CLASSES.primary },
  empleado: { label: 'Soporte', tone: TONE_CLASSES.info },
};

function matches(user: User, query: string): boolean {
  const needle = query.toLowerCase();
  return user.name.toLowerCase().includes(needle) || user.email.toLowerCase().includes(needle);
}

interface UserListProps {
  onEdit: (user: User) => void;
  onAdd: () => void;
}

export function UserList({ onEdit, onAdd }: UserListProps) {
  const can = useCan();
  const [searchQuery, setSearchQuery] = useState('');

  const users = useUsers();
  const rows = (users.data ?? []).filter((user) => matches(user, searchQuery));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gestión de Usuarios
              </CardTitle>
              <CardDescription>Administra los usuarios del sistema y sus roles</CardDescription>
            </div>
            {can('users', 'create') && (
              <Button onClick={onAdd}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Usuario
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.isPending ? (
                  <TableRow>
                    <TableCell colSpan={COLUMNS} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
                        <span className="text-muted-foreground">Cargando usuarios...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : users.isError ? (
                  <TableRow>
                    <TableCell colSpan={COLUMNS} role="alert" className="text-center py-8 text-destructive">
                      {users.error instanceof ApiClientError
                        ? users.error.getUserMessage()
                        : 'No se pudieron cargar los usuarios'}
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={COLUMNS} className="text-center py-8 text-muted-foreground">
                      {searchQuery
                        ? 'No se encontraron usuarios que coincidan con la búsqueda'
                        : 'No se encontraron usuarios'}
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="font-medium">{user.name}</div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={ROLE_BADGES[user.role].tone}>
                          {ROLE_BADGES[user.role].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          {can('users', 'edit') && (
                            <Button
                              variant="outline"
                              size="sm"
                              aria-label={`Editar ${user.name}`}
                              onClick={() => onEdit(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
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
