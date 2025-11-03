/**
 * React Query hooks for authentication
 */
import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from "@tanstack/react-query"
import { authenticate, getCurrentUser, type User } from "@/lib/auth"
import { removeToken } from "@/lib/api-client"

/**
 * Query keys for auth-related queries
 * Organized hierarchically for easy invalidation
 */
export const authKeys = {
  all: ["auth"] as const,
  currentUser: () => [...authKeys.all, "currentUser"] as const,
}

/**
 * Hook to get current authenticated user
 * Automatically fetches user data and caches it
 *
 * @example
 * const { data: user, isLoading, error } = useCurrentUser()
 */
export function useCurrentUser(options?: Omit<UseQueryOptions<User | null>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: getCurrentUser,
    staleTime: 10 * 60 * 1000, // 10 minutos - sesión es válida por más tiempo
    retry: false, // No reintentar si falla (401 = no autenticado)
    ...options,
  })
}

/**
 * Hook to login with email and password
 * Automatically updates the currentUser query on success
 *
 * @example
 * const loginMutation = useLogin()
 *
 * loginMutation.mutate(
 *   { email: "user@example.com", password: "password" },
 *   {
 *     onSuccess: (user) => {
 *       console.log("Logged in:", user)
 *       router.push("/dashboard")
 *     },
 *     onError: (error) => {
 *       toast.error(error.getUserMessage())
 *     }
 *   }
 * )
 */
export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const user = await authenticate(email, password)
      if (!user) {
        throw new Error("Credenciales inválidas")
      }
      return user
    },
    onSuccess: (user) => {
      // Actualizar cache de currentUser
      queryClient.setQueryData(authKeys.currentUser(), user)
    },
    onError: (error) => {
      console.error("Login error:", error)
    },
  })
}

/**
 * Hook to logout
 * Automatically clears the currentUser query and token
 *
 * @example
 * const logoutMutation = useLogout()
 *
 * logoutMutation.mutate(undefined, {
 *   onSuccess: () => {
 *     router.push("/")
 *   }
 * })
 */
export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      // Clear token
      removeToken()

      // Optional: Call BFF logout endpoint if needed
      // await apiClient.post("/api/auth/logout")
    },
    onSuccess: () => {
      // Clear all auth-related queries
      queryClient.removeQueries({ queryKey: authKeys.all })

      // Clear all other queries (optional - cleanup on logout)
      queryClient.clear()
    },
  })
}

/**
 * Hook to refetch current user (useful for refreshing session)
 *
 * @example
 * const { refetch } = useRefreshUser()
 * refetch() // Manually refresh user data
 */
export function useRefreshUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: getCurrentUser,
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.currentUser(), user)
    },
  })
}
