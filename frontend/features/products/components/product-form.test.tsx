import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { bffCalls, mockBff } from '@/test/mock-bff';
import { renderWithQuery } from '@/test/render';

import { product } from '../products.fixtures';
import { ProductForm } from './product-form';

const catalog = {
  'GET /api/brands': () => ({
    status: 200,
    body: [
      { id: 'b1', name: 'Genérica', createdAt: '2026-11-18T00:00:00.000Z', updatedAt: '2026-11-18T00:00:00.000Z' },
    ],
  }),
  'GET /api/categories': () => ({ status: 200, body: [{ id: 'c1', name: 'Accesorios' }] }),
};

describe('ProductForm', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('updates the product it was opened with and reports success', async () => {
    let sent: unknown;
    const fetchMock = mockBff({
      ...catalog,
      'PATCH /api/products/:id': ({ body }) => {
        sent = body;
        return { status: 200, body: product };
      },
    });
    const onSuccess = vi.fn();
    const user = userEvent.setup();
    renderWithQuery(<ProductForm product={product} onSuccess={onSuccess} onCancel={() => undefined} />);

    await user.clear(screen.getByLabelText('Stock'));
    await user.type(screen.getByLabelText('Stock'), '8');
    await user.click(screen.getByRole('button', { name: 'Actualizar' }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
    expect(bffCalls(fetchMock)).toContain('PATCH /api/products/p1');
    expect(sent).toMatchObject({ stock: 8, categoryIds: ['c1'], brandId: 'b1' });
  });

  it('explains each missing field next to it and sends nothing', async () => {
    const fetchMock = mockBff(catalog);
    const user = userEvent.setup();
    renderWithQuery(<ProductForm onSuccess={() => undefined} onCancel={() => undefined} />);

    await user.type(screen.getByLabelText('Nombre del Producto'), 'Cable HDMI');
    await user.click(screen.getByRole('button', { name: 'Crear Producto' }));

    expect(await screen.findByText('Ingresa el SKU')).toBeInTheDocument();
    expect(screen.getByText('Selecciona una marca')).toBeInTheDocument();
    expect(screen.getByText('Selecciona una categoría')).toBeInTheDocument();
    expect(screen.getByLabelText('Marca')).toHaveAttribute('aria-invalid', 'true');
    expect(bffCalls(fetchMock).filter((call) => call.startsWith('POST'))).toEqual([]);
  });

  it('clears the message of a field once it is corrected', async () => {
    mockBff(catalog);
    const user = userEvent.setup();
    renderWithQuery(<ProductForm onSuccess={() => undefined} onCancel={() => undefined} />);

    await user.click(screen.getByRole('button', { name: 'Crear Producto' }));
    expect(await screen.findByText('Ingresa el SKU')).toBeInTheDocument();

    await user.type(screen.getByLabelText('SKU'), 'HDMI-001');

    expect(screen.queryByText('Ingresa el SKU')).not.toBeInTheDocument();
    expect(screen.getByText('Ingresa el nombre del producto')).toBeInTheDocument();
  });

  it('shows the backend reason when saving fails', async () => {
    mockBff({
      ...catalog,
      'PATCH /api/products/:id': () => ({ status: 409, body: { message: 'El SKU ya existe' } }),
    });
    const user = userEvent.setup();
    renderWithQuery(<ProductForm product={product} onSuccess={() => undefined} onCancel={() => undefined} />);

    await user.click(screen.getByRole('button', { name: 'Actualizar' }));

    expect(await screen.findByText('El SKU ya existe')).toBeInTheDocument();
  });

  it('tells the user when brands or categories could not load', async () => {
    mockBff({
      'GET /api/brands': () => ({ status: 502, body: { message: 'Sin backend' } }),
      'GET /api/categories': () => ({ status: 200, body: [] }),
    });

    renderWithQuery(<ProductForm onSuccess={() => undefined} onCancel={() => undefined} />);

    expect(await screen.findByText('Error al cargar marcas y categorías')).toBeInTheDocument();
  });
});
