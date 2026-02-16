import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Exponer solo la variable necesaria y evitar filtrar todo process.env al cliente
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Evitar dependencia opcional de terser en entorno CI/local
    minify: 'esbuild',
  }
});
