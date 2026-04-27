import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    alias: {
      // Map every *.module.css import to our proxy so className props never throw
      '\\.module\\.css$': '/src/test/styleMock.ts',
    },
  },
});
