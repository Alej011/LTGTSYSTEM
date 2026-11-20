import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { bffCalls, type BffReply, mockBff } from '@/test/mock-bff';
import { renderWithQuery } from '@/test/render';

import { LoginForm } from './login-form';

const push = vi.fn();
let searchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => searchParams,
}));

function renderWithLoginReply(reply: BffReply) {
  const fetchMock = mockBff({ 'POST /api/auth/login': () => reply });
  renderWithQuery(<LoginForm />);
  return fetchMock;
}

async function submit(email = 'admin@ltgt.com', password = 'secret123') {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Correo Electrónico'), email);
  await user.type(screen.getByLabelText('Contraseña'), password);
  await user.click(screen.getByRole('button', { name: /Iniciar/ }));
}

const admin = { id: 'u1', email: 'admin@ltgt.com', name: 'Admin', role: 'ADMIN' };

describe('LoginForm', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    searchParams = new URLSearchParams();
  });

  it('shows the lockout message when the backend answers 429', async () => {
    renderWithLoginReply({ status: 429, body: { message: 'ThrottlerException: Too Many Requests' } });

    await submit();

    expect(await screen.findByText('Demasiados intentos. Espera un minuto e intenta de nuevo.')).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it('shows invalid credentials only for 401', async () => {
    renderWithLoginReply({ status: 401, body: { message: 'Invalid credentials' } });

    await submit();

    expect(await screen.findByText('Credenciales inválidas. Por favor intente nuevamente.')).toBeInTheDocument();
  });

  it('goes to the page it was sent from after a successful login', async () => {
    searchParams = new URLSearchParams({ redirect: '/products' });
    renderWithLoginReply({ status: 200, body: { user: admin } });

    await submit();

    await vi.waitFor(() => {
      expect(push).toHaveBeenCalledWith('/products');
    });
  });

  it('ignores a redirect to another site', async () => {
    searchParams = new URLSearchParams({ redirect: '//evil.example' });
    renderWithLoginReply({ status: 200, body: { user: admin } });

    await submit();

    await vi.waitFor(() => {
      expect(push).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('validates the fields before calling the BFF', async () => {
    const fetchMock = renderWithLoginReply({ status: 200, body: { user: admin } });

    await submit('admin', '123');

    expect(await screen.findByText('Email inválido')).toBeInTheDocument();
    expect(screen.getByText('La contraseña debe tener al menos 6 caracteres')).toBeInTheDocument();
    expect(bffCalls(fetchMock)).toEqual([]);
  });
});
