import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        movies: resolve(__dirname, 'movies.html'),
        details: resolve(__dirname, 'details.html'),
        favorites: resolve(__dirname, 'favorites.html'),
        watch: resolve(__dirname, 'watch.html'),
      },
    },
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    port: 3000,
    open: true,
  },
});