'use client';

import { useEffect } from 'react';

import { ErrorFallback } from '@/components/error-fallback';

export default function AppError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ErrorFallback error={error} onRetry={retry} />;
}
