import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ErrorFallback } from './error-fallback';

describe('ErrorFallback', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('retries the failed segment', async () => {
    const onRetry = vi.fn();
    render(<ErrorFallback error={new Error('boom')} onRetry={onRetry} />);

    await userEvent.setup().click(screen.getByRole('button', { name: 'Intentar de nuevo' }));

    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('hides the error detail outside development', () => {
    vi.stubEnv('NODE_ENV', 'production');
    render(<ErrorFallback error={new Error('secreto interno')} onRetry={() => undefined} />);

    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
    expect(screen.queryByText('secreto interno')).not.toBeInTheDocument();
  });

  it('shows the error message in development', () => {
    vi.stubEnv('NODE_ENV', 'development');
    render(<ErrorFallback error={new Error('boom')} onRetry={() => undefined} />);

    expect(screen.getByText('boom')).toBeInTheDocument();
  });

  it('accepts thrown values that are not Error instances', () => {
    vi.stubEnv('NODE_ENV', 'development');
    render(<ErrorFallback error="texto lanzado" onRetry={() => undefined} />);

    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
  });
});
