// Bundles speech-lines.src.js with esbuild (it imports app modules) and runs it.
import { build } from 'esbuild'
await build({ entryPoints: ['scripts/speech-lines.src.js'], bundle: true, platform: 'node', format: 'esm', outfile: 'node_modules/.cache/speech-lines.mjs', logLevel: 'warning' })
await import(new URL('../node_modules/.cache/speech-lines.mjs', import.meta.url))
