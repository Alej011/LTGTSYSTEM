import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useSession } from '@/shared/session/session.client';
import { renderWithQuery } from '@/test/render';

import { admin, agent } from '../tickets.fixtures';
import { resetTicketsMock } from '../tickets.mock';
import type { Viewer } from '../tickets.rules';
import { TicketDetail } from './ticket-detail';

vi.mock('@/shared/session/session.client', () => ({ useSession: vi.fn() }));

function signIn(viewer: Viewer) {
  vi.mocked(useSession).mockReturnValue({ user: { ...viewer, email: `${viewer.id}@ltgt.com` }, isLoading: false });
}

function renderDetail(ticketId: string) {
  return renderWithQuery(<TicketDetail ticketId={ticketId} onBack={() => undefined} />);
}

const infoCard = () => screen.getByText('Información del Ticket').closest('[data-slot="card"]') as HTMLElement;

describe('TicketDetail', () => {
  beforeEach(() => {
    resetTicketsMock();
    signIn(agent);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('lets an agent take an unassigned ticket', async () => {
    const user = userEvent.setup();
    renderDetail('1004');

    await user.click(await screen.findByRole('button', { name: 'Tomar ticket' }));

    expect(await within(infoCard()).findByText('Luis Soporte')).toBeInTheDocument();
    expect(within(infoCard()).getByText('En progreso')).toBeInTheDocument();
  });

  it('asks for the solution before resolving', async () => {
    const user = userEvent.setup();
    renderDetail('1004');
    await user.click(await screen.findByRole('button', { name: 'Tomar ticket' }));

    await user.click(await screen.findByRole('button', { name: 'Marcar como resuelto' }));
    expect(screen.getByText('Describe la solución aplicada')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Solución aplicada'), 'Se restableció la contraseña');
    await user.click(screen.getByRole('button', { name: 'Marcar como resuelto' }));

    expect(await within(infoCard()).findByText('Resuelto')).toBeInTheDocument();
    expect(screen.getByText('Se restableció la contraseña')).toBeInTheDocument();
  });

  it('shows internal notes to agents', async () => {
    renderDetail('1003');

    expect(await screen.findByText('Nota interna')).toBeInTheDocument();
    expect(screen.getByLabelText('Nota interna (no la ve el solicitante)')).toBeInTheDocument();
  });

  it('lets the admin close a ticket after confirming', async () => {
    signIn(admin);
    const user = userEvent.setup();
    renderDetail('1003');

    await user.click(await screen.findByRole('button', { name: 'Cerrar ticket' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Cerrar ticket' }));

    expect(await screen.findByText('Cerrado por un Administrador')).toBeInTheDocument();
    expect(screen.getByText('El ticket está cerrado; ya no admite comentarios.')).toBeInTheDocument();
  });

  it('tells when the ticket does not exist', async () => {
    renderDetail('missing');

    expect(await screen.findByText('El ticket no existe o fue eliminado.')).toBeInTheDocument();
  });
});
