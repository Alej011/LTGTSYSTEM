import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useSession } from '@/shared/session/session.client';
import { renderWithQuery } from '@/test/render';

import { requester } from '../tickets.fixtures';
import { resetTicketsMock } from '../tickets.mock';
import { TicketForm } from './ticket-form';

vi.mock('@/shared/session/session.client', () => ({ useSession: vi.fn() }));

describe('TicketForm', () => {
  beforeEach(() => {
    resetTicketsMock();
    vi.mocked(useSession).mockReturnValue({ user: { ...requester, email: 'ana@ltgt.com' }, isLoading: false });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('shows the errors next to each field before sending', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    renderWithQuery(<TicketForm onSuccess={onSuccess} onCancel={() => undefined} />);

    await user.click(screen.getByRole('button', { name: 'Crear Ticket' }));

    expect(screen.getByText('Ingresa el título del problema')).toBeInTheDocument();
    expect(screen.getByText('Describe el problema')).toBeInTheDocument();
    expect(screen.getByText('Selecciona una categoría')).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('creates the ticket and returns its id', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    renderWithQuery(<TicketForm onSuccess={onSuccess} onCancel={() => undefined} />);

    await user.type(screen.getByLabelText('Título del Problema'), 'Teclado sin respuesta');
    await user.type(screen.getByLabelText('Descripción Detallada'), 'Algunas teclas no funcionan');
    await user.click(screen.getByLabelText('Categoría'));
    await user.click(await screen.findByRole('option', { name: 'Hardware' }));
    await user.click(screen.getByRole('button', { name: 'Crear Ticket' }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith('1005');
    });
  });
});
