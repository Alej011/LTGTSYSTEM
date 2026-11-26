import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useSession } from '@/shared/session/session.client';
import { renderWithQuery } from '@/test/render';

import { agent } from '../tickets.fixtures';
import { resetTicketsMock } from '../tickets.mock';
import { TicketList } from './ticket-list';

vi.mock('@/shared/session/session.client', () => ({ useSession: vi.fn() }));

describe('TicketList', () => {
  beforeEach(() => {
    resetTicketsMock();
    vi.mocked(useSession).mockReturnValue({ user: { ...agent, email: 'luis@ltgt.com' }, isLoading: false });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('shows the tickets with their labels in Spanish', async () => {
    renderWithQuery(<TicketList onView={() => undefined} onAdd={() => undefined} />);

    const row = (await screen.findByText('Internet lento en toda la oficina')).closest('tr') as HTMLElement;
    expect(within(row).getByText('Crítica')).toBeInTheDocument();
    expect(within(row).getByText('Resuelto')).toBeInTheDocument();
    expect(within(row).getByText('Red/Conectividad')).toBeInTheDocument();
    expect(within(row).getByText('María García')).toBeInTheDocument();
  });

  it('searches tickets', async () => {
    const user = userEvent.setup();
    renderWithQuery(<TicketList onView={() => undefined} onAdd={() => undefined} />);
    await screen.findByText('Internet lento en toda la oficina');

    await user.type(screen.getByLabelText('Buscar tickets'), 'impresora');

    await waitFor(() => {
      expect(screen.queryByText('Internet lento en toda la oficina')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Impresora no funciona en el departamento de ventas')).toBeInTheDocument();
  });

  it('opens a ticket by its id', async () => {
    const user = userEvent.setup();
    const onView = vi.fn();
    renderWithQuery(<TicketList onView={onView} onAdd={() => undefined} />);

    await user.click(await screen.findByRole('button', { name: 'Ver ticket #1003' }));

    expect(onView).toHaveBeenCalledWith('1003');
  });
});
