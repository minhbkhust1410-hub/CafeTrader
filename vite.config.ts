import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true,
    allowedHosts: true,
    proxy: {
      '/ws': { target: 'ws://127.0.0.1:3001', ws: true },
      '/api': 'http://127.0.0.1:3001',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-babylon': ['@babylonjs/core'],
          'vendor-react': ['react', 'react-dom'],
        },
      },
    },
  },
});

