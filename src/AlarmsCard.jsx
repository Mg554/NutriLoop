// Parent card: alarm tone, school wake-up alarm per child, custom alarms.
import { useRef, useState } from 'react'
import { ALARM_EMOJI, ALARM_TONES, alarmOccurrences, defaultAlarms, toneUrl } from './alarms'
import { enableNotifications } from './reminders'
import { isNative } from './native'
import { Card, useT } from './ui'

const DAYS = { ar: ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'], en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] }

export default function AlarmsCard({ state, actions, toast }) {
  const { lang } = useT()
  const A = (a, e) => (lang === 'ar' ? a : e)
  const cfg = { ...defaultAlarms(), ...(state.settings.alarms || {}) }
  const save = (patch) => actions.setSetting('alarms', { ...cfg, ...patch })
  const [edit, setEdit] = useState(null)
  const player = useRef(null)
  const preview = (id) => {
    player.current?.pause()
    const a = new Audio(toneUrl(id)); a.play().catch(() => {}); player.current = a
    setTimeout(() => a.pause(), 4000)
  }
  const ensurePerm = async () => { if (isNative) { const p = await enableNotifications(); if (p !== 'granted') toast?.(A('اسمحوا بالإشعارات عشان المنبه يرن', 'Allow notifications so alarms can ring')) } }
  const next = alarmOccurrences(state)[0]

  const saveItem = (it) => {
    const items = cfg.items.some((x) => x.id === it.id) ? cfg.items.map((x) => (x.id === it.id ? it : x)) : [...cfg.items, it]
    save({ items }); setEdit(null); ensurePerm()
  }

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-black">⏰ {A('المنبهات', 'Alarms')}</h2>
        {next && <span className="text-[11px] font-bold text-[var(--text-soft)]" dir="auto">{A('الجاي:', 'Next:')} {next.at.toLocaleString(lang === 'ar' ? 'ar' : 'en', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}</span>}
      </div>
      {!isNative && <p className="text-[11px] text-[var(--text-soft)]">{A('على الكمبيوتر المنبه بيرن بس لما التطبيق مفتوح.', 'On the computer, alarms ring only while the app is open.')}</p>}

      <div>
        <p className="text-xs font-black mb-1">{A('النغمة', 'Tone')}</p>
        <div className="grid grid-cols-4 gap-1.5">
          {ALARM_TONES.map((t) => (
            <button key={t.id} onClick={() => { save({ tone: t.id }); preview(t.id) }} className={`py-2 rounded-xl text-[11px] font-black border flex flex-col items-center ${cfg.tone === t.id ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'bg-white border-[var(--border)]'}`}>
              <span className="text-xl">{t.emoji}</span>{t[lang]}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs font-black">🌅 {A('منبه الصحيان للمدرسة (أيام المدرسة، على وقت الصحيان)', 'School wake-up (school days, at the wake-up time)')}</p>
        {state.children.map((c) => (
          <button key={c.id} onClick={() => { save({ wake: { ...cfg.wake, [c.id]: !cfg.wake[c.id] } }); if (!cfg.wake[c.id]) ensurePerm() }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-sm font-bold ${cfg.wake[c.id] ? 'bg-orange-50 border-orange-300' : 'bg-white border-[var(--border)]'}`}>
            <span>{c.avatar} {c.name}</span>
            <span dir="ltr" className="text-xs">{c.wake || '06:30'} {cfg.wake[c.id] ? '✅' : '⬜'}</span>
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        <p className="text-xs font-black">📝 {A('منبهات خاصة', 'Custom alarms')}</p>
        {cfg.items.map((a) => (
          <div key={a.id} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border)]">
            <span className="text-xl">{a.emoji}</span>
            <button onClick={() => setEdit(a)} className="flex-1 text-start">
              <span className="block text-sm font-bold">{a.label}</span>
              <span className="text-[11px] text-[var(--text-soft)]"><bdi dir="ltr">{a.t}</bdi> · {a.days.length === 7 ? A('كل يوم', 'every day') : a.days.map((d) => DAYS[lang][d]).join('، ')}{a.child ? ` · ${state.children.find((c) => c.id === a.child)?.name || ''}` : ''}</span>
            </button>
            <button onClick={() => saveItem({ ...a, on: a.on === false })} className={`px-2 py-1 rounded-lg text-[11px] font-black ${a.on === false ? 'bg-gray-200' : 'bg-green-500 text-white'}`}>{a.on === false ? A('مطفي', 'Off') : A('شغّال', 'On')}</button>
          </div>
        ))}
        <button onClick={() => setEdit({ id: 'a' + Date.now(), label: '', emoji: '⏰', t: '07:00', days: [0, 1, 2, 3, 4, 5, 6], child: null, on: true })} className="w-full py-2 rounded-xl border-2 border-dashed border-[var(--border)] text-sm font-black text-[var(--text-soft)]">＋ {A('منبه جديد', 'New alarm')}</button>
      </div>

      {edit && (
        <div className="rounded-2xl bg-[var(--surface-2,#f8f5ef)] p-3 space-y-2.5">
          <input value={edit.label} onChange={(e) => setEdit({ ...edit, label: e.target.value.slice(0, 30) })} placeholder={A('اسم المنبه (مثلًا: تدريب كورة)', 'Alarm name (e.g. football practice)')} className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-white" />
          <div className="flex flex-wrap gap-1">{ALARM_EMOJI.map((e) => <button key={e} onClick={() => setEdit({ ...edit, emoji: e })} className={`w-9 h-9 rounded-xl text-xl ${edit.emoji === e ? 'bg-amber-200 ring-2 ring-amber-400' : 'bg-white'}`}>{e}</button>)}</div>
          <input type="time" value={edit.t} onChange={(e) => setEdit({ ...edit, t: e.target.value || '07:00' })} className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-white" dir="ltr" />
          <div className="grid grid-cols-7 gap-1">
            {DAYS[lang].map((d, i) => (
              <button key={i} onClick={() => setEdit({ ...edit, days: edit.days.includes(i) ? edit.days.filter((x) => x !== i) : [...edit.days, i].sort() })} className={`py-1.5 rounded-lg text-[10px] font-black ${edit.days.includes(i) ? 'bg-sky-500 text-white' : 'bg-white border border-[var(--border)]'}`}>{d}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => setEdit({ ...edit, child: null })} className={`px-3 py-1.5 rounded-full text-xs font-black border ${!edit.child ? 'bg-[var(--primary)] text-white' : 'bg-white border-[var(--border)]'}`}>{A('للكل', 'Everyone')}</button>
            {state.children.map((c) => <button key={c.id} onClick={() => setEdit({ ...edit, child: c.id })} className={`px-3 py-1.5 rounded-full text-xs font-black border ${edit.child === c.id ? 'bg-[var(--primary)] text-white' : 'bg-white border-[var(--border)]'}`}>{c.avatar} {c.name}</button>)}
          </div>
          <div className="flex gap-2">
            <button disabled={!edit.label.trim() || !edit.days.length} onClick={() => saveItem({ ...edit, label: edit.label.trim() })} className="flex-1 py-2.5 rounded-xl bg-[var(--primary)] text-white font-black disabled:opacity-40">{A('حفظ', 'Save')}</button>
            {cfg.items.some((x) => x.id === edit.id) && <button onClick={() => { save({ items: cfg.items.filter((x) => x.id !== edit.id) }); setEdit(null) }} className="px-4 py-2.5 rounded-xl bg-rose-50 text-rose-700 font-black">🗑️</button>}
            <button onClick={() => setEdit(null)} className="px-4 py-2.5 rounded-xl bg-white border border-[var(--border)] font-bold">{A('إلغاء', 'Cancel')}</button>
          </div>
        </div>
      )}
    </Card>
  )
}
