// 🧺 Catch: foods fall from the sky; drag the basket to catch the everyday
// foods and dodge the "sometimes" foods (party treats). 3 hearts, 60 s,
// gets faster. The first treat caught opens a fact card about sugar.
import { useEffect, useRef, useState } from 'react'
import { FOODS } from '../../data'
import { sfx } from '../../sfx'
import { useT } from '../../ui'
import { SOMETIMES, factById } from './facts'
import { Hearts, LearnCard, Pill, pick } from './common'

const DURATION = 60

export default function CatchGame({ actions, child, onEnd }) {
  const { t, lang } = useT()
  const area = useRef(null)
  const g = useRef({ items: [], basket: 50, score: 0, hearts: 3, combo: 0, nextId: 1, lastSpawn: 0, start: 0, paused: 0, over: false, taughtTreat: false, pops: [] })
  const [, setFrame] = useState(0)
  const [learn, setLearn] = useState(null)

  useEffect(() => {
    const s = g.current
    s.start = performance.now()
    let raf, last = s.start
    const tick = (now) => {
      const dt = Math.min(50, now - last) / 1000
      last = now
      if (!s.over && !s.paused) {
        const el = (now - s.start) / 1000
        const speed = 28 + el * 0.9 // % of height per second
        const every = Math.max(420, 950 - el * 9)
        if (now - s.lastSpawn > every) {
          s.lastSpawn = now
          const treat = Math.random() < 0.35
          const f = treat ? pick(SOMETIMES) : pick(FOODS)
          s.items.push({ id: s.nextId++, x: 8 + Math.random() * 84, y: -8, treat, emoji: f.emoji, wobble: Math.random() * 6 })
        }
        for (const it of s.items) it.y += speed * dt
        // catch zone: bottom band, close to the basket
        for (const it of s.items) {
          if (!it.done && it.y >= 80 && it.y <= 92 && Math.abs(it.x - s.basket) < 11) {
            it.done = true
            if (it.treat) {
              s.hearts -= 1; s.combo = 0; sfx.wrong(); navigator.vibrate?.(60)
              s.pops.push({ id: it.id, x: it.x, txt: '💔', at: now })
              if (!s.taughtTreat) {
                s.taughtTreat = true; s.paused = now
                const fact = factById[it.emoji === '🥤' ? 'soda' : 'sugar-bugs']
                actions.learnFact(child.id, fact.id)
                setLearn({ title: `${it.emoji} ${t('gaSometimes')}`, fact })
              }
            } else {
              s.combo += 1
              const gain = 10 + Math.min(s.combo, 10)
              s.score += gain; sfx.pop()
              s.pops.push({ id: it.id, x: it.x, txt: `+${gain}`, at: now })
            }
          }
        }
        s.items = s.items.filter((it) => !it.done && it.y < 105)
        s.pops = s.pops.filter((p) => now - p.at < 600)
        if (s.hearts <= 0 || el >= DURATION) {
          s.over = true
          setTimeout(() => onEnd(s.score), 500)
        }
      }
      setFrame((n) => n + 1)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const move = (e) => {
    const r = area.current?.getBoundingClientRect()
    if (!r) return
    const x = ((e.clientX - r.left) / r.width) * 100
    g.current.basket = Math.max(8, Math.min(92, x))
  }
  const s = g.current
  const left = Math.max(0, Math.ceil(DURATION - ((s.paused ? s.paused : performance.now()) - s.start) / 1000))

  return (
    <div className="space-y-3 anim-pop">
      <div className="flex justify-between items-center">
        <Hearts n={Math.max(0, s.hearts)} />
        <Pill className="bg-orange-50 text-orange-600">⏱️ {left}s</Pill>
        <Pill className="bg-blue-50 text-blue-700">{t('gaScore')} {s.score}</Pill>
      </div>
      <div ref={area} onPointerDown={move} onPointerMove={move} dir="ltr"
        className="relative h-[58vh] rounded-3xl overflow-hidden touch-none select-none border-2 border-sky-200"
        style={{ background: 'linear-gradient(180deg,#e0f2fe 0%,#f0fdf4 80%,#bbf7d0 100%)' }}>
        {s.items.map((it) => (
          <span key={it.id} className="absolute text-4xl -translate-x-1/2 pointer-events-none" style={{ left: `${it.x}%`, top: `${it.y}%`, transform: `translate(-50%,0) rotate(${Math.sin(it.y / 6 + it.wobble) * 12}deg)` }}>{it.emoji}</span>
        ))}
        {s.pops.map((p) => (
          <span key={'p' + p.id} className="absolute font-black text-green-600 -translate-x-1/2 anim-pop pointer-events-none" style={{ left: `${p.x}%`, top: '72%' }}>{p.txt}</span>
        ))}
        <div className="absolute bottom-2 -translate-x-1/2 text-6xl pointer-events-none transition-[left] duration-75" style={{ left: `${s.basket}%` }}>🧺</div>
      </div>
      <p className="text-center text-xs text-[var(--text-soft)]">{t('gaCatchHow')}</p>
      {learn && <LearnCard title={learn.title} fact={learn.fact} onNext={() => { const d = performance.now() - s.paused; s.start += d; s.lastSpawn += d; s.paused = 0; setLearn(null) }} />}
    </div>
  )
}
