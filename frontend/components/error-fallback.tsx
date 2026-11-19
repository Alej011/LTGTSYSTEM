'use client';

import { AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorFallbackProps {
  error: unknown;
  onRetry: () => void;
}

// Pantalla para los error.tsx de Next. El detalle del error solo se muestra en desarrollo.
export function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  const detail = process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : null;

  return (
    <div className="flex min-h-full items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <CardTitle>Algo salió mal</CardTitle>
          </div>
          <CardDescription>Ha ocurrido un error inesperado. Por favor intenta nuevamente.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {detail && (
            <div className="rounded-md bg-destructive/10 p-3">
              <p className="font-mono text-sm text-destructive">{detail}</p>
            </div>
          )}
          <div className="flex gap-2">
            <Button onClick={onRetry} className="flex-1">
              Intentar de nuevo
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()} className="flex-1">
              Recargar página
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
