import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

// GitHub Pages hosts this repository under /open-source-test/.
// Vite's multi-page build ships the original demo and the separate scale lab.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/open-source-test/' : '/',
  esbuild: { jsx: 'automatic' },
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        scaleLab: fileURLToPath(new URL('./scale-lab.html', import.meta.url)),
      },
    },
  },
}));
