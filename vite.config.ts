import { defineConfig } from 'vite';

export default defineConfig({
  base: '/lane-shooter/',
  server: {
    port: 3000,
    open: true
  },
  build: {
    target: 'esnext'
  },
  optimizeDeps: {
    include: ['three'],
    esbuildOptions: {
      target: 'esnext'
    }
  },
  esbuild: {
    target: 'esnext'
  }
});

