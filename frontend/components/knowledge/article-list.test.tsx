import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useAuth } from '@/contexts/auth-context';

import { ArticleList } from './article-list';

vi.mock('@/contexts/auth-context', () => ({ useAuth: vi.fn() }));

function renderAs(role: 'admin' | 'empleado' | undefined) {
  vi.mocked(useAuth).mockReturnValue({
    user: role ? { id: 'u1', email: 'user@ltgt.com', name: 'Usuario', role } : null,
  } as ReturnType<typeof useAuth>);
  render(<ArticleList onView={() => undefined} onAdd={() => undefined} showManagement />);
}

describe('ArticleList permissions', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('lets admin create articles', () => {
    renderAs('admin');
    expect(screen.getByRole('button', { name: /Nuevo Artículo/ })).toBeInTheDocument();
  });

  it('hides article creation from empleado, as the permission matrix defines', () => {
    renderAs('empleado');
    expect(screen.queryByRole('button', { name: /Nuevo Artículo/ })).not.toBeInTheDocument();
  });

  it('hides article creation when there is no role', () => {
    renderAs(undefined);
    expect(screen.queryByRole('button', { name: /Nuevo Artículo/ })).not.toBeInTheDocument();
  });
});
