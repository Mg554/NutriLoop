// Web Audio synth (no sound files -> works offline) + text-to-speech helper.
import confettiLib from 'canvas-confetti'
import { isNative, nativeSay, nativeStopSay } from './native'
import { CLIPS } from './voiceClips'
import { clipId, resolve } from './speechText'

let ctx = null
export const audio = { muted: false, speak: true }

function ac() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

// Play a list of notes: [freq, startOffsetSec, durationSec]
function notes(list, type = 'sine', vol = 0.2) {
  if (audio.muted) return
  try {
    const c = ac()
    list.forEach(([f, at, dur, f2]) => {
      const o = c.createOscillator()
      const g = c.createGain()
      o.type = type
      const t0 = c.currentTime + at
      o.frequency.setValueAtTime(f, t0)
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur)
      g.gain.setValueAtTime(vol, t0)
      g.gain.exponentialRampToValueAtTime(0.001, t0 + dur)
      o.connect(g).connect(c.destination)
      o.start(t0)
      o.stop(t0 + dur)
    })
  } catch {
    /* audio not available */
  }
}

export const sfx = {
  pop: () => notes([[320, 0, 0.08, 750]], 'sine', 0.25),
  whoosh: () => notes([[400, 0, 0.12, 120]], 'sine', 0.2),
  wrong: () => notes([[220, 0, 0.18, 150]], 'triangle', 0.2),
  sparkle: () => notes([523, 659, 784, 1047].map((f, i) => [f, i * 0.06, 0.2]), 'triangle'),
  fanfare: () => notes([[440, 0, 0.3], [554, 0.1, 0.3], [659, 0.2, 0.3], [880, 0.35, 0.4]]),
  levelUp: () => notes([262, 330, 392, 523, 659, 784, 1047].map((f, i) => [f, i * 0.08, 0.4]), 'square', 0.08),
  alarm: () => notes([[440, 0, 0.5, 880]], 'sawtooth', 0.15),
}

export function confetti() {
  try {
    confettiLib({ particleCount: 90, spread: 70, origin: { y: 0.6 }, disableForReducedMotion: true })
  } catch {
    /* ignore */
  }
}

// ---------------------------------------------------------------------------
// Speech: recorded clips first (same natural Arabic voice on every device,
// offline), the device's TTS only for phrases without a clip.
// say('text') or say(['part one', 'part two']) -> spoken in sequence.
// ---------------------------------------------------------------------------
let gen = 0
let current = null

function playClips(ids) {
  const my = ++gen
  const next = () => {
    if (my !== gen) return
    const id = ids.shift()
    if (!id) return
    const a = new Audio(`voice/${id}.mp3`)
    current = a
    a.onended = next
    a.onerror = next
    a.play().catch(next)
  }
  next()
}

function ttsSpeak(text, lang) {
  if (isNative) return nativeSay(text, lang)
  if (!('speechSynthesis' in window)) return
  try {
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang === 'ar' ? 'ar-SA' : 'en-US'
    const voice = speechSynthesis.getVoices().find((v) => v.lang.startsWith(lang === 'ar' ? 'ar' : 'en'))
    if (voice) u.voice = voice
    u.rate = 0.9
    speechSynthesis.cancel()
    speechSynthesis.speak(u)
  } catch {
    /* ignore */
  }
}

// Safe even where the browser has no speechSynthesis (some app webviews).
export function stopSpeech() {
  gen++
  try { current?.pause() } catch { /* ignore */ }
  current = null
  if (isNative) return nativeStopSay()
  try { window.speechSynthesis?.cancel() } catch { /* ignore */ }
}

export function say(text, lang) {
  if (!audio.speak) return
  const parts = (Array.isArray(text) ? text : [text]).map(resolve).filter(Boolean)
  if (!parts.length) return
  stopSpeech()
  if (lang === 'ar' && parts.every((p) => CLIPS.has(clipId(p)))) return playClips(parts.map(clipId))
  ttsSpeak(parts.join('. '), lang)
}
