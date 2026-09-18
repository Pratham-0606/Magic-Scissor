import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

export default defineConfig({
  publicDir: 'public',
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
  },
  plugins: [
    {
      name: 'copy-assets-build',
      closeBundle() {
        const srcDir = resolve(__dirname, 'assets');
        const destDir = resolve(__dirname, 'dist/assets');
        if (fs.existsSync(srcDir)) {
          fs.cpSync(srcDir, destDir, { recursive: true });
        }
      }
    }
  ]
});

