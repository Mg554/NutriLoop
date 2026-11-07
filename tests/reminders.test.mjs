// bundles the reminder module with mocked Capacitor plugins, then runs it
import { build } from 'esbuild'
await build({
  entryPoints: [new URL('./reminders.test.src.js', import.meta.url).pathname], bundle: true, platform: 'node', format: 'esm',
  outfile: 'node_modules/.cache/reminders.test.mjs', logLevel: 'error',
  plugins: [{ name: 'mocks', setup(b) {
    b.onResolve({ filter: /^@capacitor\/local-notifications$/ }, () => ({ path: new URL('./mocks/local-notifications.js', import.meta.url).pathname }))
    b.onResolve({ filter: /\/native$/ }, () => ({ path: new URL('./mocks/native.js', import.meta.url).pathname }))
  } }],
})
await import(new URL('../node_modules/.cache/reminders.test.mjs', import.meta.url))
