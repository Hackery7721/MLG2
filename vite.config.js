import { defineConfig } from 'vite';

export default defineConfig({
  base: '/MLG/', // Matches the deployed path
  build: {
    outDir: 'docs',
  },
});
