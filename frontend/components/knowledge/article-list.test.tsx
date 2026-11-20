import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useSession } from '@/shared/session/session.client';

import { ArticleList } from './article-list';

vi.mock('@/shared/session/session.client', () => ({ useSession: vi.fn() }));

function renderAs(role: 'ADMIN' | 'SUPPORT' | undefined) {
  vi.mocked(useSession).mockReturnValue({
    user: role ? { id: 'u1', email: 'user@ltgt.com', name: 'Usuario', role } : null,
  } as ReturnType<typeof useSession>);
  render(<ArticleList onView={() => undefined} onAdd={() => undefined} showManagement />);
}

describe('ArticleList permissions', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('lets admin create articles', () => {
    renderAs('ADMIN');
    expect(screen.getByRole('button', { name: /Nuevo Artículo/ })).toBeInTheDocument();
  });

  it('hides article creation from SUPPORT, as the permission matrix defines', () => {
    renderAs('SUPPORT');
    expect(screen.queryByRole('button', { name: /Nuevo Artículo/ })).not.toBeInTheDocument();
  });

  it('hides article creation when there is no role', () => {
    renderAs(undefined);
    expect(screen.queryByRole('button', { name: /Nuevo Artículo/ })).not.toBeInTheDocument();
  });
});
