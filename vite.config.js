import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

// GitHub Pages hosts this repository under /open-source-test/.
// Each lab remains an independent page so earlier demos stay intact.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/open-source-test/' : '/',
  esbuild: { jsx: 'automatic' },
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        scaleLab: fileURLToPath(new URL('./scale-lab.html', import.meta.url)),
        relationshipLab: fileURLToPath(new URL('./relationship-lab.html', import.meta.url)),
      },
    },
  },
}));
