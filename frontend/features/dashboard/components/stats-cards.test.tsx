import { screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { page } from '@/features/products/products.fixtures';
import { agent } from '@/features/tickets/tickets.fixtures';
import { resetTicketsMock } from '@/features/tickets/tickets.mock';
import { useSession } from '@/shared/session/session.client';
import { mockBff } from '@/test/mock-bff';
import { renderWithQuery } from '@/test/render';

import { StatsCards } from './stats-cards';

vi.mock('@/shared/session/session.client', () => ({ useSession: vi.fn() }));

const stats = { knowledgeArticles: 7, unreadCommunications: 0 };

describe('StatsCards', () => {
  beforeEach(() => {
    resetTicketsMock();
    vi.mocked(useSession).mockReturnValue({ user: { ...agent, email: 'luis@ltgt.com' }, isLoading: false });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetAllMocks();
  });

  it('shows the product total and how many have low stock', async () => {
    mockBff({
      'GET /api/products': ({ url }) => ({ status: 200, body: page([], url.searchParams.has('maxStock') ? 2 : 40) }),
    });

    renderWithQuery(<StatsCards stats={stats} />);

    expect(await screen.findByText('40')).toBeInTheDocument();
    expect(screen.getByText('2 con stock bajo')).toBeInTheDocument();
  });

  it('keeps the other cards when the products backend fails', async () => {
    mockBff({ 'GET /api/products': () => ({ status: 502, body: { message: 'Sin backend' } }) });

    renderWithQuery(<StatsCards stats={stats} />);

    expect(await screen.findByText('No disponible')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(await screen.findByText('Sin tickets asignados')).toBeInTheDocument();
  });

  it('counts the active tickets', async () => {
    mockBff({ 'GET /api/products': () => ({ status: 200, body: page([]) }) });

    renderWithQuery(<StatsCards stats={stats} />);

    const card = (await screen.findByText('Tickets Activos')).closest('[data-slot="card"]') as HTMLElement;
    expect(await within(card).findByText('2')).toBeInTheDocument();
  });
});
