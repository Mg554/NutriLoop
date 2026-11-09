// Parent settings: system reminders (Android notifications).
import { useState } from 'react'
import { isNative } from './native'
import { REMINDERS, defaultReminders, enableNotifications, testReminder } from './reminders'
import { Card, useT } from './ui'

const NAMES = {
  ar: { morning: '🏫 روتين الصباح', breakfast: '🍳 الفطور', water1: '💧 مي (١)', lunch: '🍽️ الغدا', water2: '💧 مي (٢)', move: '⚡ الحركة', dinner: '🍲 العشا', bedtime: '⭐ رحلة النجوم', report: '📊 تقرير الأسبوع (الجمعة، للأهل)', suhoor: '🥣 السحور (رمضان)', iftar: '🌅 الإفطار (رمضان)', rwater: '💧 مي بعد التراويح (رمضان)' },
  en: { morning: '🏫 Morning routine', breakfast: '🍳 Breakfast', water1: '💧 Water (1)', lunch: '🍽️ Lunch', water2: '💧 Water (2)', move: '⚡ Movement', dinner: '🍲 Dinner', bedtime: '⭐ Star Journey', report: '📊 Weekly report (Friday, parents)', suhoor: '🥣 Suhoor (Ramadan)', iftar: '🌅 Iftar (Ramadan)', rwater: '💧 Water after taraweeh (Ramadan)' },
}
const DAYS = { ar: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'], en: ['S', 'M', 'T', 'W', 'T', 'F', 'S'] }

export default function RemindersCard({ state, actions, toast }) {
  const { lang } = useT()
  const T = (ar, en) => (lang === 'ar' ? ar : en)
  const cfg = { ...defaultReminders(), ...state.settings.reminders }
  const [busy, setBusy] = useState(false)
  const save = (patch) => actions.setSetting('reminders', { ...cfg, ...patch })
  const setItem = (id, patch) => save({ items: { ...cfg.items, [id]: { ...cfg.items[id], ...patch } } })

  const toggleMaster = async () => {
    if (cfg.on) return save({ on: false })
    setBusy(true)
    const perm = await enableNotifications().catch(() => 'denied')
    setBusy(false)
    if (perm === 'granted') { save({ on: true }); toast(T('التذكيرات اشتغلت ✅', 'Reminders on ✅')) }
    else toast(T('لازم تسمحوا بالإشعارات من إعدادات الجهاز', 'Allow notifications in the phone settings'))
  }

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-black">⏰ {T('التذكيرات', 'Reminders')}</h2>
          <p className="text-[11px] text-[var(--text-soft)]">{isNative ? T('إشعارات على الموبايل بمواعيد الأكل والمي والحركة. إذا الطفل خلّص المهمة، تذكير اليوم ما بيطلع.', "Phone notifications for meals, water and movement. Today's reminder is skipped once it's done.") : T('التذكيرات بتشتغل بتطبيق الأندرويد بس', 'Reminders work in the Android app only')}</p>
        </div>
        <button disabled={!isNative || busy} onClick={toggleMaster} role="switch" aria-checked={cfg.on}
          className={`w-12 h-7 shrink-0 rounded-full relative transition disabled:opacity-40 ${cfg.on ? 'bg-[var(--primary)]' : 'bg-gray-300'}`}>
          <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all ${cfg.on ? 'end-0.5' : 'start-0.5'}`} />
        </button>
      </div>
      {cfg.on && (
        <>
          <div className="divide-y divide-[var(--border)]">
            {REMINDERS.map((r) => {
              const it = cfg.items[r.id] || { on: true, t: r.def }
              return (
                <div key={r.id} className="flex items-center gap-2 py-1.5">
                  <input id={`rem-${r.id}`} type="checkbox" checked={it.on} onChange={(e) => setItem(r.id, { on: e.target.checked })} className="w-5 h-5 accent-[var(--primary)]" />
                  <label htmlFor={`rem-${r.id}`} className={`flex-1 text-sm font-bold ${it.on ? '' : 'opacity-40'}`}>{NAMES[lang][r.id]}</label>
                  {r.ramadan ? (
                    <span className="text-[11px] text-[var(--text-soft)]">{lang === 'ar' ? (r.ramadan === 'fajr' ? 'قبل الفجر ٤٥ د' : r.offset < 0 ? 'قبل المغرب ١٠ د' : 'بعد المغرب بساعتين ونص') : r.ramadan === 'fajr' ? '45 min before fajr' : r.offset < 0 ? '10 min before maghrib' : '2.5 h after maghrib'}</span>
                  ) : (
                    <input id={`rem-${r.id}-t`} type="time" value={it.t} disabled={!it.on} onChange={(e) => e.target.value && setItem(r.id, { t: e.target.value })}
                      className="px-2 py-1 rounded-lg border border-[var(--border)] text-sm disabled:opacity-40" dir="ltr" />
                  )}
                </div>
              )
            })}
          </div>
          <div>
            <p className="text-[11px] font-bold text-[var(--text-soft)] mb-1">{T('أيام المدرسة (لتذكير روتين الصباح)', 'School days (morning routine reminder)')}</p>
            <div className="flex gap-1.5" dir="ltr">
              {DAYS[lang].map((d, i) => {
                const on = cfg.schoolDays.includes(i)
                return <button key={i} onClick={() => save({ schoolDays: on ? cfg.schoolDays.filter((x) => x !== i) : [...cfg.schoolDays, i] })}
                  className={`w-9 h-9 rounded-full text-sm font-black ${on ? 'bg-[var(--primary)] text-white' : 'bg-white border border-[var(--border)]'}`}>{d}</button>
              })}
            </div>
          </div>
          <button onClick={() => { testReminder(state).then(() => toast(T('رح يوصل إشعار تجربة خلال ٥ ثواني 🔔', 'A test notification arrives in 5 seconds 🔔'))).catch(() => {}) }}
            className="px-3 py-2 rounded-xl border border-[var(--border)] text-sm font-bold">🔔 {T('جرّب إشعار', 'Send a test')}</button>
        </>
      )}
    </Card>
  )
}
