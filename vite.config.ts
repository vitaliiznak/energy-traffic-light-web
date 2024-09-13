import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin({
    babel: {
      plugins: ['@emotion/babel-plugin']
    }
  })],
  base: '/traffics_lights/',
  build: {
    target: 'esnext',
  },
});