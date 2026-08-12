import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const proxyTarget = process.env.VITE_PROXY_TARGET || 'http://localhost:5000';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    // Docker Desktop on Windows often misses native FS events on bind mounts
    watch: {
      usePolling: true,
      interval: 300,
    },
    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    reporters: ['default'],
  },
});
