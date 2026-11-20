import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuth } from '@/contexts/auth-context';
import { bffCalls, mockBff } from '@/test/mock-bff';
import { renderWithQuery } from '@/test/render';

import { page, product } from '../products.fixtures';
import { ProductList } from './product-list';

vi.mock('@/contexts/auth-context', () => ({ useAuth: vi.fn() }));

const categories = [
  { id: 'c1', name: 'Accesorios' },
  { id: 'c2', name: 'Laptops' },
];

function renderList() {
  renderWithQuery(<ProductList onEdit={() => undefined} onAdd={() => undefined} />);
}

describe('ProductList', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'u1', email: 'admin@ltgt.com', name: 'Admin', role: 'ADMIN' },
    } as ReturnType<typeof useAuth>);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetAllMocks();
  });

  it('shows the products with their stock level', async () => {
    mockBff({
      'GET /api/products': () => ({ status: 200, body: page([product]) }),
      'GET /api/categories': () => ({ status: 200, body: categories }),
    });

    renderList();

    const row = (await screen.findByText('Cable HDMI')).closest('tr');
    expect(row).not.toBeNull();
    expect(within(row as HTMLElement).getByText('Stock bajo')).toBeInTheDocument();
  });

  it('lets support staff only view details', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'u2', email: 'soporte@ltgt.com', name: 'Soporte', role: 'SUPPORT' },
    } as ReturnType<typeof useAuth>);
    mockBff({
      'GET /api/products': () => ({ status: 200, body: page([product]) }),
      'GET /api/categories': () => ({ status: 200, body: categories }),
    });

    renderList();

    expect(await screen.findByRole('button', { name: /Ver Detalles/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Nuevo Producto/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Editar Cable HDMI' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Eliminar Cable HDMI' })).not.toBeInTheDocument();
  });

  it('shows why the list could not load', async () => {
    mockBff({
      'GET /api/products': () => ({ status: 502, body: { message: 'Sin backend' } }),
      'GET /api/categories': () => ({ status: 200, body: categories }),
    });

    renderList();

    expect(await screen.findByRole('alert')).toHaveTextContent('Error del servidor');
  });

  it('offers every category from the catalog, not only those on the current page', async () => {
    mockBff({
      'GET /api/products': () => ({ status: 200, body: page([product]) }),
      'GET /api/categories': () => ({ status: 200, body: categories }),
    });
    const user = userEvent.setup();
    renderList();
    await screen.findByText('Cable HDMI');

    await user.click(screen.getByRole('combobox', { name: 'Categoría' }));

    expect(await screen.findByRole('option', { name: 'Laptops' })).toBeInTheDocument();
  });

  it('keeps the dialog open and shows the error when the delete fails', async () => {
    mockBff({
      'GET /api/products': () => ({ status: 200, body: page([product]) }),
      'GET /api/categories': () => ({ status: 200, body: categories }),
      'DELETE /api/products/:id': () => ({ status: 403, body: { message: 'Forbidden' } }),
    });
    const user = userEvent.setup();
    renderList();

    await user.click(await screen.findByRole('button', { name: 'Eliminar Cable HDMI' }));
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    expect(await screen.findByText('No tienes permisos para realizar esta acción.')).toBeInTheDocument();
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('closes the dialog and reloads the list when the delete succeeds', async () => {
    const fetchMock = mockBff({
      'GET /api/products': () => ({ status: 200, body: page([product]) }),
      'GET /api/categories': () => ({ status: 200, body: categories }),
      'DELETE /api/products/:id': () => ({ status: 200, body: { message: 'ok' } }),
    });
    const user = userEvent.setup();
    renderList();

    await user.click(await screen.findByRole('button', { name: 'Eliminar Cable HDMI' }));
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
    expect(bffCalls(fetchMock).filter((call) => call.startsWith('GET /api/products'))).toHaveLength(2);
  });
});
