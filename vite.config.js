import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 3000,
    open: false,
    host: true
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        services: resolve(__dirname, 'services.html'),
        gallery: resolve(__dirname, 'gallery.html'),
        franchise: resolve(__dirname, 'franchise.html'),
        contact: resolve(__dirname, 'contact.html')
      }
    }
  }
});

