import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { page } from '@/features/products/products.fixtures';
import { mockBff } from '@/test/mock-bff';
import { renderWithQuery } from '@/test/render';

import { StatsCards } from './stats-cards';

const stats = { openTickets: 3, myTickets: 1, knowledgeArticles: 7, unreadCommunications: 0 };

describe('StatsCards', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
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
    expect(screen.getByText('1 asignados a ti')).toBeInTheDocument();
  });
});
