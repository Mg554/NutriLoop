// 🏝️ Streak Island: the child's card (Today tab) and the parents' settings.
import { useMemo, useState } from 'react'
import { todayStr } from '../../store'
import { sfx } from '../../sfx'
import { Card, useT } from '../../ui'
import { GOALS, PRIZE_EMOJI, RULES, defaultIsland, islandState } from './islandLogic'

const DECOR = [
  [0.1, '🌴', 70, 150], [0.25, '🛖', 120, 110], [0.4, '🌺', 190, 165], [0.55, '⛵', 22, 250],
  [0.7, '🏰', 270, 100], [0.85, '🚩', 205, 70], [0.95, '🦜', 95, 80],
]

// stepping stones along a winding path from the beach to the treasure
function pathPoints(n) {
  const pts = []
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 1 : i / (n - 1)
    const x = 60 + t * 230 + Math.sin(t * Math.PI * 3) * 28
    const y = 200 - t * 130 + Math.cos(t * Math.PI * 2.4) * 14
    pts.push([x, y])
  }
  return pts
}

export function IslandSvg({ st, avatar }) {
  const n = st.goal
  const pts = useMemo(() => pathPoints(n), [n])
  const frac = st.steps / n
  const doneSet = st.days
  const r = n > 21 ? 5.5 : n > 14 ? 7 : 9
  const at = st.steps > 0 ? pts[Math.min(st.steps, n) - 1] : [40, 214]
  return (
    <svg viewBox="0 0 360 260" className="w-full h-auto rounded-3xl" role="img" aria-label={`island ${st.steps}/${n}`}>
      <defs>
        <linearGradient id="il-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7dd3fc" /><stop offset="1" stopColor="#0284c7" /></linearGradient>
        <radialGradient id="il-sand" cx=".5" cy=".45" r=".6"><stop offset="0" stopColor="#fde68a" /><stop offset=".8" stopColor="#fbbf24" /><stop offset="1" stopColor="#f59e0b" /></radialGradient>
      </defs>
      <rect width="360" height="260" fill="url(#il-sea)" />
      {[40, 120, 200].map((y, i) => (
        <path key={i} d={`M-20 ${y} q20 -8 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0`} fill="none" stroke="#e0f2fe" strokeOpacity=".5" strokeWidth="2">
          <animateTransform attributeName="transform" type="translate" values="0 0; 40 0; 0 0" dur={`${6 + i * 2}s`} repeatCount="indefinite" />
        </path>
      ))}
      <path d="M30 205 C 10 150, 70 60, 170 45 C 270 30, 345 90, 330 160 C 318 220, 230 245, 150 240 C 80 236, 40 230, 30 205 Z" fill="url(#il-sand)" stroke="#fef3c7" strokeWidth="4" />
      <path d="M90 170 C 120 120, 200 100, 260 120" fill="none" stroke="#86efac" strokeWidth="26" strokeLinecap="round" opacity=".55" />
      {/* path */}
      <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke="#b45309" strokeWidth="2" strokeDasharray="4 5" opacity=".6" />
      {pts.map(([x, y], i) => {
        const d = doneSet[i]
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={r} fill={d ? (d.state === 'grace' ? '#38bdf8' : '#f59e0b') : '#fff7ed'} stroke={d ? '#fff' : '#d6b98c'} strokeWidth="2" />
            {d && <text x={x} y={y + r * 0.45} fontSize={r * 1.2} textAnchor="middle">{d.state === 'grace' ? '🛟' : '✓'}</text>}
          </g>
        )
      })}
      {DECOR.filter(([f]) => frac >= f).map(([, e, x, y]) => <text key={e} x={x} y={y} fontSize="26" textAnchor="middle">{e}</text>)}
      {/* treasure */}
      <text x={pts[n - 1][0] + 16} y={pts[n - 1][1] - 10} fontSize={st.reached ? 40 : 30} textAnchor="middle">{st.reached ? st.cfg.emoji : '🧰'}</text>
      {st.reached && <text x={pts[n - 1][0] + 16} y={pts[n - 1][1] - 46} fontSize="20" textAnchor="middle" className="night-twinkle">✨</text>}
      {/* the child */}
      <g>
        <text x={at[0]} y={at[1] - r - 2} fontSize="28" textAnchor="middle">{avatar}</text>
        <animateTransform attributeName="transform" type="translate" values="0 0; 0 -4; 0 0" dur="1.6s" repeatCount="indefinite" />
      </g>
    </svg>
  )
}

export default function IslandCard({ child, progress }) {
  const { t, lang } = useT()
  const st = islandState(child, progress, todayStr())
  if (!st.on) return null
  const left = st.goal - st.steps
  return (
    <div className="rounded-3xl bg-white border-2 border-sky-200 shadow-sm overflow-hidden">
      <div className="p-3 flex items-center justify-between gap-2">
        <div>
          <h3 className="font-black">🏝️ {t('isTitle')}</h3>
          <p className="text-[11px] text-[var(--text-soft)]">{st.reached ? t('isReached') : t('isLeft', { n: left })}</p>
        </div>
        <span className="text-xs font-black px-2.5 py-1 rounded-full bg-sky-100 text-sky-700" dir="ltr">{st.steps}/{st.goal}</span>
      </div>
      <IslandSvg st={st} avatar={child.avatar} />
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-2 rounded-2xl bg-amber-50 border border-amber-200 p-2">
          <span className="text-3xl">{st.cfg.emoji}</span>
          <div className="flex-1">
            <p className="text-[11px] font-bold text-amber-700">{t('isPrize')}</p>
            <p className="font-black text-sm">{st.cfg.prize || t('isSurprise')}</p>
          </div>
          {st.graceLeft && st.cfg.grace && <span className="text-[10px] font-black px-2 py-1 rounded-full bg-sky-100 text-sky-700">🛟 {t('isRing')}</span>}
        </div>
        {!st.reached && (
          <>
            <p className="text-xs font-black">{st.todayDone ? `🎉 ${t('isTodayDone')}` : t('isToday')}</p>
            <div className="flex flex-wrap gap-1.5">
              {RULES.filter((r) => st.cfg.rules.includes(r.id)).map((r) => (
                <span key={r.id} className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${st.todayChecks[r.id] ? 'bg-green-100 border-green-300 text-green-800' : 'bg-white border-[var(--border)]'}`}>
                  {st.todayChecks[r.id] ? '✅' : r.emoji} {r[lang]}
                </span>
              ))}
            </div>
          </>
        )}
        {st.reached && <p className="text-center font-black text-green-700">🎉 {t('isWon')}</p>}
      </div>
    </div>
  )
}

export function IslandSettings({ state, actions }) {
  const { lang } = useT()
  const A = (a, e) => (lang === 'ar' ? a : e)
  const kids = state.children
  const [id, setId] = useState(kids[0]?.id)
  if (!kids.length) return null
  const child = kids.find((c) => c.id === id) || kids[0]
  const p = state.progress[child.id] || {}
  const cfg = { ...defaultIsland(), ...(p.island || {}) }
  const st = islandState(child, p, todayStr())
  const set = (patch) => actions.setIsland(child.id, patch)
  const toggleRule = (r) => {
    const rules = cfg.rules.includes(r) ? cfg.rules.filter((x) => x !== r) : [...cfg.rules, r]
    if (rules.length) set({ rules, restart: true })
  }
  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-black">🏝️ {A('جزيرة الإنجاز', 'Streak Island')}</h2>
        <button onClick={() => { sfx.pop(); set({ on: !cfg.on }) }} className={`px-3 py-1.5 rounded-full text-xs font-black ${cfg.on ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>{cfg.on ? A('شغّالة', 'On') : A('مطفية', 'Off')}</button>
      </div>
      {kids.length > 1 && (
        <div className="flex gap-1.5">{kids.map((c) => <button key={c.id} onClick={() => setId(c.id)} className={`px-3 py-1.5 rounded-full text-xs font-black border ${c.id === child.id ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'bg-white border-[var(--border)]'}`}>{c.avatar} {c.name}</button>)}</div>
      )}
      <p className="text-[11px] text-[var(--text-soft)]">{A('كل يوم بتكتمل فيه الشروط بيبني خطوة على الجزيرة لحد الكنز. تغيير الهدف أو الشروط بيبلّش الجزيرة من اليوم.', 'Each day that meets the conditions builds one step toward the treasure. Changing the goal or the conditions restarts the island today.')}</p>
      {cfg.on && st.on && (
        <div className="rounded-2xl bg-sky-50 border border-sky-200 p-2 text-sm font-bold flex items-center justify-between">
          <span>{child.avatar} {st.steps}/{st.goal} {A('يوم', 'days')}{st.restarts ? A(` · بلّشت من جديد ${st.restarts} مرة`, ` · restarted ${st.restarts}×`) : ''}</span>
          {st.reached && <button onClick={() => { sfx.fanfare(); actions.claimIsland(child.id) }} className="px-3 py-1.5 rounded-xl bg-green-600 text-white text-xs font-black">🎁 {A('سلّمنا الجائزة', 'Prize given')}</button>}
        </div>
      )}
      <div>
        <p className="text-xs font-black mb-1">{A('الهدف (أيام ورا بعض)', 'Goal (days in a row)')}</p>
        <div className="flex gap-1.5">{GOALS.map((g) => <button key={g} onClick={() => set({ goal: g, restart: true })} className={`flex-1 py-2 rounded-xl text-sm font-black border ${cfg.goal === g ? 'bg-sky-500 text-white border-sky-500' : 'bg-white border-[var(--border)]'}`}>{g}</button>)}</div>
      </div>
      <div>
        <p className="text-xs font-black mb-1">{A('الجائزة', 'Prize')}</p>
        <input value={cfg.prize} onChange={(e) => set({ prize: e.target.value.slice(0, 40) })} placeholder={A('مثلًا: مشوار للمتنزه', 'e.g. a trip to the park')} className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] outline-none focus:border-[var(--primary)]" />
        <div className="flex flex-wrap gap-1 mt-1.5">{PRIZE_EMOJI.map((e) => <button key={e} onClick={() => set({ emoji: e })} className={`w-9 h-9 rounded-xl text-xl ${cfg.emoji === e ? 'bg-amber-200 ring-2 ring-amber-400' : 'bg-[var(--surface-2,#f8f5ef)]'}`}>{e}</button>)}</div>
      </div>
      <div>
        <p className="text-xs font-black mb-1">{A('شروط اليوم الكامل', 'A complete day means')}</p>
        <div className="grid grid-cols-2 gap-1.5">
          {RULES.map((r) => (
            <button key={r.id} onClick={() => toggleRule(r.id)} className={`py-2 px-2 rounded-xl text-xs font-bold border text-start ${cfg.rules.includes(r.id) ? 'bg-green-50 border-green-400' : 'bg-white border-[var(--border)]'}`}>
              {cfg.rules.includes(r.id) ? '☑️' : '⬜'} {r.emoji} {r[lang]}
            </button>
          ))}
        </div>
      </div>
      <button onClick={() => set({ grace: !cfg.grace })} className={`w-full py-2 rounded-xl text-xs font-bold border text-start px-3 ${cfg.grace ? 'bg-sky-50 border-sky-400' : 'bg-white border-[var(--border)]'}`}>
        {cfg.grace ? '☑️' : '⬜'} 🛟 {A('يوم سماح: يوم واحد كل ٧ أيام ممكن يفوت بدون ما تخرب الجزيرة', 'Life ring: one missed day per 7 days does not break the island')}
      </button>
      {(p.islands || []).length > 0 && <p className="text-[11px] text-[var(--text-soft)]">🏆 {A('جزر مكتملة:', 'Islands completed:')} {p.islands.map((x) => x.emoji).join(' ')}</p>}
    </Card>
  )
}
