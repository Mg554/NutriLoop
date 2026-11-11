// bundles the weekly report (pure logic + share text) and runs checks on a simulated week
import { build } from 'esbuild'
await build({
  entryPoints: [new URL('./island.test.src.js', import.meta.url).pathname], bundle: true, platform: 'node', format: 'esm', jsx: 'automatic',
  outfile: 'node_modules/.cache/island.test.mjs', logLevel: 'error', loader: { '.svg': 'empty', '.css': 'empty' },
  plugins: [{ name: 'mocks', setup(b) {
    b.onResolve({ filter: /^@capacitor\/share$/ }, () => ({ path: new URL('./mocks/share.js', import.meta.url).pathname }))
    b.onResolve({ filter: /\/native$/ }, () => ({ path: new URL('./mocks/native.js', import.meta.url).pathname }))
  } }],
})
await import(new URL('../node_modules/.cache/island.test.mjs', import.meta.url))
