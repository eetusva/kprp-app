import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/kprp-app/', // Tämä on avainasemassa GitHub Pages -julkaisussa
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
