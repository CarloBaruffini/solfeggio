/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// The app is served from https://<user>.github.io/solfeggio/ (see docs/decisions/0005-github-pages-hosting.md).
const BASE_PATH = '/solfeggio/';
const THEME_COLOR = '#2d5b8c';
const BACKGROUND_COLOR = '#f3efe6';

export default defineConfig({
  base: BASE_PATH,
  plugins: [
    react(),
    // Installable, offline-first app (see docs/decisions/0001-web-app-pwa.md).
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'favicon.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Solfeggio — Lettura delle note',
        short_name: 'Solfeggio',
        description: 'Esercizi di lettura delle note sul pentagramma.',
        lang: 'it',
        start_url: BASE_PATH,
        scope: BASE_PATH,
        display: 'standalone',
        theme_color: THEME_COLOR,
        background_color: BACKGROUND_COLOR,
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // The VexFlow chunk embeds the Bravura music font, so it exceeds the 2 MiB default.
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallback: `${BASE_PATH}index.html`,
      },
    }),
  ],
  build: {
    // The lazily loaded notation chunk is ~1 MB because VexFlow embeds the Bravura font.
    chunkSizeWarningLimit: 1200,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
