// Builds the signed update manifest latest.json for a release.
// env: NL_VERSION_NAME, NL_VERSION_CODE, NL_OTA_PRIVATE_KEY (base64 ed25519 secret key),
//      RELEASES_REPO (owner/name of the public releases repo)
// files in cwd: NutriLoop-<version>.apk, bundle-<version>.zip
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import nacl from 'tweetnacl'

const v = process.env.NL_VERSION_NAME
const build = Number(process.env.NL_VERSION_CODE)
const repo = process.env.RELEASES_REPO || 'Mg554/NutriLoop-releases'
const key = process.env.NL_OTA_PRIVATE_KEY
if (!v || !build || !key) throw new Error('missing NL_VERSION_NAME / NL_VERSION_CODE / NL_OTA_PRIVATE_KEY')

const file = (name) => {
  const buf = readFileSync(name)
  return { url: `https://github.com/${repo}/releases/download/v${v}/${name}`, sha256: createHash('sha256').update(buf).digest('hex'), size: buf.length }
}
const native = Number(/NATIVE_LEVEL\s*=\s*(\d+)/.exec(readFileSync('src/nativeLevel.js', 'utf8'))[1])
const changes = existsSync('CHANGES.json') ? JSON.parse(readFileSync('CHANGES.json', 'utf8')) : {}

const manifest = {
  app: 'nutriloop', version: v, build, native, date: new Date().toISOString(),
  notes: changes[v] || { ar: [], en: [] },
  apk: file(`NutriLoop-${v}.apk`),
  bundle: file(`bundle-${v}.zip`),
}
const m = JSON.stringify(manifest)
const sig = Buffer.from(nacl.sign.detached(new TextEncoder().encode(m), Uint8Array.from(Buffer.from(key, 'base64')))).toString('base64')
writeFileSync('latest.json', JSON.stringify({ m, sig }))
console.log('latest.json', v, 'build', build, 'native', native)
