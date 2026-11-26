import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useSession } from '@/shared/session/session.client';
import { renderWithQuery } from '@/test/render';

import { admin } from '../knowledge.fixtures';
import { resetKnowledgeMock } from '../knowledge.mock';
import { ArticleForm } from './article-form';

vi.mock('@/shared/session/session.client', () => ({ useSession: vi.fn() }));

describe('ArticleForm', () => {
  beforeEach(() => {
    resetKnowledgeMock();
    vi.mocked(useSession).mockReturnValue({ user: { ...admin, email: 'laura@ltgt.com' }, isLoading: false });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('shows the errors next to each field before sending', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    renderWithQuery(<ArticleForm onSuccess={onSuccess} onCancel={() => undefined} />);

    await user.click(screen.getByRole('button', { name: 'Crear Artículo' }));

    expect(screen.getByText('Ingresa el título del artículo')).toBeInTheDocument();
    expect(screen.getByText('Escribe un resumen')).toBeInTheDocument();
    expect(screen.getByText('Escribe el contenido')).toBeInTheDocument();
    expect(screen.getByText('Selecciona una categoría')).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('creates an article with tags', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    renderWithQuery(<ArticleForm onSuccess={onSuccess} onCancel={() => undefined} />);

    await user.type(screen.getByLabelText('Título del Artículo'), 'Conectarse a la VPN');
    await user.type(screen.getByLabelText('Resumen'), 'Acceso remoto');
    await user.type(screen.getByLabelText('Contenido'), 'Abre el cliente de VPN');
    await user.click(screen.getByLabelText('Categoría'));
    await user.click(await screen.findByRole('option', { name: 'Red/Conectividad' }));
    await user.type(screen.getByLabelText('Etiquetas'), 'VPN{Enter}');
    expect(screen.getByText('vpn')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Crear Artículo' }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('explains that every article is visible to the whole company for now', () => {
    renderWithQuery(<ArticleForm onSuccess={() => undefined} onCancel={() => undefined} />);

    expect(screen.getByText('Toda la empresa')).toBeInTheDocument();
  });
});
