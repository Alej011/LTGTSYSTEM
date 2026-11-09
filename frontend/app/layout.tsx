import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"
import { Providers } from "./providers"
import { AuthProvider } from "@/contexts/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

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
