import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ErrorBoundary } from './error-boundary';

function Thrower({ fail }: { fail: boolean }) {
  if (fail) throw new Error('boom');
  return <p>contenido</p>;
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders its children when nothing throws', () => {
    render(
      <ErrorBoundary>
        <Thrower fail={false} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('contenido')).toBeInTheDocument();
  });

  it('renders the custom fallback when a child throws', () => {
    render(
      <ErrorBoundary fallback={<p>fallback</p>}>
        <Thrower fail />
      </ErrorBoundary>,
    );

    expect(screen.getByText('fallback')).toBeInTheDocument();
  });

  it('recovers after reset once the child stops throwing', async () => {
    function Harness() {
      const [fail, setFail] = useState(true);
      return (
        <>
          <button onClick={() => setFail(false)}>arreglar</button>
          <ErrorBoundary>
            <Thrower fail={fail} />
          </ErrorBoundary>
        </>
      );
    }
    const user = userEvent.setup();
    render(<Harness />);

    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();

    await user.click(screen.getByText('arreglar'));
    await user.click(screen.getByRole('button', { name: 'Intentar de nuevo' }));

    expect(screen.getByText('contenido')).toBeInTheDocument();
  });
});
