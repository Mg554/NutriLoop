// ---------------------------------------------------------------------------
// Bridge between the web app and Android (Capacitor). Every function works on
// the web too: it falls back to the browser API or does nothing.
// ---------------------------------------------------------------------------
import { Capacitor } from '@capacitor/core'
import { TextToSpeech } from '@capacitor-community/text-to-speech'
import { SpeechRecognition } from '@capacitor-community/speech-recognition'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'
import { Preferences } from '@capacitor/preferences'
import { App } from '@capacitor/app'
import { StatusBar, Style } from '@capacitor/status-bar'

export const isNative = Capacitor.isNativePlatform()
export const isIOS = Capacitor.getPlatform() === 'ios'
// iPhone: the page runs edge-to-edge (viewport-fit=cover); #root is padded by
// the notch / status bar height in CSS (html.ios)
// (done at runtime so ONE web bundle serves Android and iPhone, also via OTA)
if (isIOS && typeof document !== 'undefined') {
  document.documentElement.classList.add('ios')
  const vp = document.querySelector('meta[name=viewport]')
  if (vp && !/viewport-fit/.test(vp.content)) vp.content += ', viewport-fit=cover'
}

// ---- 1. text to speech -------------------------------------------------------
// Android WebView has no window.speechSynthesis -> use the system TTS engine.
export async function nativeSay(text, lang) {
  try {
    await TextToSpeech.stop()
    await TextToSpeech.speak({ text, lang: lang === 'ar' ? 'ar-SA' : 'en-US', rate: 0.9, pitch: 1.05, volume: 1, category: 'ambient' })
  } catch {
    /* no voice installed for this language */
  }
}
export const nativeStopSay = () => TextToSpeech.stop().catch(() => {})

// ---- 2. speech recognition ---------------------------------------------------
// Android's own recogniser (works offline when the Arabic offline pack is installed).
// Resolves to an array of transcripts, or throws { code } with a known reason.
export async function nativeListen(lang) {
  const { available } = await SpeechRecognition.available().catch(() => ({ available: false }))
  if (!available) throw { code: 'unsupported' }
  let perm = await SpeechRecognition.checkPermissions().catch(() => ({}))
  if (perm.speechRecognition !== 'granted') perm = await SpeechRecognition.requestPermissions().catch(() => ({}))
  if (perm.speechRecognition !== 'granted') throw { code: 'denied' }
  const tryLang = async (language) =>
    (await SpeechRecognition.start({ language, maxResults: 5, prompt: '', partialResults: false, popup: false }))?.matches || []
  try {
    return await tryLang(lang === 'ar' ? (isIOS ? 'ar-SA' : 'ar-PS') : 'en-US') // iOS has no ar-PS recogniser
  } catch (e) {
    const msg = String(e?.message || e)
    if (lang === 'ar' && /language/i.test(msg)) return tryLang('ar-JO')
    if (/no match|didn't understand|7|No speech/i.test(msg)) return []
    if (/network|2|offline/i.test(msg)) throw { code: 'network' }
    throw { code: 'error', msg }
  }
}
export const nativeStopListen = () => SpeechRecognition.stop().catch(() => {})

// ---- 3. backup: write a file and open the Android share sheet ------------------
export async function shareBackup(filename, json) {
  const { uri } = await Filesystem.writeFile({ path: filename, data: json, directory: Directory.Cache, encoding: Encoding.UTF8 })
  await Share.share({ title: 'NutriLoop backup', url: uri, dialogTitle: 'NutriLoop' })
}

// ---- 8. durable storage (survives clearing the WebView cache) -------------------
export const nativeLoad = async (key) => (await Preferences.get({ key }).catch(() => ({ value: null }))).value
export const nativeSave = (key, value) => Preferences.set({ key, value }).catch(() => {})

// ---- 5 & 7. back button, status bar -----------------------------------------
export function initNative(onBack) {
  if (!isNative) return () => {}
  StatusBar.setStyle({ style: Style.Light }).catch(() => {})
  StatusBar.setBackgroundColor({ color: '#FFF4E0' }).catch(() => {})
  const h = App.addListener('backButton', () => {
    if (!onBack()) App.minimizeApp().catch(() => {})
  })
  return () => h.then((x) => x.remove())
}
