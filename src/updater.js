// ---------------------------------------------------------------------------
// In-app updates.
// The public repo Mg554/NutriLoop_releases holds, for every release:
//   latest.json  = { m: "<manifest JSON string>", sig: "<ed25519 signature>" }
//   NutriLoop-X.apk  and  bundle-X.zip (the web app)
// Flow: fetch latest.json -> verify the signature with the public key below
// (a tampered manifest is ignored) -> newer build?
//   - same native level  -> download the web bundle silently (sha256 checked
//     by the updater), apply it on the next launch            ("ota")
//   - higher native level -> offer the APK in the parent area ("apk");
//     Android itself refuses an APK not signed with our key.
// ---------------------------------------------------------------------------
import { CapacitorHttp } from '@capacitor/core'
import { CapacitorUpdater } from '@capgo/capacitor-updater'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { FileOpener } from '@capacitor-community/file-opener'
import nacl from 'tweetnacl'
import { isNative } from './native'
import { NATIVE_LEVEL } from './nativeLevel'

export const MANIFEST_URL = 'https://github.com/Mg554/NutriLoop_releases/releases/latest/download/latest.json'
const PUBLIC_KEY = 'rXAXCbAvAFGfIdYXvWgtZ1YAtesWspAB96sKBJ4JgBE='
const CHECK_EVERY = 6 * 3600 * 1000
const KEY = 'nl.update'

// eslint-disable-next-line no-undef
export const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev'
// eslint-disable-next-line no-undef
export const APP_BUILD = typeof __APP_BUILD__ !== 'undefined' ? __APP_BUILD__ : 0

const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0))

// Pure: verify + decide. Exported for tests.
export function verifyManifest(doc, publicKey = PUBLIC_KEY) {
  if (!doc || typeof doc.m !== 'string' || typeof doc.sig !== 'string') return null
  const ok = nacl.sign.detached.verify(new TextEncoder().encode(doc.m), b64(doc.sig), b64(publicKey))
  if (!ok) return null
  const m = JSON.parse(doc.m)
  return m?.app === 'nutriloop' ? m : null
}
export function decide(m, { build = APP_BUILD, native = NATIVE_LEVEL } = {}) {
  if (!m || !(m.build > build)) return { type: 'none', manifest: m }
  return { type: m.native > native ? 'apk' : 'ota', manifest: m }
}

const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch { return {} } }
const save = (s) => { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* ignore */ } }
export const updateState = () => load()

// Tell the updater this bundle started fine (otherwise it rolls back).
export function markAppReady() {
  if (isNative) CapacitorUpdater.notifyAppReady().catch(() => {})
}

export async function checkForUpdate({ force = false } = {}) {
  if (!isNative) return { type: 'web' }
  const st = load()
  if (!force && st.checkedAt && Date.now() - st.checkedAt < CHECK_EVERY) return st.result || { type: 'none' }
  const res = await CapacitorHttp.get({ url: MANIFEST_URL, responseType: 'json', connectTimeout: 15000, readTimeout: 15000 })
  if (res.status !== 200) throw new Error('http ' + res.status)
  const doc = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
  const m = verifyManifest(doc)
  if (!m) throw new Error('bad signature')
  const result = decide(m)
  save({ ...st, checkedAt: Date.now(), result })
  return result
}

// Download the web bundle and schedule it for the next launch.
export async function downloadOta(m) {
  const st = load()
  if (st.ready?.build === m.build) return st.ready
  const b = await CapacitorUpdater.download({ url: m.bundle.url, version: `${m.version}+${m.build}`, checksum: m.bundle.sha256 })
  await CapacitorUpdater.next({ id: b.id })
  const ready = { id: b.id, build: m.build, version: m.version }
  save({ ...load(), ready })
  return ready
}
export const applyNow = (id) => CapacitorUpdater.set({ id })

// Download the APK (progress 0..1) and hand it to Android's installer.
export async function downloadAndInstallApk(m, onProgress) {
  const path = `NutriLoop-${m.version}.apk`
  const h = await Filesystem.addListener('progress', (p) => p.contentLength && onProgress?.(p.bytes / p.contentLength))
  try {
    const r = await Filesystem.downloadFile({ url: m.apk.url, path, directory: Directory.Cache, progress: true })
    const uri = r.path || (await Filesystem.getUri({ path, directory: Directory.Cache })).uri
    await FileOpener.open({ filePath: uri, contentType: 'application/vnd.android.package-archive' })
  } finally {
    h.remove()
  }
}

// On start: check (rate-limited) and fetch web updates silently.
export async function autoUpdate() {
  if (!isNative) return null
  try {
    const r = await checkForUpdate()
    if (r.type === 'ota') await downloadOta(r.manifest)
    return r
  } catch {
    return null
  }
}
