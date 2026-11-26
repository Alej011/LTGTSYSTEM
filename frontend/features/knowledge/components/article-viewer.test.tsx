import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useSession } from '@/shared/session/session.client';
import { renderWithQuery } from '@/test/render';

import { agent } from '../knowledge.fixtures';
import { resetKnowledgeMock } from '../knowledge.mock';
import { ArticleViewer } from './article-viewer';

vi.mock('@/shared/session/session.client', () => ({ useSession: vi.fn() }));

function renderViewer(articleId: string) {
  renderWithQuery(<ArticleViewer articleId={articleId} onBack={() => undefined} />);
}

describe('ArticleViewer', () => {
  beforeEach(() => {
    resetKnowledgeMock();
    vi.mocked(useSession).mockReturnValue({ user: { ...agent, email: 'luis@ltgt.com' }, isLoading: false });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders the Markdown content and counts the view', async () => {
    renderViewer('kb-1');

    expect(await screen.findByRole('heading', { name: 'Reinicio del router principal' })).toBeInTheDocument();
    expect(screen.getByText('46 veces')).toBeInTheDocument();
  });

  it('records the rating and lets the user change it', async () => {
    const user = userEvent.setup();
    renderViewer('kb-1');

    await user.click(await screen.findByRole('button', { name: 'Sí, fue útil' }));

    expect(await screen.findByText('Gracias por tu valoración. Puedes cambiarla.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sí, fue útil' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('13')).toBeInTheDocument();
  });

  it('does not reveal drafts of other people', async () => {
    renderViewer('kb-4');

    expect(await screen.findByText('El artículo no existe o no está disponible para ti.')).toBeInTheDocument();
  });
});
