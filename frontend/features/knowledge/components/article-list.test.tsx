import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useSession } from '@/shared/session/session.client';
import { renderWithQuery } from '@/test/render';

import { admin, agent } from '../knowledge.fixtures';
import { resetKnowledgeMock } from '../knowledge.mock';
import type { Viewer } from '../knowledge.rules';
import { ArticleList } from './article-list';

vi.mock('@/shared/session/session.client', () => ({ useSession: vi.fn() }));

function signIn(viewer: Viewer | null) {
  vi.mocked(useSession).mockReturnValue({
    user: viewer ? { ...viewer, email: `${viewer.id}@ltgt.com` } : null,
    isLoading: false,
  });
}

const noop = () => undefined;

describe('ArticleList', () => {
  beforeEach(() => {
    resetKnowledgeMock();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('shows the published articles with their category in Spanish', async () => {
    signIn(agent);
    renderWithQuery(<ArticleList onView={noop} onAdd={noop} />);

    expect(await screen.findByText('Cómo reiniciar el router de la oficina')).toBeInTheDocument();
    expect(screen.getByText('Red/Conectividad')).toBeInTheDocument();
    expect(screen.queryByText('Política de contraseñas')).not.toBeInTheDocument();
  });

  it('searches by tag', async () => {
    signIn(agent);
    const user = userEvent.setup();
    renderWithQuery(<ArticleList onView={noop} onAdd={noop} />);
    await screen.findByText('Cómo reiniciar el router de la oficina');

    await user.type(screen.getByLabelText('Buscar artículos'), 'outlook');

    expect(await screen.findByText('Configurar el correo corporativo en Outlook')).toBeInTheDocument();
    expect(screen.queryByText('Cómo reiniciar el router de la oficina')).not.toBeInTheDocument();
  });

  it('shows drafts with their status and lets the admin create and edit', async () => {
    signIn(admin);
    renderWithQuery(<ArticleList onView={noop} onEdit={noop} onAdd={noop} showManagement />);

    expect(await screen.findByText('Política de contraseñas')).toBeInTheDocument();
    expect(screen.getByText('Borrador')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Nuevo Artículo/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Editar Política de contraseñas' })).toBeInTheDocument();
  });

  it('hides article creation from SUPPORT, as the permission policy defines', async () => {
    signIn(agent);
    renderWithQuery(<ArticleList onView={noop} onAdd={noop} />);

    await screen.findByText('Cómo reiniciar el router de la oficina');
    expect(screen.queryByRole('button', { name: /Nuevo Artículo/ })).not.toBeInTheDocument();
  });

  it('hides article creation when there is no session', () => {
    signIn(null);
    renderWithQuery(<ArticleList onView={noop} onAdd={noop} />);

    expect(screen.queryByRole('button', { name: /Nuevo Artículo/ })).not.toBeInTheDocument();
  });
});
