import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getProductById } from '@/lib/features/products/products.service';
import { ApiClientError } from '@/lib/shared/api-client';

import { ProductDetailModal } from './product-detail-modal';

vi.mock('@/lib/features/products/products.service', () => ({ getProductById: vi.fn() }));

const getProductByIdMock = vi.mocked(getProductById);

describe('ProductDetailModal', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('tells the user the product does not exist on 404', async () => {
    getProductByIdMock.mockResolvedValue(null);

    render(<ProductDetailModal productId="missing" open onOpenChange={() => undefined} />);

    expect(await screen.findByText('El producto no existe o fue eliminado')).toBeInTheDocument();
  });

  it('shows a load error when the server fails', async () => {
    getProductByIdMock.mockRejectedValue(new ApiClientError('Bad gateway', 502));

    render(<ProductDetailModal productId="clprod1" open onOpenChange={() => undefined} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Error del servidor');
    expect(screen.queryByText('El producto no existe o fue eliminado')).not.toBeInTheDocument();
  });
});
