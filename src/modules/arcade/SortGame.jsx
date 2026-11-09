// ⚡ Speed sort: put each food in its plate section.
// 3 hearts, faster every 5 right answers, power-ups, and a fact card after a
// mistake so the child learns WHY.
import { useEffect, useRef, useState } from 'react'
import { FOODS } from '../../data'
import { sectionOf } from '../../store'
import { say, sfx } from '../../sfx'
import { Card, useT } from '../../ui'
import { factForFood } from './facts'
import { Hearts, LearnCard, Pill, SEC, pick } from './common'

const POWERS = [
  { id: 'freeze', emoji: '❄️', ar: 'تجميد الوقت', en: 'Freeze time' },
  { id: 'double', emoji: '✖️2', ar: 'نقاط دبل', en: 'Double points' },
  { id: 'heart', emoji: '❤️', ar: 'قلب زيادة', en: 'Extra heart' },
]

export default function SortGame({ actions, child, onEnd, items: fixed, duel }) {
  const { t, lang } = useT()
  const [food, setFood] = useState(null)
  const [hearts, setHearts] = useState(duel ? 99 : 3)
  const [score, setScore] = useState(0)
  const [right, setRight] = useState(0)
  const [combo, setCombo] = useState(0)
  const [flash, setFlash] = useState(null)
  const [learn, setLearn] = useState(null)
  const [power, setPower] = useState(null) // offered power-up
  const [active, setActive] = useState({}) // { freeze: until, double: until }
  const [itemLeft, setItemLeft] = useState(1)
  const st = useRef({ deadline: 0, paused: false, idx: 0, score: 0, over: false })
  const level = 1 + Math.floor(right / 5)
  const itemSec = duel ? 5 : Math.max(2.2, 6 - (level - 1) * 0.6)

  const next = (prev) => {
    let f
    if (fixed) f = fixed[st.current.idx++]
    else do f = pick(FOODS); while (prev && f.id === prev.id)
    if (!f) { finish(); return }
    setFood(f)
    st.current.deadline = Date.now() + itemSec * 1000
    say(f.name[lang], lang)
  }
  const hRef = useRef(duel ? 99 : 3)
  const finish = () => {
    if (st.current.over) return
    st.current.over = true
    setTimeout(() => onEnd(st.current.score), 500)
  }
  // returns true when that was the last heart
  const loseHeart = () => {
    if (duel) return false
    hRef.current -= 1
    setHearts(hRef.current)
    return hRef.current <= 0
  }

  useEffect(() => { next() /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [])

  // per-item countdown (paused while the learn card is open or time is frozen)
  useEffect(() => {
    const id = setInterval(() => {
      const s = st.current
      if (s.over || s.paused) { s.deadline += 100; return }
      if (active.freeze > Date.now()) { s.deadline += 100; setItemLeft((x) => x); return }
      const left = (s.deadline - Date.now()) / (itemSec * 1000)
      setItemLeft(Math.max(0, left))
      if (left <= 0) {
        sfx.wrong(); setCombo(0); setFlash('bad'); setTimeout(() => setFlash(null), 300)
        s.deadline = Date.now() + itemSec * 1000
        if (loseHeart()) finish()
        else next(food)
      }
    }, 100)
    return () => clearInterval(id)
  })

  const answer = (sec) => {
    if (!food || learn || st.current.over) return
    if (sectionOf(food) === sec) {
      const mult = active.double > Date.now() ? 2 : 1
      const gain = (10 + Math.min(combo, 5) * 2 + (duel ? Math.round(itemLeft * 5) : 0)) * mult
      st.current.score += gain
      setScore(st.current.score); setRight((r) => r + 1); setCombo((c) => c + 1)
      setFlash('ok'); sfx.pop(); setTimeout(() => setFlash(null), 250)
      if (!duel && !power && Math.random() < 0.16) {
        const p = pick(POWERS)
        setPower(p); setTimeout(() => setPower((x) => (x === p ? null : x)), 3500)
      }
      if ((right + 1) % 5 === 0 && !duel) sfx.sparkle()
      next(food)
    } else {
      sfx.wrong(); setCombo(0); setFlash('bad'); setTimeout(() => setFlash(null), 300)
      if (duel) return next(food)
      loseHeart()
      const fact = factForFood(food)
      actions.learnFact(child.id, fact.id)
      st.current.paused = true
      const s = SEC[sectionOf(food)]
      setLearn({ title: `${food.emoji} ${food.name[lang]} ${t('gaBelongsTo')} ${s.emoji} ${s[lang]}`, fact })
    }
  }
  const usePower = () => {
    if (!power) return
    sfx.sparkle()
    if (power.id === 'heart') { hRef.current = Math.min(5, hRef.current + 1); setHearts(hRef.current) }
    else setActive((a) => ({ ...a, [power.id]: Date.now() + (power.id === 'freeze' ? 5000 : 10000) }))
    setPower(null)
  }
  const frozen = active.freeze > Date.now()
  const doubled = active.double > Date.now()

  return (
    <div className="space-y-4 anim-pop">
      <div className="flex justify-between items-center gap-1 flex-wrap">
        {!duel && <Hearts n={hearts} />}
        {!duel && <Pill className="bg-purple-50 text-purple-700">Lv {level}</Pill>}
        {combo > 1 && <Pill className="bg-orange-50 text-orange-600">🔥 ×{combo}</Pill>}
        <Pill className="bg-blue-50 text-blue-700">{t('gaScore')} {score}</Pill>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden" dir="ltr">
        <div className={`h-full rounded-full transition-[width] duration-100 ${frozen ? 'bg-sky-400' : itemLeft < 0.3 ? 'bg-rose-500' : 'bg-amber-400'}`} style={{ width: `${itemLeft * 100}%` }} />
      </div>
      <div className="h-10 flex justify-center gap-2">
        {power && (
          <button onClick={usePower} className="px-4 rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white font-black text-sm shadow-lg anim-bounce">
            {power.emoji} {power[lang]}!
          </button>
        )}
        {frozen && <Pill className="bg-sky-100 text-sky-700 self-center">❄️ {t('gaFrozen')}</Pill>}
        {doubled && <Pill className="bg-fuchsia-100 text-fuchsia-700 self-center">✖️2</Pill>}
      </div>
      {food && (
        <Card className={`flex flex-col items-center py-7 ${flash === 'bad' ? 'anim-shake border-red-300' : flash === 'ok' ? 'border-green-300' : ''}`}>
          <div key={food.id + st.current.idx} className="text-8xl anim-pop">{food.emoji}</div>
          <div className="text-xl font-black mt-2">{food.name[lang]}</div>
        </Card>
      )}
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(SEC).map(([sec, s]) => (
          <button key={sec} onClick={() => answer(sec)} className={`py-5 rounded-3xl font-black text-sm shadow-md active:scale-95 border-2 ${s.cls}`}>
            <div className="text-3xl">{s.emoji}</div>
            {s[lang]}
          </button>
        ))}
      </div>
      {learn && <LearnCard title={learn.title} fact={learn.fact} onNext={() => { setLearn(null); st.current.paused = false; if (hRef.current <= 0) finish(); else next(food) }} />}
    </div>
  )
}
