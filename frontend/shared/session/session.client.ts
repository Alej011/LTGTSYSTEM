/**
 * Sesión en el cliente: usuario actual, login y logout.
 * Los tokens viven en cookies HttpOnly que maneja el BFF; aquí solo se conoce al usuario.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

import { apiClient, ApiClientError } from '@/shared/api/api-client';
import { type ApiSchemas, matchesContract } from '@/shared/api/contract';
import { EmailSchema, PasswordSchema } from '@/shared/schemas';

export type SessionUser = ApiSchemas['UserDto'];
export type Credentials = ApiSchemas['LoginDto'];

/** Validación del formulario de login con las mismas reglas que LoginDto */
export const LoginFormSchema = matchesContract<Credentials>()(
  z.object({
    email: EmailSchema,
    password: PasswordSchema,
  }),
);

const sessionKey = ['session'] as const;

async function fetchSessionUser(): Promise<SessionUser | null> {
  try {
    return await apiClient.get<SessionUser>('/api/auth/me');
  } catch (error) {
    // Un 401 no es un fallo: no hay sesión iniciada
    if (error instanceof ApiClientError && error.statusCode === 401) return null;
    throw error;
  }
}

/** Usuario de la sesión, o null si no hay sesión o no se pudo consultar. */
export function useSession(): { user: SessionUser | null; isLoading: boolean } {
  const query = useQuery({
    queryKey: sessionKey,
    queryFn: fetchSessionUser,
    staleTime: 10 * 60 * 1000,
    retry: false,
  });
  return { user: query.data ?? null, isLoading: query.isPending };
}

/** Inicia sesión. Si falla, el error es un ApiClientError; loginErrorMessage lo explica al usuario. */
export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (credentials: Credentials) =>
      (await apiClient.post<{ user: SessionUser }>('/api/auth/login', credentials)).user,
    onSuccess: (user) => {
      queryClient.setQueryData(sessionKey, user);
    },
  });
}

/** Cierra la sesión y vuelve al login. La caché se limpia aunque falle la petición: el usuario quiere salir. */
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: () => apiClient.post('/api/auth/logout'),
    onSettled: () => {
      queryClient.clear();
      router.push('/');
    },
  });
}

/** Un 401 en el login son credenciales incorrectas; bloqueo por intentos, servidor caído o timeout tienen su mensaje. */
export function loginErrorMessage(error: unknown): string {
  if (!(error instanceof ApiClientError)) return 'Error inesperado. Por favor intente nuevamente.';
  if (error.statusCode === 401) return 'Credenciales inválidas. Por favor intente nuevamente.';
  return error.getUserMessage();
}
