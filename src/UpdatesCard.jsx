// Parent area: app version + updates (APK and silent web updates).
//  - useUpdate(): shared state/actions
//  - UpdateBanner: shown at the TOP of the parent dashboard when an update is
//    available (checked every time the dashboard opens), with one big button
//  - UpdatesCard: settings card with version, "check now" and a manual
//    download link as a fallback
import { useEffect, useState } from 'react'
import { isIOS, isNative } from './native'
import { APP_BUILD, APP_VERSION, applyNow, checkForUpdate, downloadAndInstallApk, downloadOta, updateState } from './updater'
import { Card, useT } from './ui'

const RELEASES_PAGE = 'https://github.com/Mg554/NutriLoop_releases/releases/latest'

// iPhone (free Apple ID, no App Store): a native update is a new .ipa that the
// parent installs again with Sideloadly / AltStore. Data stays.
function IpaNotice({ m, T, lang }) {
  const notes = m.notes?.[lang] || []
  return (
    <div className="rounded-3xl p-4 shadow-lg space-y-2.5 text-white" style={{ background: 'linear-gradient(135deg,#F2533C,#f59e0b)' }}>
      <p className="font-black">🎁 {T(`في نسخة آيفون جديدة ${m.version}`, `New iPhone version ${m.version}`)}</p>
      {notes.length > 0 && <ul className="text-xs list-disc ps-5 space-y-0.5 opacity-95">{notes.slice(0, 4).map((n, i) => <li key={i}>{n}</li>)}</ul>}
      <button onClick={() => { window.location.href = m.ipa?.url || RELEASES_PAGE }} className="w-full py-3 rounded-2xl bg-white text-[var(--primary)] font-black">⬇️ {T('صفحة التنزيل', 'Download page')}</button>
      <p className="text-[11px] opacity-90">{T('نزّلوا ملف NutriLoop.ipa على الكمبيوتر وثبّتوه فوق النسخة الحالية بـ Sideloadly. البيانات بتضل محفوظة.', 'Download NutriLoop.ipa on the computer and install it over the current app with Sideloadly. Your data stays.')}</p>
    </div>
  )
}

function useUpdate(toast, { auto = false } = {}) {
  const { lang } = useT()
  const T = (ar, en) => (lang === 'ar' ? ar : en)
  const [st, setSt] = useState(() => ({ ...updateState(), busy: false, progress: null, err: '', failed: false }))

  const check = async (quiet) => {
    setSt((s) => ({ ...s, busy: true, err: '' }))
    try {
      const r = await checkForUpdate({ force: true })
      let ready = updateState().ready
      if (r.type === 'ota') ready = await downloadOta(r.manifest)
      setSt((s) => ({ ...s, busy: false, result: r, ready }))
      if (!quiet && r.type === 'none') toast?.(T('عندكم آخر نسخة ✅', 'You have the latest version ✅'))
    } catch {
      setSt((s) => ({ ...s, busy: false, err: quiet ? '' : T('ما قدرنا نفحص. تأكدوا من الإنترنت', "Couldn't check. Check the internet") }))
    }
  }
  const installApk = async () => {
    const m = st.result?.manifest
    setSt((s) => ({ ...s, progress: 0, err: '' }))
    try {
      await downloadAndInstallApk(m, (p) => setSt((s) => ({ ...s, progress: p })))
      setSt((s) => ({ ...s, progress: null }))
    } catch {
      setSt((s) => ({ ...s, progress: null, failed: true, err: T('ما زبط التثبيت من جوّا التطبيق. جرّبوا رابط التنزيل.', "In-app install didn't work. Try the download link.") }))
    }
  }
  // the system browser downloads the APK; Android then offers to install it
  const openLink = () => { window.location.href = st.result?.manifest?.apk?.url || RELEASES_PAGE }

  useEffect(() => {
    if (auto && isNative) check(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const otaReady = !!st.ready && st.ready.build > APP_BUILD
  return { st, T, lang, check, installApk, openLink, otaReady, apk: st.result?.type === 'apk' ? st.result.manifest : null }
}

const Progress = ({ p }) => (
  <div className="space-y-1">
    <div className="h-3 bg-white/60 rounded-full overflow-hidden"><div className="h-full bg-[var(--primary)] transition-all" style={{ width: `${Math.round(p * 100)}%` }} /></div>
    <p className="text-[11px] text-center font-bold" dir="ltr">{Math.round(p * 100)}%</p>
  </div>
)

export function UpdateBanner({ toast }) {
  const { st, T, lang, installApk, openLink, otaReady, apk } = useUpdate(toast, { auto: true })
  if (!isNative) return null
  if (st.result?.type === 'ipa') return <IpaNotice m={st.result.manifest} T={T} lang={lang} />
  if (apk) {
    const notes = apk.notes?.[lang] || []
    return (
      <div className="rounded-3xl p-4 shadow-lg space-y-2.5 text-white" style={{ background: 'linear-gradient(135deg,#F2533C,#f59e0b)' }}>
        <p className="font-black">🎁 {T(`في نسخة جديدة ${apk.version}`, `New version ${apk.version}`)}</p>
        {notes.length > 0 && <ul className="text-xs list-disc ps-5 space-y-0.5 opacity-95">{notes.slice(0, 4).map((n, i) => <li key={i}>{n}</li>)}</ul>}
        {st.progress != null ? <Progress p={st.progress} /> : (
          <button onClick={installApk} className="w-full py-3 rounded-2xl bg-white text-[var(--primary)] font-black text-base shadow">⬇️ {T('نزّل التحديث', 'Download update')}</button>
        )}
        {st.failed && <button onClick={openLink} className="w-full py-2 rounded-xl bg-black/20 text-white text-sm font-bold">🌐 {T('نزّله من المتصفح', 'Download in the browser')}</button>}
        {st.err && <p className="text-xs font-bold">{st.err}</p>}
        <p className="text-[11px] opacity-90">{T('أندرويد رح يسأل "تثبيت؟"، وأول مرة ممكن يطلب تسمحوا لـ NutriLoop يثبّت تطبيقات. البيانات بتضل محفوظة.', 'Android asks "Install?" and, the first time, to allow NutriLoop to install apps. Your data stays.')}</p>
      </div>
    )
  }
  if (otaReady)
    return (
      <div className="rounded-3xl p-3 bg-green-50 border border-green-200 flex items-center gap-2">
        <p className="flex-1 text-sm font-black text-green-800">✅ {T(`تحديث ${st.ready.version} جاهز`, `Update ${st.ready.version} is ready`)}</p>
        <button onClick={() => applyNow(st.ready.id)} className="px-3 py-2 rounded-xl bg-green-600 text-white text-sm font-black">🔄 {T('طبّقه هلأ', 'Apply now')}</button>
      </div>
    )
  return null
}

export default function UpdatesCard({ toast }) {
  const { st, T, lang, check, installApk, openLink, otaReady, apk } = useUpdate(toast)
  const notes = st.result?.manifest?.notes?.[lang] || []
  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="font-black">🔄 {T('التحديثات', 'Updates')}</h2>
          <p className="text-[11px] text-[var(--text-soft)]" dir="ltr">NutriLoop {APP_VERSION} · build {APP_BUILD}</p>
        </div>
        {isNative && (
          <button onClick={() => check(false)} disabled={st.busy || st.progress != null} className="px-3 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-black disabled:opacity-50">
            {st.busy ? '⏳' : '🔍'} {T('فحص التحديثات', 'Check for updates')}
          </button>
        )}
      </div>
      {!isNative && <p className="text-xs text-[var(--text-soft)]">{T('نسخة المتصفح بتتحدّث لحالها.', 'The browser version updates itself.')}</p>}
      {st.err && <p className="text-xs font-bold text-red-600">{st.err}</p>}

      {otaReady && (
        <div className="rounded-2xl bg-green-50 border border-green-200 p-3 space-y-2">
          <p className="text-sm font-black text-green-800">✅ {T(`تحديث ${st.ready.version} جاهز، وبيشتغل بالمرة الجاية اللي بينفتح فيها التطبيق`, `Update ${st.ready.version} is ready and applies on the next launch`)}</p>
          <button onClick={() => applyNow(st.ready.id)} className="px-3 py-1.5 rounded-xl bg-green-600 text-white text-xs font-black">{T('طبّقه هلأ', 'Apply now')}</button>
        </div>
      )}

      {apk && (
        <div className="rounded-2xl bg-[var(--primary-soft)] p-3 space-y-2">
          <p className="text-sm font-black">🎁 {T(`نسخة جديدة ${apk.version}`, `New version ${apk.version}`)}</p>
          {notes.length > 0 && <ul className="text-xs list-disc ps-5 space-y-0.5">{notes.map((n, i) => <li key={i}>{n}</li>)}</ul>}
          {st.progress != null ? <Progress p={st.progress} /> : (
            <button onClick={installApk} className="w-full py-2.5 rounded-xl bg-[var(--primary)] text-white font-black">⬇️ {T('نزّل التحديث', 'Download update')}</button>
          )}
        </div>
      )}
      {st.result?.type === 'ipa' && <IpaNotice m={st.result.manifest} T={T} lang={lang} />}
      {st.result?.type === 'ota' && !otaReady && notes.length > 0 && <ul className="text-xs list-disc ps-5">{notes.map((n, i) => <li key={i}>{n}</li>)}</ul>}
      {isNative && !isIOS && (
        <button onClick={openLink} className="text-xs font-bold underline text-[var(--text-soft)]">🌐 {T('تنزيل آخر نسخة من المتصفح (إذا التحديث من جوّا ما زبط)', 'Download the latest APK in the browser (if in-app update fails)')}</button>
      )}
    </Card>
  )
}
