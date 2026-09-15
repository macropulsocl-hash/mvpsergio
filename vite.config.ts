import tailwindcss from '@tailwindcss/postcss';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
export default defineConfig({
  // Relative assets let the build run at / and at /repository-name/.
  base: './',
  css: { postcss: { plugins: [tailwindcss()] } },
  plugins: [react()],
});
