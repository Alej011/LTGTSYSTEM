'use client';

import { ArrowLeft, Loader2 } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BackendRole, mapFrontendRoleToBackend } from '@/lib/schemas/auth.schema';
import { PasswordSchema } from '@/lib/schemas/common.schema';
import { ApiClientError } from '@/lib/shared/api-client';

import { type User, useSaveUser } from '../users.client';

interface UserFormProps {
  user?: User;
  onSuccess: () => void;
  onCancel: () => void;
}

function initialFormState(user?: User) {
  return {
    name: user?.name ?? '',
    email: user?.email ?? '',
    password: '',
    role: user ? mapFrontendRoleToBackend(user.role) : ('SUPPORT' as BackendRole),
  };
}

type FormState = ReturnType<typeof initialFormState>;

// Quien lo usa debe darle un key por usuario para reiniciar el estado al cambiar de usuario
export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState(() => initialFormState(user));
  const [passwordError, setPasswordError] = useState('');
  const saveUser = useSaveUser();

  const saveError = saveUser.isError
    ? saveUser.error instanceof ApiClientError
      ? saveUser.error.getUserMessage()
      : 'Error al guardar el usuario. Intenta nuevamente.'
    : '';
  const error = passwordError || saveError;

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { name, email, password, role } = formData;

    if (user) {
      // Editar solo cambia nombre y rol
      saveUser.mutate({ id: user.id, changes: { name, role } }, { onSuccess });
      return;
    }

    const passwordCheck = PasswordSchema.safeParse(password);
    setPasswordError(passwordCheck.success ? '' : (passwordCheck.error.issues[0]?.message ?? ''));
    if (!passwordCheck.success) return;

    saveUser.mutate({ input: { email, name, password, role } }, { onSuccess });
  };

  const handleInputChange = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{user ? 'Editar Usuario' : 'Nuevo Usuario'}</CardTitle>
        <CardDescription>
          {user ? 'Modifica la información del usuario' : 'Registra un nuevo usuario en el sistema'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ej: Juan Pérez"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="usuario@ltgt.local"
                required
                disabled={!!user}
              />
            </div>
          </div>

          {!user && (
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value as BackendRole)}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Administrador</SelectItem>
                <SelectItem value="SUPPORT">Soporte</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a la Lista
            </Button>
            <Button type="submit" disabled={saveUser.isPending}>
              {saveUser.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : user ? (
                'Actualizar'
              ) : (
                'Crear Usuario'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
