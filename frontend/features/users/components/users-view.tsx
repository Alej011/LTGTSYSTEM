'use client';

import { useState } from 'react';

import type { User } from '../users.client';
import { UserForm } from './user-form';
import { UserList } from './user-list';

type View = { mode: 'list' } | { mode: 'form'; user?: User };

export function UsersView() {
  const [view, setView] = useState<View>({ mode: 'list' });
  const showList = () => setView({ mode: 'list' });

  return (
    <div className="p-6">
      {view.mode === 'list' ? (
        <UserList onEdit={(user) => setView({ mode: 'form', user })} onAdd={() => setView({ mode: 'form' })} />
      ) : (
        <UserForm key={view.user?.id ?? 'new'} user={view.user} onSuccess={showList} onCancel={showList} />
      )}
    </div>
  );
}
