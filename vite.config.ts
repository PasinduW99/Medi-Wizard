import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Replace 'medi-wizard' with the name of your GitHub repo
export default defineConfig({
  base: '/Medi-Wizard/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});