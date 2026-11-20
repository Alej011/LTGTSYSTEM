import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { can } from '@/shared/permissions';
import { ACCESS_COOKIE, verifyAccessToken } from '@/shared/session/session.server';

export default async function UsersLayout({ children }: { children: ReactNode }) {
  const session = await verifyAccessToken((await cookies()).get(ACCESS_COOKIE)?.value);

  if (!session) redirect(`/?redirect=${encodeURIComponent('/users')}`);
  if (!can(session.role, 'users', 'view')) redirect('/dashboard');

  return <>{children}</>;
}
