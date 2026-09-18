import { defineConfig } from 'vite';

// GitHub Pages serves this project under /open-source-test/.
// Keep the root path for local development at http://localhost:5173/.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/open-source-test/' : '/',
  esbuild: {
    jsx: 'automatic',
  },
}));
