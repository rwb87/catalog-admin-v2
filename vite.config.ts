import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: false, // Opens the browser on server start
  },
  build: {
    outDir: './build',
  },
  resolve: {
    alias: {
      '@': path.resolve(new URL('.', import.meta.url).pathname, './src'),
    },
  },
})
