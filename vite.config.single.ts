import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

/**
 * Build target for the offline edition of the site.
 *
 * Everything is deliberately collapsed into one classic script and one
 * stylesheet: dynamic `import()`s are inlined, CSS is not code-split, and the
 * public folder is skipped entirely because every image is embedded by
 * scripts/build-offline.ts. The result is a single, self-contained file that
 * runs from a USB stick with no server.
 */
export default defineConfig({
  base: './',
  publicDir: false,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname || '.', '.') },
  },
  build: {
    outDir: 'dist-single',
    emptyOutDir: true,
    cssCodeSplit: false,
    assetsInlineLimit: Number.MAX_SAFE_INTEGER,
    modulePreload: false,
    reportCompressedSize: false,
    target: 'es2019',
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
        entryFileNames: 'app.js',
        assetFileNames: 'app.[ext]',
      },
    },
  },
});
