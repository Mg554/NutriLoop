// "Star Journey" — the bedtime routine. Each finished step lights a star; the
// stars join into a constellation and the moon grows from crescent to full.
import { useEffect, useMemo, useRef, useState } from 'react'
import { confetti, say, sfx } from '../../sfx'
import { useBack } from '../../backStack'
import { useT } from '../../ui'
import { ADHKAR, BRUSH_ZONES, BRUSH_ZONE_SEC, GRATITUDE, STEPS, bedtimeFor } from './data'

// Steps shown tonight (school bag only before a school day)
export function tonightSteps(schoolDays = [0, 1, 2, 3, 4]) {
  const tomorrow = (new Date().getDay() + 1) % 7
  return STEPS.filter((s) => !s.school || schoolDays.includes(tomorrow))
}
const nightOf = (progress) => progress?.day?.night || { steps: {}, thanks: [] }

// ---- visuals -----------------------------------------------------------------
function Moon({ f, size = 120, glow = true }) {
  // f = lit fraction 0..1: a dark disc slides off the bright one
  const r = 46
  const dx = 4 + f * 2 * r
  const id = useMemo(() => 'm' + Math.random().toString(36).slice(2, 7), [])
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <defs>
        <radialGradient id={id + 'g'} cx="40%" cy="35%" r="70%"><stop offset="0" stopColor="#FFF7D6" /><stop offset="1" stopColor="#F5D776" /></radialGradient>
        <mask id={id}><rect width="100" height="100" fill="white" /><circle cx={50 - dx} cy="50" r={r + 1} fill="black" /></mask>
      </defs>
      {glow && <circle cx="50" cy="50" r="49" fill="#F5D776" opacity={0.08 + f * 0.18} />}
      <circle cx="50" cy="50" r={r} fill="#2a2f5a" opacity=".55" />
      <circle cx="50" cy="50" r={r} fill={`url(#${id}g)`} mask={`url(#${id})`} />
      <g fill="#E9C65A" opacity={0.25 + f * 0.35} mask={`url(#${id})`}>
        <circle cx="62" cy="38" r="5" /><circle cx="70" cy="60" r="3.5" /><circle cx="55" cy="66" r="2.5" />
      </g>
    </svg>
  )
}

function Sky() {
  const stars = useMemo(
    () => Array.from({ length: 46 }, () => ({ x: Math.random() * 100, y: Math.random() * 70, s: 1 + Math.random() * 2, d: Math.random() * 4 })),
    [],
  )
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {stars.map((s, i) => (
        <span key={i} className="night-twinkle absolute rounded-full bg-white" style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, animationDelay: `${s.d}s` }} />
      ))}
    </div>
  )
}

// ---- Today-tab card ------------------------------------------------------------
export function NightCard({ child, progress, schoolDays, onOpen }) {
  const { t } = useT()
  const steps = tonightSteps(schoolDays)
  const n = nightOf(progress)
  const lit = steps.filter((s) => n.steps[s.id]).length
  const done = !!n.done
  return (
    <button onClick={onOpen} className="relative w-full text-start rounded-3xl p-4 overflow-hidden text-white shadow-lg active:scale-[.99] transition" style={{ background: 'linear-gradient(135deg,#0b1026 0%,#1e1b4b 60%,#3b2a6b 100%)' }}>
      <Sky />
      <div className="relative flex items-center gap-3">
        <Moon f={done ? 1 : lit / steps.length} size={64} />
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-base">🌙 {t('nightTitle')}</h3>
          <p className="text-[11px] text-indigo-200">{done ? t('nightDoneCard') : t('nightSub')}</p>
          <div className="flex items-center gap-2 mt-1.5 text-[11px] font-bold">
            <span className="px-2 py-0.5 rounded-full bg-white/10">⏰ {t('bedtimeAt')} <bdi dir="ltr">{bedtimeFor(child)}</bdi></span>
            <span className="px-2 py-0.5 rounded-full bg-white/10">⭐ {lit}/{steps.length}</span>
          </div>
        </div>
        {!done && <span className="px-3 py-2 rounded-xl bg-amber-300 text-indigo-950 text-xs font-black">{lit ? t('nightContinue') : t('nightStart')}</span>}
      </div>
    </button>
  )
}

// ---- step panels ---------------------------------------------------------------
function BrushTimer({ onDone }) {
  const { t, pick, lang } = useT()
  const total = BRUSH_ZONES.length * BRUSH_ZONE_SEC
  const [left, setLeft] = useState(total)
  const [running, setRunning] = useState(false)
  const endAt = useRef(0)
  const zone = Math.min(BRUSH_ZONES.length - 1, Math.floor((total - left) / BRUSH_ZONE_SEC))
  const lastZone = useRef(-1)
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      const l = Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000))
      setLeft(l)
      if (l === 0) { clearInterval(id); setRunning(false); sfx.fanfare(); say(t('brushDone'), lang); onDone() }
    }, 250)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])
  useEffect(() => {
    if (running && zone !== lastZone.current) { lastZone.current = zone; sfx.pop(); say(pick(BRUSH_ZONES[zone].name), lang) }
  }, [zone, running, pick, lang])
  const start = () => { endAt.current = Date.now() + left * 1000; setRunning(true) }
  const pct = (total - left) / total
  const zoneLeft = left - (BRUSH_ZONES.length - 1 - zone) * BRUSH_ZONE_SEC
  // quadrants of the mouth: [x, y] centres (viewer's view, child's right = screen left)
  const Q = { ur: [34, 36], ul: [66, 36], ll: [66, 64], lr: [34, 64] }
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-56 h-56">
        <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
          <circle cx="50" cy="50" r="46" fill="none" stroke="#ffffff22" strokeWidth="5" />
          <circle cx="50" cy="50" r="46" fill="none" stroke="#fcd34d" strokeWidth="5" strokeLinecap="round" strokeDasharray={289} strokeDashoffset={289 * (1 - pct)} style={{ transition: 'stroke-dashoffset .3s linear' }} />
        </svg>
        <svg viewBox="0 0 100 100" className="absolute inset-4">
          <ellipse cx="50" cy="50" rx="38" ry="30" fill="#7f1d1d" opacity=".55" />
          {BRUSH_ZONES.map((z, i) => {
            const [x, y] = Q[z.id]
            const active = running && i === zone
            const done = i < zone || left === 0
            return (
              <g key={z.id}>
                {[-9, 0, 9].map((dx) => (
                  <rect key={dx} x={x + dx - 4} y={y - 7} width="8" height="14" rx="3.5" fill={done ? '#ffffff' : active ? '#fef3c7' : '#e5e7eb'} opacity={done || active ? 1 : 0.55}
                    className={active ? 'night-pulse' : ''} />
                ))}
                {done && <text x={x} y={y + 2} fontSize="8" textAnchor="middle">✨</text>}
              </g>
            )
          })}
          <line x1="14" y1="50" x2="86" y2="50" stroke="#fca5a5" strokeWidth="1.5" opacity=".6" />
        </svg>
        {running && <span className="absolute text-3xl night-brush" style={{ left: `${Q[BRUSH_ZONES[zone].id][0]}%`, top: `${Q[BRUSH_ZONES[zone].id][1] - 6}%` }}>🪥</span>}
      </div>
      <div className="text-center">
        <div className="text-amber-200 font-black text-lg">{left === 0 ? t('brushDone') : running ? `${t('brushNow')}: ${pick(BRUSH_ZONES[zone].name)}` : t('brushTip')}</div>
        {running && <div className="text-4xl font-black tabular-nums" dir="ltr">{zoneLeft}</div>}
      </div>
      {!running && left > 0 && <button onClick={start} className="px-8 py-3 rounded-full bg-amber-300 text-indigo-950 font-black">🪥 {t('brushGo')}</button>}
    </div>
  )
}

function Tasbih({ items, onDone }) {
  const [i, setI] = useState(0)
  const [n, setN] = useState(0)
  const [phrase, target] = items[Math.min(i, items.length - 1)]
  const tap = () => {
    navigator.vibrate?.(8)
    if (n + 1 >= target) {
      sfx.sparkle()
      if (i + 1 >= items.length) { setN(target); onDone(); return }
      setI(i + 1); setN(0)
    } else { sfx.pop(); setN(n + 1) }
  }
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-1.5">{items.map((_, k) => <span key={k} className={`w-2.5 h-2.5 rounded-full ${k < i ? 'bg-amber-300' : k === i ? 'bg-white' : 'bg-white/25'}`} />)}</div>
      <div className="text-2xl font-black text-amber-100" style={{ fontFamily: 'Amiri, Cairo, serif' }}>{phrase}</div>
      <button onClick={tap} className="relative w-32 h-32 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 text-indigo-950 shadow-[0_0_30px_rgba(252,211,77,.45)] active:scale-95 transition flex flex-col items-center justify-center">
        <span className="text-4xl font-black tabular-nums" dir="ltr">{n}</span>
        <span className="text-xs font-bold" dir="ltr">/ {target}</span>
      </button>
    </div>
  )
}

function Adhkar({ onDone }) {
  const { t, pick } = useT()
  const [done, setDone] = useState({})
  const [counts, setCounts] = useState({})
  const all = ADHKAR.every((a) => done[a.id])
  useEffect(() => { if (all) onDone() }, [all]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="space-y-3 max-h-[52vh] overflow-y-auto no-scrollbar">
      {ADHKAR.map((a) => (
        <div key={a.id} className={`rounded-2xl p-3 border ${done[a.id] ? 'bg-amber-300/15 border-amber-300/50' : 'bg-white/5 border-white/15'}`}>
          {a.tasbih ? (
            done[a.id] ? <div className="text-center text-amber-200 font-black">✓ {pick(a.note)}</div> : <Tasbih items={a.tasbih} onDone={() => setDone((d) => ({ ...d, [a.id]: true }))} />
          ) : (
            <button className="w-full text-center" onClick={() => {
              const c = (counts[a.id] || 0) + 1
              setCounts((x) => ({ ...x, [a.id]: c })); sfx.pop(); navigator.vibrate?.(8)
              if (c >= a.count) setDone((d) => ({ ...d, [a.id]: true }))
            }}>
              <div className="text-xl font-black leading-loose text-white" style={{ fontFamily: 'Amiri, Cairo, serif' }}>{a.text}</div>
              <div className="text-[11px] text-indigo-200 mt-1">{pick(a.note)}</div>
              <div className="mt-1.5 text-xs font-black text-amber-200">{done[a.id] ? '✓' : a.count > 1 ? `${counts[a.id] || 0}/${a.count} · ${t('tapCount')}` : t('tapCount')}</div>
            </button>
          )}
          {a.tasbih && !done[a.id] && <div className="text-[11px] text-indigo-200 text-center mt-1">{pick(a.note)}</div>}
        </div>
      ))}
    </div>
  )
}

function Breathe({ onDone }) {
  const { t } = useT()
  const [phase, setPhase] = useState('in')
  const [cycle, setCycle] = useState(0)
  useEffect(() => {
    if (cycle >= 3) { onDone(); return }
    const id = setTimeout(() => {
      if (phase === 'in') setPhase('out')
      else { setPhase('in'); setCycle((c) => c + 1) }
    }, 4000)
    return () => clearTimeout(id)
  }, [phase, cycle]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <div className="transition-transform ease-in-out" style={{ transform: `scale(${phase === 'in' ? 1.35 : 0.8})`, transitionDuration: '4000ms' }}>
        <Moon f={1} size={130} />
      </div>
      <div className="text-amber-100 font-black text-lg">{cycle >= 3 ? '🌙' : phase === 'in' ? t('breatheIn') : t('breatheOut')}</div>
      <div className="flex gap-1.5">{[0, 1, 2].map((k) => <span key={k} className={`w-2.5 h-2.5 rounded-full ${k < cycle ? 'bg-amber-300' : 'bg-white/25'}`} />)}</div>
    </div>
  )
}

function Thanks({ onDone }) {
  const { t, lang } = useT()
  const [sel, setSel] = useState([])
  return (
    <div className="space-y-3">
      <p className="text-center font-black text-amber-100">{t('thanksQ')}</p>
      <div className="grid grid-cols-2 gap-2">
        {GRATITUDE.map((g) => {
          const on = sel.includes(g.id)
          return (
            <button key={g.id} onClick={() => { sfx.pop(); setSel(on ? sel.filter((x) => x !== g.id) : [...sel, g.id].slice(-3)) }}
              className={`rounded-2xl px-3 py-2.5 text-start text-sm font-bold flex items-center gap-2 border transition ${on ? 'bg-amber-300 text-indigo-950 border-amber-300' : 'bg-white/5 border-white/15 text-white'}`}>
              <span className="text-xl">{g.emoji}</span>{g[lang]}
            </button>
          )
        })}
      </div>
      <button disabled={!sel.length} onClick={() => onDone(sel)} className="w-full py-3 rounded-2xl bg-amber-300 text-indigo-950 font-black disabled:opacity-40">💛 {t('doneStep')}</button>
    </div>
  )
}

// ---- the journey -----------------------------------------------------------------
export function NightJourney({ child, progress, schoolDays, actions, onClose }) {
  const { t, pick, lang } = useT()
  const steps = tonightSteps(schoolDays)
  const n = nightOf(progress)
  const lit = steps.filter((s) => n.steps[s.id])
  const all = lit.length === steps.length
  const [open, setOpen] = useState(null)
  const [sleep, setSleep] = useState(false)
  useBack(() => (open ? setOpen(null) : onClose()), 3)

  const complete = (id, extra) => {
    actions.nightStep(child.id, id, extra)
    sfx.sparkle()
    setOpen(null)
  }
  const openStep = (s) => {
    sfx.pop()
    setOpen(s)
    say([s.name[lang], pick(s.how)], lang)
  }
  const finish = () => {
    actions.nightFinish(child.id)
    confetti()
    sfx.levelUp()
    setSleep(true)
  }

  // constellation path in the order of the steps
  const pts = steps.map((s) => [s.x, s.y])
  const litIdx = steps.map((s, i) => (n.steps[s.id] ? i : -1)).filter((i) => i >= 0)

  if (sleep || n.done) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 text-center p-8 text-white" style={{ background: 'radial-gradient(circle at 50% 35%,#1e1b4b 0%,#050816 70%)' }} onClick={onClose}>
        <Sky />
        <div className="relative night-float"><Moon f={1} size={170} /></div>
        <h2 className="relative text-2xl font-black text-amber-100">{t('goodnight', { name: child.name })}</h2>
        <p className="relative text-indigo-200">{t('goodnightSub')}</p>
        <p className="relative text-xs text-indigo-300/70 mt-8">👆</p>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col text-white" style={{ background: 'linear-gradient(180deg,#050816 0%,#0b1026 40%,#1e1b4b 100%)' }}>
      <Sky />
      <div className="relative flex items-center justify-between p-4 pt-[max(16px,env(safe-area-inset-top))]">
        <button onClick={onClose} className="px-3 py-1.5 rounded-xl bg-white/10 text-sm font-bold">✕</button>
        <span className="font-black">🌙 {t('nightTitle')}</span>
        <span className="text-xs font-bold text-amber-200" dir="ltr">⏰ {bedtimeFor(child)}</span>
      </div>

      <div className="relative flex flex-col items-center -mt-1">
        <div className="night-float"><Moon f={lit.length / steps.length} size={110} /></div>
        <p className="text-xs text-indigo-200 mt-1">⭐ {lit.length}/{steps.length} {t('starsLit')}</p>
      </div>

      {/* constellation */}
      <div className="relative flex-1 min-h-0 mx-3">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" aria-hidden="true">
          {pts.slice(1).map((p, i) => {
            const on = litIdx.includes(i) && litIdx.includes(i + 1)
            return <line key={i} x1={pts[i][0]} y1={pts[i][1]} x2={p[0]} y2={p[1]} stroke={on ? '#fcd34d' : '#ffffff'} strokeOpacity={on ? 0.9 : 0.12} strokeWidth={on ? 0.8 : 0.4} strokeDasharray={on ? '' : '1.5 1.5'} vectorEffect="non-scaling-stroke" />
          })}
        </svg>
        {steps.map((s) => {
          const on = !!n.steps[s.id]
          return (
            <button key={s.id} onClick={() => !on && openStep(s)} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1" style={{ left: `${s.x}%`, top: `${s.y}%` }} aria-label={s.name[lang]}>
              <span className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all ${on ? 'bg-amber-300 shadow-[0_0_24px_6px_rgba(252,211,77,.55)] scale-105' : 'bg-white/10 border border-white/30 night-pulse'}`}>
                {on ? '⭐' : s.emoji}
              </span>
              <span className={`text-[10px] font-bold whitespace-nowrap ${on ? 'text-amber-200' : 'text-indigo-100'}`}>{s.name[lang]}</span>
            </button>
          )
        })}
      </div>

      <div className="relative p-4 pb-safe">
        {all ? (
          <button onClick={finish} className="w-full py-4 rounded-2xl bg-amber-300 text-indigo-950 font-black text-lg shadow-[0_0_30px_rgba(252,211,77,.5)]">🌙 {t('finish')}</button>
        ) : (
          <p className="text-center text-xs text-indigo-200">{t('nightSub')}</p>
        )}
      </div>

      {/* bottom sheet for a step */}
      {open && (
        <div className="absolute inset-0 z-10 flex items-end bg-black/50" onClick={() => setOpen(null)}>
          <div className="w-full max-w-xl mx-auto rounded-t-[32px] p-5 pb-safe space-y-4 night-sheet" style={{ background: 'linear-gradient(180deg,#1e1b4b,#0b1026)' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <span className="text-4xl">{open.emoji}</span>
              <div>
                <h3 className="font-black text-lg">{open.name[lang]}</h3>
                <p className="text-sm text-indigo-200">{pick(open.how)}</p>
              </div>
            </div>
            {open.kind === 'brush' && <BrushTimer onDone={() => setTimeout(() => complete('brush'), 1200)} />}
            {open.kind === 'adhkar' && <Adhkar onDone={() => setTimeout(() => complete('adhkar'), 600)} />}
            {open.kind === 'breathe' && <Breathe onDone={() => complete('breathe')} />}
            {open.kind === 'thanks' && <Thanks onDone={(sel) => complete('thanks', sel)} />}
            {open.kind === 'tap' && <button onClick={() => complete(open.id)} className="w-full py-4 rounded-2xl bg-amber-300 text-indigo-950 font-black text-lg">{t('doneStep')}</button>}
          </div>
        </div>
      )}
    </div>
  )
}
