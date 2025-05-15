import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/kprp-app/', // Updated base path
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
