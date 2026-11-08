// Parent settings: app version + updates (APK and silent web updates).
import { useEffect, useState } from 'react'
import { isNative } from './native'
import { APP_BUILD, APP_VERSION, applyNow, checkForUpdate, downloadAndInstallApk, downloadOta, updateState } from './updater'
import { Card, useT } from './ui'

export default function UpdatesCard({ toast }) {
  const { lang } = useT()
  const T = (ar, en) => (lang === 'ar' ? ar : en)
  const [st, setSt] = useState(() => ({ ...updateState(), busy: false, progress: null, err: '' }))
  const result = st.result
  const m = result?.manifest
  const notes = m?.notes?.[lang] || []

  const check = async () => {
    setSt((s) => ({ ...s, busy: true, err: '' }))
    try {
      const r = await checkForUpdate({ force: true })
      let ready = updateState().ready
      if (r.type === 'ota') ready = await downloadOta(r.manifest)
      setSt((s) => ({ ...s, busy: false, result: r, ready }))
      if (r.type === 'none') toast(T('عندكم آخر نسخة ✅', 'You have the latest version ✅'))
    } catch {
      setSt((s) => ({ ...s, busy: false, err: T('ما قدرنا نفحص. تأكدوا من الإنترنت', "Couldn't check. Check the internet") }))
    }
  }
  const installApk = async () => {
    setSt((s) => ({ ...s, progress: 0, err: '' }))
    try {
      await downloadAndInstallApk(m, (p) => setSt((s) => ({ ...s, progress: p })))
      setSt((s) => ({ ...s, progress: null }))
    } catch {
      setSt((s) => ({ ...s, progress: null, err: T('فشل التنزيل، جرّبوا كمان مرة', 'Download failed, try again') }))
    }
  }
  useEffect(() => { setSt((s) => ({ ...s, ...updateState() })) }, [])

  const otaReady = st.ready && st.ready.build > APP_BUILD
  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="font-black">🔄 {T('التحديثات', 'Updates')}</h2>
          <p className="text-[11px] text-[var(--text-soft)]" dir="ltr">NutriLoop {APP_VERSION} · build {APP_BUILD}</p>
        </div>
        {isNative && (
          <button onClick={check} disabled={st.busy || st.progress != null} className="px-3 py-2 rounded-xl border border-[var(--border)] text-sm font-bold disabled:opacity-50">
            {st.busy ? '⏳' : '🔍'} {T('فحص', 'Check')}
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

      {result?.type === 'apk' && (
        <div className="rounded-2xl bg-[var(--primary-soft)] p-3 space-y-2">
          <p className="text-sm font-black">🎁 {T(`نسخة جديدة ${m.version}`, `New version ${m.version}`)}</p>
          {notes.length > 0 && <ul className="text-xs list-disc ps-5 space-y-0.5">{notes.map((n, i) => <li key={i}>{n}</li>)}</ul>}
          <p className="text-[11px] text-[var(--text-soft)]">{T('بعد التنزيل أندرويد بيسألكم "تثبيت؟". البيانات بتضل محفوظة.', 'After downloading, Android asks "Install?". Your data stays.')}</p>
          {st.progress != null ? (
            <div className="h-3 bg-white rounded-full overflow-hidden"><div className="h-full bg-[var(--primary)] transition-all" style={{ width: `${Math.round(st.progress * 100)}%` }} /></div>
          ) : (
            <button onClick={installApk} className="w-full py-2.5 rounded-xl bg-[var(--primary)] text-white font-black">⬇️ {T('تنزيل وتثبيت', 'Download & install')}</button>
          )}
        </div>
      )}
      {result?.type === 'ota' && !otaReady && notes.length > 0 && <ul className="text-xs list-disc ps-5">{notes.map((n, i) => <li key={i}>{n}</li>)}</ul>}
    </Card>
  )
}
