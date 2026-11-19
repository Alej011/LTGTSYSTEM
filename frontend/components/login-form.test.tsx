import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useAuth } from '@/contexts/auth-context';
import { ApiClientError } from '@/lib/shared/api-client';

import { LoginForm } from './login-form';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock('@/contexts/auth-context', () => ({ useAuth: vi.fn() }));

function renderWithLogin(login: () => Promise<void>) {
  vi.mocked(useAuth).mockReturnValue({ login, isLoading: false } as unknown as ReturnType<typeof useAuth>);
  render(<LoginForm />);
}

async function submit() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Correo Electrónico'), 'admin@ltgt.com');
  await user.type(screen.getByLabelText('Contraseña'), 'secret123');
  await user.click(screen.getByRole('button', { name: /Iniciar/ }));
}

describe('LoginForm', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('shows the lockout message when the backend answers 429', async () => {
    renderWithLogin(() => Promise.reject(new ApiClientError('Too Many Requests', 429)));

    await submit();

    expect(await screen.findByText('Demasiados intentos. Espera un minuto e intenta de nuevo.')).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it('shows invalid credentials only for 401', async () => {
    renderWithLogin(() => Promise.reject(new ApiClientError('Unauthorized', 401)));

    await submit();

    expect(await screen.findByText('Credenciales inválidas. Por favor intente nuevamente.')).toBeInTheDocument();
  });

  it('redirects to the dashboard after a successful login', async () => {
    renderWithLogin(() => Promise.resolve());

    await submit();

    expect(push).toHaveBeenCalledWith('/dashboard');
  });
});
