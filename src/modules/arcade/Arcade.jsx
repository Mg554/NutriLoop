// 🎮 Game arena (the "Challenge" tab): game picker, end-of-round screen with
// best score and cups, the fact bank, and the sibling duel.
import { useState } from 'react'
import { FOODS } from '../../data'
import { TROPHIES, trophyFor } from '../../store'
import { confetti, sfx } from '../../sfx'
import { Card, useT } from '../../ui'
import { useBack } from '../../backStack'
import { FACTS, QUIZ, TOPICS } from './facts'
import { pick, shuffle } from './common'
import SortGame from './SortGame'
import CatchGame from './CatchGame'
import PlateRace from './PlateRace'
import QuizGame from './QuizGame'

const GAMES = [
  { id: 'sort', emoji: '⚡', name: 'gaSort', desc: 'gaSortD', bg: 'from-amber-300 to-orange-400', C: SortGame },
  { id: 'catch', emoji: '🧺', name: 'gaCatch', desc: 'gaCatchD', bg: 'from-sky-300 to-emerald-300', C: CatchGame },
  { id: 'plate', emoji: '🍽️', name: 'gaPlate', desc: 'gaPlateD', bg: 'from-lime-300 to-green-400', C: PlateRace },
  { id: 'quiz', emoji: '✅', name: 'gaQuiz', desc: 'gaQuizD', bg: 'from-violet-300 to-fuchsia-400', C: QuizGame },
]
const CUP = { bronze: '🥉', silver: '🥈', gold: '🥇' }
const CUP_KEY = { bronze: 'gaBronze', silver: 'gaSilver', gold: 'gaGold' }

export default function Arcade({ child, progress, actions, siblings = [] }) {
  const { t, lang } = useT()
  const [view, setView] = useState('hub') // hub | play | over | bank | duel
  const [game, setGame] = useState(null)
  const [run, setRun] = useState(0)
  const [result, setResult] = useState(null)
  useBack(() => setView('hub'), 2, view !== 'hub')
  const arcade = progress.arcade || { best: {}, trophies: {} }
  const runsLeft = Math.max(0, 3 - (progress.day?.gameRuns ?? 0))

  const start = (g) => { sfx.sparkle(); setGame(g); setRun((r) => r + 1); setView('play') }
  const end = (score) => {
    const prevBest = arcade.best[game.id] || 0
    const tier = trophyFor(game.id, score)
    const order = [undefined, 'bronze', 'silver', 'gold']
    const newCup = tier && order.indexOf(tier) > order.indexOf(arcade.trophies[game.id]) ? tier : null
    const xp = runsLeft > 0 && score > 0 ? Math.min(60, Math.round(score / 2)) : 0
    actions.finishGame(child.id, score, game.id)
    if (newCup || score > prevBest) { sfx.fanfare(); confetti() }
    setResult({ score, newBest: prevBest > 0 && score > prevBest, newCup, xp })
    setView('over')
  }

  if (view === 'play' && game) {
    const G = game.C
    return (
      <div className="space-y-3">
        <button onClick={() => setView('hub')} className="text-sm font-bold text-[var(--text-soft)]">✕ {t('gaBack')}</button>
        <G key={run} child={child} actions={actions} onEnd={end} />
      </div>
    )
  }

  if (view === 'over' && result) {
    const next = TROPHIES[game.id]?.find((n) => n > result.score)
    return (
      <div className="flex flex-col items-center text-center gap-3 pt-6 anim-pop">
        <div className="text-7xl anim-bounce">{result.newCup ? CUP[result.newCup] : game.emoji}</div>
        <h2 className="font-black text-2xl">{t('gaOver')}</h2>
        <p className="text-4xl font-black text-[var(--primary)] tabular-nums">{result.score}</p>
        {result.newCup && <p className="font-black text-amber-600">{CUP[result.newCup]} {t(CUP_KEY[result.newCup])}!</p>}
        {result.newBest && <p className="font-black text-green-600">{t('gaNewBest')}</p>}
        {result.xp > 0 && <p className="text-sm font-black bg-[var(--primary-soft)] text-[var(--primary)] px-3 py-1 rounded-full" dir="ltr">+{result.xp} XP</p>}
        <p className="text-xs text-[var(--text-soft)]">🏅 {t('gaBest')}: {Math.max(result.score, arcade.best[game.id] || 0)}{next ? ` · ${t('gaNextCup', { n: next })}` : ''}</p>
        <div className="flex gap-2 mt-2">
          <button onClick={() => start(game)} className="px-8 py-3 rounded-full bg-[var(--primary)] text-white font-black shadow-lg active:scale-95">{t('gaAgain')}</button>
          <button onClick={() => setView('hub')} className="px-5 py-3 rounded-full bg-white border border-[var(--border)] font-bold">{t('gaGames')}</button>
        </div>
      </div>
    )
  }

  if (view === 'bank') return <FactBank known={progress.facts || []} onBack={() => setView('hub')} />
  if (view === 'duel') return <Duel key={run} child={child} siblings={siblings} actions={actions} onBack={() => setView('hub')} onAgain={() => setRun((r) => r + 1)} />

  const known = (progress.facts || []).length
  return (
    <div className="space-y-4 anim-pop">
      <div>
        <h2 className="font-black text-2xl">{t('gaTitle')}</h2>
        <p className="text-sm text-[var(--text-soft)]">{t('gaSub')}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {GAMES.map((g) => (
          <button key={g.id} onClick={() => start(g)} className={`rounded-3xl p-3 text-start bg-gradient-to-br ${g.bg} shadow-md active:scale-95 min-h-36 flex flex-col`}>
            <div className="flex items-start justify-between">
              <span className="text-4xl">{g.emoji}</span>
              {arcade.trophies[g.id] && <span className="text-2xl">{CUP[arcade.trophies[g.id]]}</span>}
            </div>
            <span className="font-black mt-1">{t(g.name)}</span>
            <span className="text-[11px] leading-snug opacity-80 flex-1">{t(g.desc)}</span>
            {arcade.best[g.id] > 0 && <span className="text-[11px] font-black mt-1 bg-white/50 rounded-full px-2 py-0.5 self-start">🏅 {arcade.best[g.id]}</span>}
          </button>
        ))}
      </div>
      <button onClick={() => { setRun((r) => r + 1); setView('duel') }} className="w-full rounded-3xl p-3 bg-gradient-to-r from-rose-300 to-pink-400 shadow-md flex items-center gap-3 text-start active:scale-95">
        <span className="text-4xl">👫</span>
        <span><span className="block font-black">{t('gaDuel')}</span><span className="text-[11px] opacity-80">{t('gaDuelD')}</span></span>
      </button>
      <button onClick={() => setView('bank')} className="w-full rounded-3xl p-3 bg-white border-2 border-amber-200 shadow-sm flex items-center gap-3 text-start active:scale-95">
        <span className="text-4xl">📚</span>
        <span className="flex-1"><span className="block font-black">{t('gaBank')}</span><span className="text-[11px] text-[var(--text-soft)]">{t('gaKnown', { n: known, t: FACTS.length })}</span></span>
        <span className="w-14 h-2 rounded-full bg-amber-100 overflow-hidden" dir="ltr"><span className="block h-full bg-amber-400" style={{ width: `${(known / FACTS.length) * 100}%` }} /></span>
      </button>
      <p className="text-center text-[11px] text-[var(--text-soft)]">{runsLeft > 0 ? t('gaXpLeft', { n: runsLeft.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en') }) : t('gaXpDone')}</p>
    </div>
  )
}

function FactBank({ known, onBack }) {
  const { t, lang } = useT()
  const [open, setOpen] = useState(null)
  return (
    <div className="space-y-4 anim-pop">
      <div className="flex items-center justify-between">
        <h2 className="font-black text-xl">📚 {t('gaBank')}</h2>
        <button onClick={onBack} className="px-3 py-1.5 rounded-xl bg-white border border-[var(--border)] text-sm font-bold">{t('gaBack')}</button>
      </div>
      <p className="text-sm text-[var(--text-soft)]">{t('gaBankD')} · <b>{t('gaKnown', { n: known.length, t: FACTS.length })}</b></p>
      {Object.entries(TOPICS).map(([topic, tp]) => {
        const list = FACTS.filter((f) => f.topic === topic)
        return (
          <div key={topic}>
            <h3 className="font-black text-sm mb-1.5">{tp.emoji} {tp[lang]} <span className="text-[var(--text-soft)] font-bold" dir="ltr">{list.filter((f) => known.includes(f.id)).length}/{list.length}</span></h3>
            <div className="grid grid-cols-4 gap-2">
              {list.map((f) => {
                const has = known.includes(f.id)
                return (
                  <button key={f.id} onClick={() => setOpen(has ? f : 'locked')} className={`aspect-square rounded-2xl text-3xl flex items-center justify-center border-2 ${has ? 'bg-amber-50 border-amber-300' : 'bg-gray-100 border-gray-200 grayscale opacity-60'}`}>
                    {has ? f.emoji : '🔒'}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
      {open && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-end justify-center p-3" onClick={() => setOpen(null)}>
          <Card className="w-full max-w-md space-y-3 anim-pop">
            {open === 'locked' ? <p className="font-bold text-center py-4">🔒 {t('gaLocked')}</p> : (
              <>
                <div className="text-6xl text-center">{open.emoji}</div>
                <p className="font-bold text-lg leading-relaxed text-center">{open[lang]}</p>
              </>
            )}
            <button className="w-full py-3 rounded-2xl bg-[var(--primary)] text-white font-black">{t('gaGotIt')}</button>
          </Card>
        </div>
      )}
    </div>
  )
}

// 👫 Sibling duel: both players get the SAME 10 items (5 sort + 5 true/false
// in two short rounds), taking turns on one phone. Nobody is shamed.
function Duel({ child, siblings, actions, onBack, onAgain }) {
  const { t, L } = useT()
  const [rival, setRival] = useState(null)
  const [phase, setPhase] = useState('pick') // pick | readyA | A | readyB | B | done
  const [set] = useState(() => ({ foods: Array.from({ length: 8 }, () => pick(FOODS)), quiz: shuffle(QUIZ).slice(0, 5) }))
  const [scores, setScores] = useState({ A: 0, B: 0 })
  const [part, setPart] = useState('sort')
  const nameOf = (c) => c.name

  if (!siblings.length)
    return (
      <div className="space-y-4 text-center pt-8">
        <div className="text-6xl">👫</div>
        <p className="font-bold">{t('gaDuelNeed')}</p>
        <button onClick={onBack} className="px-5 py-2.5 rounded-full bg-white border border-[var(--border)] font-bold">{t('gaBack')}</button>
      </div>
    )

  const players = { A: child, B: rival }
  const playing = phase === 'A' || phase === 'B'
  const finishPart = (score) => {
    const who = phase
    if (part === 'sort') { setScores((s) => ({ ...s, [who]: s[who] + score })); setPart('quiz'); return }
    const total = scores[who] + score
    setScores((s) => ({ ...s, [who]: total }))
    actions.finishGame(players[who].id, total, 'duel')
    setPart('sort')
    if (who === 'A') setPhase('readyB')
    else { setPhase('done'); sfx.fanfare(); confetti() }
  }

  if (phase === 'pick')
    return (
      <div className="space-y-4 anim-pop">
        <div className="flex items-center justify-between">
          <h2 className="font-black text-xl">👫 {t('gaDuel')}</h2>
          <button onClick={onBack} className="px-3 py-1.5 rounded-xl bg-white border border-[var(--border)] text-sm font-bold">{t('gaBack')}</button>
        </div>
        <p className="font-bold">{t('gaDuelPick')}</p>
        <div className="grid grid-cols-3 gap-3">
          {siblings.map((c) => (
            <button key={c.id} onClick={() => { setRival(c); setPhase('readyA') }} className="bg-white rounded-3xl border-2 border-[var(--border)] p-3 flex flex-col items-center active:scale-95">
              <span className="text-4xl">{c.avatar}</span><span className="font-black text-sm">{c.name}</span>
            </button>
          ))}
        </div>
      </div>
    )

  if (phase === 'readyA' || phase === 'readyB') {
    const p = players[phase === 'readyA' ? 'A' : 'B']
    return (
      <div className="flex flex-col items-center text-center gap-4 pt-10 anim-pop">
        {phase === 'readyB' && <p className="font-black text-[var(--primary)]">{t('gaPass', { name: nameOf(p) })}</p>}
        <span className="text-7xl anim-bounce">{p.avatar}</span>
        <h2 className="font-black text-2xl">{t('gaTurn', { name: nameOf(p) })}</h2>
        <button onClick={() => { sfx.sparkle(); setPhase(phase === 'readyA' ? 'A' : 'B') }} className="px-10 py-3.5 rounded-full bg-[var(--primary)] text-white font-black text-lg shadow-lg active:scale-95">{t('gaTurnGo')}</button>
      </div>
    )
  }

  if (playing)
    return (
      <div className="space-y-2">
        <p className="text-center font-black">{players[phase].avatar} {nameOf(players[phase])} · {part === 'sort' ? '⚡' : '✅'}</p>
        {part === 'sort'
          ? <SortGame key={phase + part} child={players[phase]} actions={actions} items={set.foods} duel onEnd={finishPart} />
          : <QuizGame key={phase + part} child={players[phase]} actions={actions} questions={set.quiz} onEnd={finishPart} />}
      </div>
    )

  const { A, B } = scores
  const tie = A === B
  const winner = A > B ? players.A : players.B
  return (
    <div className="flex flex-col items-center text-center gap-4 pt-6 anim-pop">
      <div className="text-6xl">{tie ? '🤝' : '🏆'}</div>
      <h2 className="font-black text-2xl">{tie ? t('gaTie') : L[winner.gender === 'f' ? 'gaWinsF' : 'gaWins'].replace('{name}', winner.name)}</h2>
      <div className="grid grid-cols-2 gap-3 w-full">
        {['A', 'B'].map((k) => (
          <Card key={k} className="flex flex-col items-center gap-1">
            <span className="text-2xl">{tie ? '🥇' : scores[k] === Math.max(A, B) ? '🥇' : '🥈'}</span>
            <span className="text-4xl">{players[k].avatar}</span>
            <span className="font-black">{players[k].name}</span>
            <span className="text-2xl font-black text-[var(--primary)] tabular-nums">{scores[k]}</span>
          </Card>
        ))}
      </div>
      <p className="font-black text-lg">{t('gaHeroes')}</p>
      <div className="flex gap-2">
        <button onClick={onAgain} className="px-6 py-3 rounded-full bg-[var(--primary)] text-white font-black">{t('gaAgain')}</button>
        <button onClick={onBack} className="px-5 py-3 rounded-full bg-white border border-[var(--border)] font-bold">{t('gaGames')}</button>
      </div>
    </div>
  )
}
