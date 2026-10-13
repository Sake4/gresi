import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'sons/*.mp3'],
      manifest: {
        name: 'GRESI — Semaine de l’Industrie',
        short_name: 'GRESI',
        description: 'Inscriptions aux activités et distribution des repas',
        lang: 'fr',
        theme_color: '#085CA6',
        background_color: '#F2F2F2',
        display: 'standalone',
        orientation: 'portrait',
        // Installée par les distributeurs : ouvre directement l'écran de scan
        start_url: '/scan',
        scope: '/',
        icons: [
          { src: '/icons/icone-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icone-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icone-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // L'application se charge hors ligne ; les données, elles, viennent toujours de Supabase
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,png,svg,mp3}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    // `--host` permet de tester sur un téléphone du même réseau (la caméra exige HTTPS
    // en dehors de localhost : utiliser l'URL Preview Vercel pour les essais réels)
  },
});
