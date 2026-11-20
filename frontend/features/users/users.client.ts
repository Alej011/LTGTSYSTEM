/**
 * Interfaz del dominio de usuarios para los componentes.
 * Los hooks esconden las URLs del BFF, las query keys y la invalidación de caché.
 * Un solo modo de error: toda falla llega como ApiClientError (en `error` o en el rechazo de la mutación).
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { z } from 'zod';

import { apiClient } from '@/lib/shared/api-client';
import type { ApiSchemas } from '@/lib/shared/contract';

import type { UserListItemSchema } from './users.schemas';

export type User = z.infer<typeof UserListItemSchema>;
export type NewUserInput = ApiSchemas['CreateUserDto'];
export type UserChanges = ApiSchemas['UpdateUserDto'];

/** Crear lleva email y contraseña; editar solo cambia nombre y rol de un usuario existente. */
export type SaveUserVariables = { input: NewUserInput } | { id: string; changes: UserChanges };

const userKeys = {
  all: ['users'] as const,
  list: () => [...userKeys.all, 'list'] as const,
};

const userPath = (id: string) => `/api/users/${encodeURIComponent(id)}`;

export function useUsers() {
  return useQuery({ queryKey: userKeys.list(), queryFn: () => apiClient.get<User[]>('/api/users') });
}

/** Crea o actualiza según las variables. Refresca la lista al terminar. */
export function useSaveUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: SaveUserVariables) =>
      'id' in variables
        ? apiClient.patch<User>(userPath(variables.id), variables.changes)
        : apiClient.post<User>('/api/users', variables.input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}
