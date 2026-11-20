'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { LoginForm } from '@/components/login-form';
import { useSession } from '@/shared/session/session.client';

export default function HomePage() {
  const { user, isLoading } = useSession();
  const isAuthenticated = user !== null;
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) router.replace('/dashboard');
  }, [isAuthenticated, router]);

  if (isLoading || isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-primary"
          aria-label="Cargando"
        />
      </div>
    );
  }

  return <LoginForm />;
}
