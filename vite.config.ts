import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/modern-message-viewer/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
