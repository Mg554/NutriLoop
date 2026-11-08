import { build } from 'esbuild'
const mock = new URL('./mocks/empty.js', import.meta.url).pathname
await build({
  entryPoints: [new URL('./updater.test.src.js', import.meta.url).pathname], bundle: true, platform: 'node', format: 'esm',
  outfile: 'node_modules/.cache/updater.test.mjs', logLevel: 'error', external: ['tweetnacl'],
  plugins: [{ name: 'mocks', setup(b) {
    b.onResolve({ filter: /^@capacitor\/core$|^@capgo\/capacitor-updater$|^@capacitor\/filesystem$|^@capacitor-community\/file-opener$/ }, () => ({ path: mock }))
    b.onResolve({ filter: /\/native$/ }, () => ({ path: new URL('./mocks/native.js', import.meta.url).pathname }))
  } }],
})
await import(new URL('../node_modules/.cache/updater.test.mjs', import.meta.url))
