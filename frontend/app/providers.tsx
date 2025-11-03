"use client"

/**
 * Providers wrapper for the application
 * Includes React Query and other global providers
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useState, type ReactNode } from "react"

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  // Create QueryClient instance with optimized default options
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Configuración por defecto para queries
            staleTime: 5 * 60 * 1000, // 5 minutos - datos son "frescos" por 5 min
            gcTime: 10 * 60 * 1000, // 10 minutos - cache garbage collection
            refetchOnWindowFocus: false, // No refetch automático al enfocar ventana
            refetchOnReconnect: true, // Refetch al reconectar internet
            retry: 1, // Reintentar 1 vez en caso de error
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
          },
          mutations: {
            // Configuración por defecto para mutations
            retry: 0, // No reintentar mutations automáticamente
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools solo en desarrollo */}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools
          initialIsOpen={false}
          position="bottom"
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  )
}
