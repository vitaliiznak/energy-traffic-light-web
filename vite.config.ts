import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  base: '/', // Make sure this matches your deployment path
  build: {
    target: 'esnext',
    outDir: 'dist',
    emptyOutDir: true,
  },
});