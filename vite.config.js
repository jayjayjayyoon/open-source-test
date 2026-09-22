import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

// Use one base path in build AND preview so browser tests verify deployed URLs.
// Local dev also lives under /open-source-test/ instead of serving misleading root URLs.
export default defineConfig({
  base: '/open-source-test/',
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
});
