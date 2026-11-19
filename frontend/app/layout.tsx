import "./globals.css"

import type { Metadata } from "next"
import type React from "react"
import { Suspense } from "react"

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/contexts/auth-context"

import { Providers } from "./providers"

export const metadata: Metadata = {
  title: "LTGT S.A. - Sistema de Gestión",
  description: "Sistema integral de gestión empresarial para LTGT S.A.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // next-themes añade la clase "dark" en el cliente antes de pintar
    <html lang="es" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Suspense fallback={null}>
            <Providers>
              <AuthProvider>{children}</AuthProvider>
            </Providers>
          </Suspense>
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  )
}
