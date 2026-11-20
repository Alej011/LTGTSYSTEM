'use client';

import { ArrowLeft, Loader2 } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

import { FieldError, fieldErrorProps, fieldErrorsOf } from '@/components/field-error';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ApiClientError } from '@/shared/api/api-client';
import type { Role } from '@/shared/roles';

import { type User, useSaveUser } from '../users.client';
import { NewUserFormSchema, UserChangesFormSchema } from '../users.schemas';

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
    role: user?.role ?? 'SUPPORT',
  };
}

type FormState = ReturnType<typeof initialFormState>;
type FieldErrors = Partial<Record<keyof FormState, string>>;

// Quien lo usa debe darle un key por usuario para reiniciar el estado al cambiar de usuario
export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState(() => initialFormState(user));
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const saveUser = useSaveUser();

  const error = saveUser.isError
    ? saveUser.error instanceof ApiClientError
      ? saveUser.error.getUserMessage()
      : 'Error al guardar el usuario. Intenta nuevamente.'
    : '';

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (user) {
      // Editar solo cambia nombre y rol
      const changes = UserChangesFormSchema.safeParse(formData);
      if (changes.success) saveUser.mutate({ id: user.id, changes: changes.data }, { onSuccess });
      else setFieldErrors(fieldErrorsOf<keyof FormState>(changes.error.issues));
      return;
    }

    const input = NewUserFormSchema.safeParse(formData);
    if (input.success) saveUser.mutate({ input: input.data }, { onSuccess });
    else setFieldErrors(fieldErrorsOf<keyof FormState>(input.error.issues));
  };

  const handleInputChange = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
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
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ej: Juan Pérez"
                required
                {...fieldErrorProps('name', fieldErrors.name)}
              />
              <FieldError id="name" message={fieldErrors.name} />
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
                {...fieldErrorProps('email', fieldErrors.email)}
              />
              <FieldError id="email" message={fieldErrors.email} />
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
                {...fieldErrorProps('password', fieldErrors.password)}
              />
              <FieldError id="password" message={fieldErrors.password} />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value as Role)}>
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
