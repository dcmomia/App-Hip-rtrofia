import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // CRITICAL for GitHub Pages / sub-path hosting
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'favicon.ico', 'apple-touch-icon.png'],
      devOptions: {
        enabled: true,
        type: 'module',
      },
      manifest: {
        name: 'HYPERTROPHY-X Elite Registry',
        short_name: 'HYP-X',
        description: 'Elite training registry with Israetel protocol for high intensity hypertrophy.',
        theme_color: '#00d4ff',
        background_color: '#0c0c0e',
        display: 'standalone',
        scope: './',
        start_url: './',
        icons: [
          {
            src: 'icon.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
  server: {
    host: true,
    allowedHosts: 'all'
  }
})
