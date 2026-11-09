// Parent settings: Ramadan mode (auto by Hijri calendar / on / off), city,
// calculation method, Hijri offset for local moon sighting, minute adjustments.
import { Card, useT } from '../../ui'
import { daysText, CITIES, METHODS, daysToRamadan, defaultRamadan, fastTimes, hhmm, hijri, ramadanActive } from './data'

export default function RamadanSettings({ state, actions }) {
  const { t, lang } = useT()
  const cfg = { ...defaultRamadan(), ...state.settings.ramadan }
  const save = (patch) => actions.setSetting('ramadan', { ...cfg, ...patch })
  const active = ramadanActive(cfg)
  const n = daysToRamadan(new Date(), cfg.hijriOffset)
  // preview: today if Ramadan, else the first day of the coming Ramadan
  const preview = new Date()
  if (!active && n) preview.setDate(preview.getDate() + n)
  const tm = fastTimes(cfg, preview)
  const h = hijri(new Date(), cfg.hijriOffset)
  const kids = state.children.map((c) => ({ c, n: Object.values(state.progress[c.id]?.ramadanFasts || {}).filter((v) => v !== 'none').length }))
  const chip = (on) => `px-2.5 py-1.5 rounded-xl text-xs font-bold border ${on ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'bg-white border-[var(--border)]'}`
  const sel = 'w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-white text-sm'
  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-black">🌙 {t('rSettings')}</h2>
        <span className="text-[11px] text-[var(--text-soft)]" dir="ltr">{h.d}/{h.m}/{h.y} AH</span>
      </div>
      <div className="flex gap-1.5">
        {[['auto', t('rAuto')], ['on', t('rOn')], ['off', t('rOff')]].map(([v, l]) => <button key={v} onClick={() => save({ mode: v })} className={chip(cfg.mode === v)}>{l}</button>)}
      </div>
      <p className="text-xs text-[var(--text-soft)]">
        {active ? `✅ ${t('ramadanKareem')}` : n ? t('ramadanSoon', { n: daysText(n, lang) }) : lang === 'ar' ? 'بيشتغل لحاله أول يوم برمضان' : 'Turns on by itself on 1 Ramadan'}
      </p>
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs font-bold text-[var(--text-soft)]">{t('rCity')}
          <select id="r-city" value={cfg.city} onChange={(e) => save({ city: e.target.value })} className={sel + ' mt-1'}>
            {CITIES.map((c) => <option key={c.id} value={c.id}>{c[lang]}</option>)}
          </select>
        </label>
        <label className="text-xs font-bold text-[var(--text-soft)]">{t('rMethod')}
          <select id="r-method" value={cfg.method} onChange={(e) => save({ method: e.target.value })} className={sel + ' mt-1'}>
            {Object.entries(METHODS).map(([k, m]) => <option key={k} value={k}>{m[lang]}</option>)}
          </select>
        </label>
      </div>
      <div className="rounded-xl bg-[var(--bg-soft)] p-2.5 grid grid-cols-2 gap-2 text-center text-sm">
        <div><div className="text-[11px] text-[var(--text-soft)]">🥣 {t('rFajr')}</div><div className="font-black tabular-nums" dir="ltr">{hhmm(tm.fajr)}</div></div>
        <div><div className="text-[11px] text-[var(--text-soft)]">🌅 {t('rMaghrib')}</div><div className="font-black tabular-nums" dir="ltr">{hhmm(tm.maghrib)}</div></div>
      </div>
      <details className="text-xs">
        <summary className="font-bold cursor-pointer">⚙️ {t('rOffset')} · {t('rAdj')}</summary>
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-1.5">
            {[-1, 0, 1].map((v) => <button key={v} onClick={() => save({ hijriOffset: v })} className={chip(cfg.hijriOffset === v)} dir="ltr">{v > 0 ? `+${v}` : v}</button>)}
            <span className="text-[var(--text-soft)]">{lang === 'ar' ? 'يوم (حسب رؤية الهلال عندكم)' : 'day (local moon sighting)'}</span>
          </div>
          {[['fajrAdj', t('rFajr')], ['maghribAdj', t('rMaghrib')]].map(([k, l]) => (
            <label key={k} className="flex items-center gap-2">
              <span className="w-14 font-bold">{l}</span>
              <input id={`r-${k}`} type="range" min={-10} max={10} value={cfg[k]} onChange={(e) => save({ [k]: +e.target.value })} className="flex-1 accent-[var(--primary)]" />
              <span className="w-10 tabular-nums text-end" dir="ltr">{cfg[k] > 0 ? '+' : ''}{cfg[k]}m</span>
            </label>
          ))}
        </div>
      </details>
      {kids.some((k) => k.n) && (
        <div className="text-xs flex flex-wrap gap-2">{kids.map(({ c, n }) => <span key={c.id} className="px-2 py-1 rounded-full bg-amber-50 border border-amber-200">{c.avatar} {c.name}: 🏮 {n} {t('rFasted')}</span>)}</div>
      )}
    </Card>
  )
}
