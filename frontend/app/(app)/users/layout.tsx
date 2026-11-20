import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { can } from '@/shared/permissions';
import { getSession } from '@/shared/session/session.server';

export default async function UsersLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  if (!session) redirect(`/?redirect=${encodeURIComponent('/users')}`);
  if (!can(session.role, 'users', 'view')) redirect('/dashboard');

  return <>{children}</>;
}
