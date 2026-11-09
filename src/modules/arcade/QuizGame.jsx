// ✅❌ True or false: 10 quick health statements. After each answer the fact
// behind it is shown (and saved to the fact bank).
import { useEffect, useRef, useState } from 'react'
import { say, sfx } from '../../sfx'
import { useT } from '../../ui'
import { QUIZ, factById } from './facts'
import { Pill, shuffle } from './common'

const PER_Q = 12

export default function QuizGame({ actions, child, onEnd, questions: fixed }) {
  const { t, lang } = useT()
  const [qs] = useState(() => fixed || shuffle(QUIZ).slice(0, 10))
  const [i, setI] = useState(0)
  const [score, setScore] = useState(0)
  const [res, setRes] = useState(null) // { ok, fact }
  const [left, setLeft] = useState(PER_Q)
  const deadline = useRef(Date.now() + PER_Q * 1000)
  const sc = useRef(0)
  const q = qs[i]

  useEffect(() => {
    deadline.current = Date.now() + PER_Q * 1000
    setLeft(PER_Q)
    say(q[lang], lang)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i])
  useEffect(() => {
    if (res) return
    const id = setInterval(() => {
      const l = Math.max(0, (deadline.current - Date.now()) / 1000)
      setLeft(l)
      if (l === 0) answer(null)
    }, 100)
    return () => clearInterval(id)
  })

  const answer = (v) => {
    if (res) return
    const ok = v === q.answer
    const fact = factById[q.fact]
    if (ok) {
      const gain = 15 + Math.round(left)
      sc.current += gain; setScore(sc.current); sfx.sparkle()
    } else sfx.wrong()
    actions.learnFact(child.id, fact.id)
    setTimeout(() => say(fact[lang], lang), 700)
    setRes({ ok, fact, timeout: v === null })
  }
  const next = () => {
    setRes(null)
    if (i + 1 >= qs.length) onEnd(sc.current)
    else setI(i + 1)
  }

  return (
    <div className="space-y-4 anim-pop">
      <div className="flex justify-between items-center">
        <Pill className="bg-purple-50 text-purple-700" >{i + 1}/{qs.length}</Pill>
        <Pill className="bg-blue-50 text-blue-700">{t('gaScore')} {score}</Pill>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden" dir="ltr">
        <div className={`h-full rounded-full ${left < 4 ? 'bg-rose-500' : 'bg-purple-400'}`} style={{ width: `${(left / PER_Q) * 100}%` }} />
      </div>
      <div className="bg-white rounded-3xl border-2 border-purple-200 p-6 min-h-40 flex flex-col items-center justify-center text-center gap-3">
        <span className="text-5xl">{factById[q.fact].emoji}</span>
        <p className="text-xl font-black leading-relaxed">{q[lang]}</p>
        <button onClick={() => say(q[lang], lang)} className="text-xs font-bold text-[var(--text-soft)]">🔊 {t('gaListen')}</button>
      </div>
      {!res ? (
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => answer(true)} className="py-6 rounded-3xl bg-green-100 border-2 border-green-300 font-black text-xl active:scale-95">✅ {t('gaTrue')}</button>
          <button onClick={() => answer(false)} className="py-6 rounded-3xl bg-rose-100 border-2 border-rose-300 font-black text-xl active:scale-95">❌ {t('gaFalse')}</button>
        </div>
      ) : (
        <div className={`rounded-3xl p-4 space-y-2 border-2 anim-pop ${res.ok ? 'bg-green-50 border-green-300' : 'bg-amber-50 border-amber-300'}`}>
          <p className="font-black text-lg">{res.ok ? `🎉 ${t('gaRight')}` : res.timeout ? `⏰ ${t('gaTimeUp')} ${q.answer ? t('gaTrue') : t('gaFalse')}` : `🤔 ${t('gaAnswer')} ${q.answer ? t('gaTrue') : t('gaFalse')}`}</p>
          <p className="font-bold leading-relaxed">💡 {res.fact[lang]}</p>
          <button onClick={next} className="w-full py-3 rounded-2xl bg-[var(--primary)] text-white font-black">{i + 1 >= qs.length ? t('gaFinish') : t('gaNext')}</button>
        </div>
      )}
    </div>
  )
}
