import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Two builds:
//   npm run build        -> dist/      PWA (installable on mobile, served by nginx)
//   npm run build:single -> single/    one offline HTML file for the PC (Zorin)
export default defineConfig(({ mode }) => {
  const single = mode === 'single'
  return {
    base: './',
    plugins: [
      react(),
      tailwindcss(),
      single
        ? viteSingleFile()
        : VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['icon-192.png', 'icon-512.png', 'apple-touch-icon.png'],
            manifest: {
              name: 'NutriLoop - رحلة الأكل الصحي',
              short_name: 'NutriLoop',
              description: 'Healthy eating habits game for kids',
              lang: 'ar',
              dir: 'rtl',
              start_url: './',
              scope: './',
              display: 'standalone',
              orientation: 'portrait',
              background_color: '#FFF4E0',
              theme_color: '#FF6B4A',
              icons: [
                { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
                { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
                { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
              ],
            },
            workbox: {
              globPatterns: ['**/*.{js,css,html,png,woff2,wasm,data,tflite,binarypb}'],
              globIgnores: ['pose/pose-pack.js'],
              maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
            },
          }),
    ],
    build: { outDir: single ? 'single' : 'dist', assetsInlineLimit: single ? 100000000 : 4096 },
  }
})
