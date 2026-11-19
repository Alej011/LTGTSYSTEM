import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('.', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'cypress'],
    coverage: {
      provider: 'v8',
      include: ['app/**', 'components/**', 'contexts/**', 'hooks/**', 'lib/**'],
      exclude: ['components/ui/**', '**/*.test.{ts,tsx}'],
    },
  },
});
