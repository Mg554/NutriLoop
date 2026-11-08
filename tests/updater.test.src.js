import nacl from 'tweetnacl'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, readFileSync, copyFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { verifyManifest, decide } from '../src/updater'

const ok = []
const check = (n, c, i = '') => { ok.push(!!c); console.log(c ? '✓' : '✗', n, i) }
const b64 = (u) => Buffer.from(u).toString('base64')
const kp = nacl.sign.keyPair()
const pub = b64(kp.publicKey)

// run the real release script on fake files with a test key
const dir = mkdtempSync(join(tmpdir(), 'nl-rel-'))
mkdirSync(join(dir, 'src'))
copyFileSync('src/nativeLevel.js', join(dir, 'src/nativeLevel.js'))
copyFileSync('CHANGES.json', join(dir, 'CHANGES.json'))
writeFileSync(join(dir, 'NutriLoop-1.1.0.apk'), 'fake apk bytes')
writeFileSync(join(dir, 'bundle-1.1.0.zip'), 'fake zip bytes')
execFileSync('node', [join(process.cwd(), 'scripts/release-manifest.mjs')], {
  cwd: dir, env: { ...process.env, NODE_PATH: join(process.cwd(), 'node_modules'), NL_VERSION_NAME: '1.1.0', NL_VERSION_CODE: '42', NL_OTA_PRIVATE_KEY: b64(kp.secretKey) },
})
const doc = JSON.parse(readFileSync(join(dir, 'latest.json'), 'utf8'))
const m = verifyManifest(doc, pub)
check('release script output verifies with the public key', m && m.version === '1.1.0' && m.build === 42, m && `native ${m.native}`)
check('sha256 + public URLs in manifest', m.apk.sha256.length === 64 && m.bundle.url.includes('NutriLoop-releases/releases/download/v1.1.0/'))
check('release notes included', m.notes.ar.length > 0)

const tampered = { ...doc, m: doc.m.replace('"build":42', '"build":9999') }
check('tampered manifest rejected', verifyManifest(tampered, pub) === null)
check('manifest signed by another key rejected', verifyManifest(doc, b64(nacl.sign.keyPair().publicKey)) === null)
check('garbage rejected', verifyManifest({ hello: 1 }, pub) === null)

check('newer build, same native -> silent OTA', decide(m, { build: 41, native: m.native }).type === 'ota')
check('newer build, higher native -> APK', decide(m, { build: 41, native: m.native - 1 }).type === 'apk')
check('same build -> nothing', decide(m, { build: 42, native: 9 }).type === 'none')
check('older manifest -> nothing (no downgrade)', decide(m, { build: 50, native: 9 }).type === 'none')
const pass = ok.every(Boolean); console.log(pass ? 'PASS' : 'FAIL'); process.exit(pass ? 0 : 1)
