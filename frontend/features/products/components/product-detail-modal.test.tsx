import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { mockBff } from '@/test/mock-bff';
import { renderWithQuery } from '@/test/render';

import { product } from '../products.fixtures';
import { ProductDetailModal } from './product-detail-modal';

function renderModal(productId: string) {
  renderWithQuery(<ProductDetailModal productId={productId} open onOpenChange={() => undefined} />);
}

describe('ProductDetailModal', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows the product with its price in quetzales', async () => {
    mockBff({ 'GET /api/products/:id': () => ({ status: 200, body: { ...product, price: 12.5 } }) });

    renderModal('p1');

    expect(await screen.findByText('Q12.50')).toBeInTheDocument();
  });

  it('tells the user the product does not exist on 404', async () => {
    mockBff({ 'GET /api/products/:id': () => ({ status: 404, body: { message: 'No encontrado' } }) });

    renderModal('missing');

    expect(await screen.findByText('El producto no existe o fue eliminado')).toBeInTheDocument();
  });

  it('shows a load error when the server fails', async () => {
    mockBff({ 'GET /api/products/:id': () => ({ status: 502, body: { message: 'Sin backend' } }) });

    renderModal('p1');

    expect(await screen.findByRole('alert')).toHaveTextContent('Error del servidor');
    expect(screen.queryByText('El producto no existe o fue eliminado')).not.toBeInTheDocument();
  });
});
