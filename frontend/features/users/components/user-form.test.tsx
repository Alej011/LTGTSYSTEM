import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { bffCalls, mockBff } from '@/test/mock-bff';
import { renderWithQuery } from '@/test/render';

import { support } from '../users.fixtures';
import { UserForm } from './user-form';

describe('UserForm', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('creates a user with the role the backend expects', async () => {
    let sent: unknown;
    mockBff({
      'POST /api/users': ({ body }) => {
        sent = body;
        return { status: 201, body: support };
      },
    });
    const onSuccess = vi.fn();
    const user = userEvent.setup();
    renderWithQuery(<UserForm onSuccess={onSuccess} onCancel={() => undefined} />);

    await user.type(screen.getByLabelText('Nombre Completo'), 'Ana López');
    await user.type(screen.getByLabelText('Email'), 'ana@ltgt.com');
    await user.type(screen.getByLabelText('Contraseña'), 'secret123');
    await user.click(screen.getByLabelText('Rol'));
    await user.click(await screen.findByRole('option', { name: 'Administrador' }));
    await user.click(screen.getByRole('button', { name: 'Crear Usuario' }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
    expect(sent).toEqual({ email: 'ana@ltgt.com', name: 'Ana López', password: 'secret123', role: 'ADMIN' });
  });

  it('edits only the name and role, keeping the current role', async () => {
    let sent: unknown;
    const fetchMock = mockBff({
      'PATCH /api/users/:id': ({ body }) => {
        sent = body;
        return { status: 200, body: support };
      },
    });
    const onSuccess = vi.fn();
    const user = userEvent.setup();
    renderWithQuery(<UserForm user={support} onSuccess={onSuccess} onCancel={() => undefined} />);

    expect(screen.getByLabelText('Email')).toBeDisabled();
    await user.clear(screen.getByLabelText('Nombre Completo'));
    await user.type(screen.getByLabelText('Nombre Completo'), 'Soporte 2');
    await user.click(screen.getByRole('button', { name: 'Actualizar' }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
    expect(bffCalls(fetchMock)).toEqual(['PATCH /api/users/u2']);
    expect(sent).toEqual({ name: 'Soporte 2', role: 'SUPPORT' });
  });

  it('explains invalid fields next to them and sends nothing', async () => {
    const fetchMock = mockBff({});
    const user = userEvent.setup();
    renderWithQuery(<UserForm onSuccess={() => undefined} onCancel={() => undefined} />);

    await user.type(screen.getByLabelText('Email'), 'ana@ltgt');
    await user.type(screen.getByLabelText('Contraseña'), '123');
    await user.click(screen.getByRole('button', { name: 'Crear Usuario' }));

    expect(await screen.findByText('Ingresa el nombre')).toBeInTheDocument();
    expect(screen.getByText('Email inválido')).toBeInTheDocument();
    expect(screen.getByText('La contraseña debe tener al menos 6 caracteres')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
    expect(bffCalls(fetchMock)).toEqual([]);
  });

  it('does not save an edit that leaves the name empty', async () => {
    const fetchMock = mockBff({});
    const user = userEvent.setup();
    renderWithQuery(<UserForm user={support} onSuccess={() => undefined} onCancel={() => undefined} />);

    await user.clear(screen.getByLabelText('Nombre Completo'));
    await user.click(screen.getByRole('button', { name: 'Actualizar' }));

    expect(await screen.findByText('Ingresa el nombre')).toBeInTheDocument();
    expect(bffCalls(fetchMock)).toEqual([]);
  });

  it('shows the backend reason when saving fails', async () => {
    mockBff({ 'POST /api/users': () => ({ status: 409, body: { message: 'El email ya está registrado' } }) });
    const onSuccess = vi.fn();
    const user = userEvent.setup();
    renderWithQuery(<UserForm onSuccess={onSuccess} onCancel={() => undefined} />);

    await user.type(screen.getByLabelText('Nombre Completo'), 'Ana López');
    await user.type(screen.getByLabelText('Email'), 'admin@ltgt.com');
    await user.type(screen.getByLabelText('Contraseña'), 'secret123');
    await user.click(screen.getByRole('button', { name: 'Crear Usuario' }));

    expect(await screen.findByText('El email ya está registrado')).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
