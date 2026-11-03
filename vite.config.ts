import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// base './' keeps it working on GitHub Pages under /vervos/
export default defineConfig({
  base: './',
  build: { chunkSizeWarningLimit: 1500 },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'vervos',
        short_name: 'vervos',
        description: 'Practicá tus verbos rioplatenses',
        lang: 'es',
        theme_color: '#3C1528',
        background_color: '#3C1528',
        display: 'standalone',
        start_url: './',
        scope: './',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg}'],
        // the app bundle carries all verbs, sentences and covers (~1 MB)
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024
      }
    })
  ]
})
