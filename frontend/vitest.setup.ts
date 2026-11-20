import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Radix Select usa APIs de puntero y scroll que jsdom no implementa. Los tests de servidor corren sin DOM.
if (typeof Element !== 'undefined') {
  Object.assign(Element.prototype, {
    hasPointerCapture: () => false,
    releasePointerCapture: () => undefined,
    scrollIntoView: () => undefined,
  });
}

afterEach(() => {
  cleanup();
});
