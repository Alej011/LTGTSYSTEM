import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuth } from '@/contexts/auth-context';
import { deleteProduct, getProducts, type Product } from '@/lib/features/products/products.service';
import { ApiClientError } from '@/lib/shared/api-client';

import { ProductList } from './product-list';

vi.mock('@/contexts/auth-context', () => ({ useAuth: vi.fn() }));
vi.mock('@/lib/features/products/products.service', () => ({ getProducts: vi.fn(), deleteProduct: vi.fn() }));

const product: Product = {
  id: 'clprod1',
  name: 'Cable HDMI',
  description: '',
  sku: 'HDMI-001',
  price: 10,
  stock: 10,
  status: 'active',
  brandId: 'clbrand1',
  categories: [],
  createdAt: '2026-11-18T00:00:00.000Z',
  updatedAt: '2026-11-18T00:00:00.000Z',
};

const meta = { page: 1, limit: 20, total: 1, totalPages: 1, hasPrevPage: false, hasNextPage: false };

describe('ProductList delete', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'u1', email: 'admin@ltgt.com', name: 'Admin', role: 'admin' },
    } as ReturnType<typeof useAuth>);
    vi.mocked(getProducts).mockResolvedValue({ data: [product], meta });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  async function confirmDelete() {
    const user = userEvent.setup();
    render(<ProductList onEdit={() => undefined} onAdd={() => undefined} />);
    await user.click(await screen.findByRole('button', { name: 'Eliminar Cable HDMI' }));
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));
  }

  it('keeps the dialog open and shows the error when the delete fails', async () => {
    vi.mocked(deleteProduct).mockRejectedValue(new ApiClientError('Forbidden', 403));

    await confirmDelete();

    expect(await screen.findByText('No tienes permisos para realizar esta acción.')).toBeInTheDocument();
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('closes the dialog and reloads the list when the delete succeeds', async () => {
    vi.mocked(deleteProduct).mockResolvedValue(undefined);

    await confirmDelete();

    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
    expect(getProducts).toHaveBeenCalledTimes(2);
  });
});
