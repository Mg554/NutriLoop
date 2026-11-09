// 🍽️ Plate race: build balanced plates against the clock. Each round asks for
// a mix of sections; tap foods to fill it. Faster plates score more.
import { useEffect, useRef, useState } from 'react'
import { FOODS } from '../../data'
import { sectionOf } from '../../store'
import { sfx } from '../../sfx'
import { useT } from '../../ui'
import { Pill, SEC, pick, shuffle } from './common'

const DURATION = 60
const bySec = (sec) => FOODS.filter((f) => sectionOf(f) === sec)

function newRound() {
  const need = { veg: 1 + (Math.random() < 0.5 ? 1 : 0), grain: 1, protein: 1, dairy: Math.random() < 0.6 ? 1 : 0 }
  const must = Object.entries(need).flatMap(([sec, n]) => Array.from({ length: n }, () => pick(bySec(sec))))
  const extra = Array.from({ length: 9 - must.length }, () => pick(FOODS))
  const seen = new Set()
  const grid = shuffle([...must, ...extra]).map((f) => { let id = f.id; while (seen.has(id)) id += '+'; seen.add(id); return { ...f, key: id } })
  return { need, have: { veg: 0, grain: 0, protein: 0, dairy: 0 }, grid, used: [], started: Date.now() }
}

export default function PlateRace({ onEnd }) {
  const { t, lang } = useT()
  const [r, setR] = useState(newRound)
  const [score, setScore] = useState(0)
  const [plates, setPlates] = useState(0)
  const [left, setLeft] = useState(DURATION)
  const [shake, setShake] = useState(null)
  const [msg, setMsg] = useState('')
  const end = useRef(Date.now() + DURATION * 1000)
  const sc = useRef(0)

  useEffect(() => {
    const id = setInterval(() => {
      const l = Math.max(0, Math.ceil((end.current - Date.now()) / 1000))
      setLeft(l)
      if (l === 0) { clearInterval(id); onEnd(sc.current) }
    }, 250)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const tap = (f) => {
    if (r.used.includes(f.key) || left === 0) return
    const sec = sectionOf(f)
    if (r.have[sec] >= r.need[sec]) {
      sfx.wrong(); setShake(f.key); setTimeout(() => setShake(null), 350)
      setMsg(`${SEC[sec].emoji} ${t('gaPlateNoMore')}`)
      return
    }
    sfx.pop(); setMsg('')
    const have = { ...r.have, [sec]: r.have[sec] + 1 }
    const done = Object.keys(r.need).every((k) => have[k] >= r.need[k])
    if (done) {
      const secs = (Date.now() - r.started) / 1000
      const gain = 20 + (secs < 6 ? 10 : secs < 10 ? 5 : 0)
      sc.current += gain; setScore(sc.current); setPlates((p) => p + 1)
      sfx.sparkle(); setMsg(`✅ +${gain}`)
      setR(newRound())
    } else setR({ ...r, have, used: [...r.used, f.key] })
  }

  return (
    <div className="space-y-3 anim-pop">
      <div className="flex justify-between items-center">
        <Pill className="bg-orange-50 text-orange-600">⏱️ {left}s</Pill>
        <Pill className="bg-green-50 text-green-700">🍽️ {plates}</Pill>
        <Pill className="bg-blue-50 text-blue-700">{t('gaScore')} {score}</Pill>
      </div>
      <div className="bg-white rounded-3xl border border-[var(--border)] p-3">
        <p className="text-xs font-bold text-[var(--text-soft)] mb-2">{t('gaPlateNeeds')}</p>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(r.need).map(([sec, n]) => (
            <div key={sec} className={`rounded-2xl border-2 p-2 text-center ${n === 0 ? 'opacity-30' : r.have[sec] >= n ? 'bg-green-100 border-green-400' : SEC[sec].cls}`}>
              <div className="text-2xl">{SEC[sec].emoji}</div>
              <div className="text-[11px] font-black" dir="ltr">{r.have[sec]}/{n}</div>
            </div>
          ))}
        </div>
      </div>
      <p className="h-5 text-center text-sm font-black text-[var(--primary)]">{msg}</p>
      <div className="grid grid-cols-3 gap-2">
        {r.grid.map((f) => {
          const used = r.used.includes(f.key)
          return (
            <button key={f.key} onClick={() => tap(f)} disabled={used}
              className={`rounded-2xl bg-white border-2 border-[var(--border)] py-3 flex flex-col items-center active:scale-95 transition ${used ? 'opacity-20' : ''} ${shake === f.key ? 'anim-shake border-red-300' : ''}`}>
              <span className="text-4xl">{f.emoji}</span>
              <span className="text-[11px] font-bold">{f.name[lang]}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
