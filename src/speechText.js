// Shared by the app and the clip generator: what a spoken phrase looks like
// once emoji / symbols are removed (the TTS used to read "💪" aloud).
export function resolve(s) {
  return String(s ?? '')
    .replace(/[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}️‍⃣]/gu, '')
    .replace(/[«»"“”()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.!؟?،,…:]+$/u, '')
}
// Same 32-bit FNV-1a hash in the browser and in the generator -> clip file name
export function clipId(s) {
  let h = 0x811c9dc5
  for (const ch of resolve(s)) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0 }
  return h.toString(36)
}
