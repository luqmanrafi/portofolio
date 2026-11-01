import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  define: { 'process.env.NODE_ENV': '"production"' },
  build: { lib: { entry: 'src/entry.jsx', name: 'LanyardApp', formats: ['iife'], fileName: () => 'lanyard.js' }, outDir: 'dist', emptyOutDir: true, minify: true }
});
