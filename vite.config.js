import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { viteSingleFile } from 'vite-plugin-singlefile'

// (see build modes below)
//   npm run build        -> dist/      PWA (installable on mobile, served by nginx)
//   npm run build:single -> single/    one offline HTML file for the PC (Zorin)
// Three builds:
//   npm run build         -> dist/    PWA (phone via browser, served by nginx)
//   npm run build:single  -> single/  one offline HTML file for the PC (Zorin)
//   npm run build:native  -> www/     Android app (Capacitor); no service worker,
//                                     the WebView is not edge-to-edge so the
//                                     status bar never overlaps the UI
export default defineConfig(({ mode }) => {
  const single = mode === 'single'
  const native = mode === 'native'
  const nativeHtml = {
    name: 'native-viewport',
    transformIndexHtml: (html) => html.replace(', viewport-fit=cover', ''),
  }
  return {
    base: './',
    define: {
      __NATIVE__: JSON.stringify(native),
      // CI sets NL_VERSION_NAME / NL_VERSION_CODE; local builds use package.json
      __APP_VERSION__: JSON.stringify(process.env.NL_VERSION_NAME || process.env.npm_package_version || 'dev'),
      __APP_BUILD__: JSON.stringify(Number(process.env.NL_VERSION_CODE || 0)),
    },
    plugins: [
      react(),
      tailwindcss(),
      native
        ? nativeHtml
        : single
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
              globPatterns: ['**/*.{js,css,html,png,svg,woff2,wasm,data,tflite,binarypb,mp3}'],
              globIgnores: ['pose/pose-pack.js'],
              maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
            },
          }),
    ],
    build: { outDir: single ? 'single' : native ? 'www' : 'dist', assetsInlineLimit: single ? 100000000 : 4096 },
  }
})
