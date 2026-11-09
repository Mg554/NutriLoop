// Ramadan card (Today tab): countdown to iftar / suhoor, a wall of 30 lanterns
// that light up with each fasting day, fasting choice, water plan, tips, dua.
import { useEffect, useState } from 'react'
import { todayStr } from '../../store'
import { sfx } from '../../sfx'
import { useT } from '../../ui'
import { daysText, FAST_CHOICES, IFTAR_DUA, IFTAR_TIPS, SUHOOR_TIPS, WATER_PLAN, daysToRamadan, fastTimes, hhmm, hijri, ramadanActive } from './data'

function Lantern({ state, today }) {
  // state: full | bird | none | future | missed
  const glass = { full: '#FCD34D', bird: '#FDBA74', none: '#334155', missed: '#334155', future: 'transparent' }[state]
  const glow = state === 'full' || state === 'bird'
  return (
    <svg viewBox="0 0 24 34" className={`w-full h-auto ${glow ? 'drop-shadow-[0_0_6px_rgba(252,211,77,.7)]' : ''}`} aria-hidden="true">
      <path d="M12 1 v3" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M7 5 h10 l-1.5 3 h-7 z" fill="#B45309" />
      <path d="M6 8 h12 l1 16 a2 2 0 0 1 -2 2 h-10 a2 2 0 0 1 -2 -2 z" fill={glass} stroke={state === 'future' ? '#94A3B8' : '#B45309'} strokeWidth="1.2" strokeDasharray={state === 'future' ? '2 2' : ''} />
      {state === 'bird' && <path d="M6.6 16 h10.8 l.6 8 a2 2 0 0 1 -2 2 h-8 a2 2 0 0 1 -2 -2 z" fill="#FCD34D" />}
      {glow && <ellipse cx="12" cy="17" rx="2.2" ry="3.4" fill="#FFF7D6" />}
      <path d="M8 26 h8 l-1.5 4 h-5 z" fill="#B45309" />
      {today && <circle cx="12" cy="17" r="11" fill="none" stroke="#38BDF8" strokeWidth="1.4" />}
    </svg>
  )
}

const two = (n) => String(n).padStart(2, '0')
const left = (ms) => { const m = Math.max(0, Math.round(ms / 60000)); return `${Math.floor(m / 60)}:${two(m % 60)}` }

export function RamadanSoon({ settings }) {
  const { t, lang } = useT()
  const cfg = settings.ramadan
  if (cfg?.mode === 'off') return null
  const n = daysToRamadan(new Date(), cfg?.hijriOffset || 0)
  if (!n || n > 20) return null
  return (
    <div className="rounded-2xl px-4 py-3 text-white flex items-center gap-3 shadow" style={{ background: 'linear-gradient(135deg,#0f3d3e,#14532d)' }}>
      <span className="text-3xl">🏮</span>
      <p className="font-black text-sm">{t('ramadanSoon', { n: daysText(n, lang) })}</p>
    </div>
  )
}

export default function RamadanCard({ child, progress, settings, actions }) {
  const { t, pick, lang } = useT()
  const cfg = settings.ramadan
  const [now, setNow] = useState(Date.now())
  const [open, setOpen] = useState(null)
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(id) }, [])
  if (!ramadanActive(cfg)) return null

  const off = cfg.hijriOffset || 0
  const h = hijri(new Date(now), off)
  const inMonth = h.m === 9
  const times = fastTimes(cfg, new Date(now))
  const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1)
  const fajrNext = now < times.fajr ? times.fajr : fastTimes(cfg, tomorrow).fajr
  const fasting = now >= times.fajr && now < times.maghrib
  const today = todayStr()
  const choice = progress.ramadanFasts?.[today]
  const rwater = progress.day?.rwater || {}

  // lantern wall: Ramadan day i -> calendar date
  const day1 = new Date(now); day1.setDate(day1.getDate() - (inMonth ? h.d - 1 : 0))
  const lanterns = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(day1); d.setDate(d.getDate() + i)
    const key = todayStr(d)
    const isToday = key === today
    const past = d < new Date(today + 'T00:00:00')
    const v = progress.ramadanFasts?.[key]
    return { i, isToday, state: v === 'full' ? 'full' : v === 'bird' ? 'bird' : past || (isToday && v === 'none') ? 'missed' : 'future' }
  })
  const fastedDays = Object.values(progress.ramadanFasts || {}).filter((v) => v !== 'none').length

  const Tip = ({ id, title, children }) => (
    <div className="rounded-2xl bg-white/5 border border-white/10">
      <button onClick={() => setOpen(open === id ? null : id)} className="w-full px-3 py-2.5 flex items-center justify-between text-sm font-bold">
        {title}<span className="text-xs opacity-70">{open === id ? '▲' : '▼'}</span>
      </button>
      {open === id && <div className="px-3 pb-3 text-sm text-emerald-50 space-y-1">{children}</div>}
    </div>
  )

  return (
    <div className="rounded-3xl p-4 text-white shadow-lg space-y-3 relative overflow-hidden" style={{ background: 'linear-gradient(160deg,#052e2b 0%,#0f3d3e 45%,#1e1b4b 100%)' }}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-black text-base">🌙 {t('ramadanKareem')}</h3>
          {inMonth && <p className="text-[11px] text-emerald-200">{t('ramadanDay', { n: h.d.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en') })}</p>}
        </div>
        <span className="text-[11px] font-black px-2 py-1 rounded-full bg-amber-300/20 text-amber-200">🏮 {fastedDays}</span>
      </div>

      {/* countdown */}
      <div className="rounded-2xl bg-black/25 p-3 flex items-center justify-between">
        {fasting ? (
          <>
            <div><div className="text-[11px] text-emerald-200">{t('toIftar')}</div><div className="text-3xl font-black tabular-nums" dir="ltr">{left(times.maghrib - now)}</div></div>
            <div className="text-end text-xs"><div className="text-emerald-200">{t('iftarAt')}</div><div className="font-black text-lg" dir="ltr">{hhmm(times.maghrib)}</div></div>
          </>
        ) : (
          <>
            <div><div className="text-[11px] text-emerald-200">{now >= times.maghrib && now - times.maghrib < 3600000 ? t('iftarTime') : t('suhoorUntil')}</div><div className="text-3xl font-black tabular-nums" dir="ltr">{hhmm(fajrNext)}</div></div>
            <div className="text-end text-xs"><div className="text-emerald-200">{t('iftarAt')}</div><div className="font-black text-lg" dir="ltr">{hhmm(times.maghrib)}</div></div>
          </>
        )}
      </div>

      {/* today's fast */}
      {inMonth && (
        <div className="space-y-1.5">
          <p className="text-xs font-bold text-emerald-100">{t('fastQ')}</p>
          <div className="grid grid-cols-3 gap-1.5">
            {FAST_CHOICES.map((c) => (
              <button key={c.id} onClick={() => { sfx.pop(); actions.setFast(child.id, c.id) }}
                className={`rounded-2xl px-1.5 py-2 text-[11px] font-bold flex flex-col items-center gap-0.5 border transition ${choice === c.id ? 'bg-amber-300 text-emerald-950 border-amber-300' : 'bg-white/5 border-white/15'}`}>
                <span className="text-xl">{c.emoji}</span>{c[lang]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* lantern wall */}
      <div>
        <p className="text-xs font-bold text-emerald-100 mb-1">🏮 {t('lanterns')}</p>
        <div className="grid grid-cols-10 gap-1 bg-black/20 rounded-2xl p-2" dir="rtl">
          {lanterns.map((l) => <Lantern key={l.i} state={l.state} today={l.isToday} />)}
        </div>
      </div>

      {/* water plan */}
      <div>
        <p className="text-xs font-bold text-emerald-100 mb-1">💧 {t('waterPlan')}</p>
        <div className="grid grid-cols-4 gap-1.5">
          {WATER_PLAN.map((w) => (
            <button key={w.id} onClick={() => actions.ramadanWater(child.id, w.id)}
              className={`rounded-xl py-1.5 text-[10px] font-bold flex flex-col items-center gap-0.5 border ${rwater[w.id] ? 'bg-sky-400 text-sky-950 border-sky-300' : 'bg-white/5 border-white/15'}`}>
              <span className="text-lg">{rwater[w.id] ? '✅' : w.emoji}</span>{w[lang]}
            </button>
          ))}
        </div>
      </div>

      <Tip id="iftar" title={`🍽️ ${t('iftarPlate')}`}>{IFTAR_TIPS[lang].map((x, i) => <p key={i}>• {x}</p>)}</Tip>
      <Tip id="suhoor" title={`🥣 ${t('suhoorPlate')}`}>{SUHOOR_TIPS[lang].map((x, i) => <p key={i}>• {x}</p>)}</Tip>
      <Tip id="dua" title={`🤲 ${t('iftarDua')}`}>
        <p className="text-xl leading-loose text-center text-amber-100" style={{ fontFamily: 'Amiri, Cairo, serif' }}>{IFTAR_DUA.text}</p>
        <p className="text-[11px] text-center text-emerald-200">{pick(IFTAR_DUA.note)}</p>
      </Tip>
    </div>
  )
}
