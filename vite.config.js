import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves the site from /ladder-luck-game/
export default defineConfig({
  plugins: [react()],
  base: '/ladder-luck-game/',
});
