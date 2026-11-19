import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useAuth } from '@/contexts/auth-context';
import { mockBff } from '@/test/mock-bff';
import { renderWithQuery } from '@/test/render';

import type { User } from '../users.client';
import { admin, support } from '../users.fixtures';
import { UserList } from './user-list';

vi.mock('@/contexts/auth-context', () => ({ useAuth: vi.fn() }));

function signedInAs(user: User) {
  vi.mocked(useAuth).mockReturnValue({ user } as ReturnType<typeof useAuth>);
}

describe('UserList', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetAllMocks();
  });

  it('shows each user with its role and filters by name or email', async () => {
    signedInAs(admin);
    mockBff({ 'GET /api/users': () => ({ status: 200, body: [admin, support] }) });
    const user = userEvent.setup();
    renderWithQuery(<UserList onEdit={() => undefined} onAdd={() => undefined} />);

    const row = (await screen.findByText('soporte@ltgt.com')).closest('tr');
    expect(within(row as HTMLElement).getByText('Soporte', { selector: '[data-slot="badge"]' })).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('Buscar por nombre o email...'), 'admin@');

    expect(screen.queryByText('soporte@ltgt.com')).not.toBeInTheDocument();
    expect(screen.getByText('admin@ltgt.com')).toBeInTheDocument();
  });

  it('shows why the list could not load instead of an empty table', async () => {
    signedInAs(admin);
    mockBff({ 'GET /api/users': () => ({ status: 502, body: { message: 'Sin backend' } }) });

    renderWithQuery(<UserList onEdit={() => undefined} onAdd={() => undefined} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Error del servidor');
    expect(screen.queryByText('No se encontraron usuarios')).not.toBeInTheDocument();
  });

  it('opens the selected user for editing', async () => {
    signedInAs(admin);
    mockBff({ 'GET /api/users': () => ({ status: 200, body: [admin, support] }) });
    const onEdit = vi.fn();
    const user = userEvent.setup();
    renderWithQuery(<UserList onEdit={onEdit} onAdd={() => undefined} />);

    await user.click(await screen.findByRole('button', { name: 'Editar Soporte' }));

    expect(onEdit).toHaveBeenCalledWith(support);
  });
});
