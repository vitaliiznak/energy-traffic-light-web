import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin({
    babel: {
      plugins: ['@emotion/babel-plugin']
    }
  })],
  base: '/fraffic_lights/', // Use the correct spelling here
  build: {
    target: 'esnext',
    outDir: 'dist',
    emptyOutDir: true,
  },
});