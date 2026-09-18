import { defineConfig } from 'vite';

// Use React's automatic JSX runtime in both development and production.
// App.jsx intentionally imports hooks, not the default React namespace.
export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
});
