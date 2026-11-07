// Movement tab + full-screen exercise runner.
import { useEffect, useRef, useState } from 'react'
import { EXERCISES, ROUTINES, OUTDOOR_MIN, exerciseSeconds, moveGoalForAge } from './data'
import { say, sfx, confetti, stopSpeech } from '../../sfx'
import { Card, useT } from '../../ui'
import { CAM_EXERCISES, CameraCoach, camTarget } from './Camera'
import Kid, { kidProps } from './Kid'
import { ANIMALS } from './data'
import { useBack } from '../../backStack'

const EX_XP_CAP = 6 // routines/exercises that give XP per day

// ---------------------------------------------------------------------------
export default function MoveTab({ child, progress, actions, settings }) {
  const { t, pick, lang } = useT()
  const [run, setRun] = useState(null) // routine object being played
  const [cam, setCam] = useState(null)
  // warm up the pose model in the background so the coach opens fast
  useEffect(() => {
    if (!settings?.camera) return
    const id = setTimeout(() => import('./poseLoader').then((m) => m.loadPose()).catch(() => {}), 1500)
    return () => clearTimeout(id)
  }, [settings?.camera])
  const day = progress.day
  if (!day) return null
  const goal = child.moveGoal || moveGoalForAge(child.age)
  const mins = Math.floor((day.moveSec || 0) / 60)
  const pct = Math.min(100, Math.round((mins / goal) * 100))
  const xpLeft = (day.exXp || 0) < EX_XP_CAP
  const singles = Object.keys(EXERCISES).filter((id) => !ROUTINES.find((r) => r.id === 'animals').steps.includes(id))

  return (
    <div className="space-y-4 anim-pop">
      {/* movement battery */}
      <div className="bg-gradient-to-br from-orange-400 to-pink-500 rounded-3xl p-4 text-white shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">⚡</span>
            <div>
              <h3 className="font-black text-sm">{t('moveBattery')}</h3>
              <p className="text-[11px] opacity-90">{mins} / {goal} {t('minutes')}</p>
            </div>
          </div>
          <span className="text-sm font-black px-2.5 py-1 rounded-full bg-white/20">{pct}%</span>
        </div>
        <div className="w-full h-3 bg-white/30 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] opacity-90">{t('outdoorSub')}</span>
          <button
            onClick={() => actions.logOutdoor(child.id)}
            disabled={(day.outdoor || 0) >= 2}
            className="px-3 py-1.5 rounded-xl bg-white text-orange-600 text-xs font-black shadow active:scale-90 disabled:opacity-40"
          >
            {t('outdoor')}
          </button>
        </div>
      </div>

      <p className="text-[12px] text-center font-bold text-[var(--text-soft)] px-4 leading-relaxed">{t('hadith')}</p>

      {/* camera smart coach */}
      <div className="bg-gradient-to-br from-slate-800 to-indigo-900 rounded-3xl p-4 text-white shadow-lg space-y-3">
        <div>
          <h3 className="font-black">{t('camTitle')}</h3>
          <p className="text-[11px] opacity-80">{settings?.camera ? t('camSub') : t('camLocked')}</p>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {CAM_EXERCISES.map((c) => {
            const ex = EXERCISES[c.ex]
            return (
              <button
                key={c.id}
                disabled={!settings?.camera}
                onClick={() => { sfx.pop(); setCam(c) }}
                className="rounded-2xl bg-white/10 p-2 flex flex-col items-center gap-0.5 active:scale-95 disabled:opacity-40"
              >
                <Kid ex={c.ex} {...kidProps(child)} size={52} playing={false} />
                <span className="text-[10px] font-bold leading-tight text-center">{ex.name[lang]}</span>
                <span className="text-[10px] font-black text-green-300" dir="ltr">×{camTarget(c, child.age)}</span>
              </button>
            )
          })}
        </div>
        <p className="text-[10px] opacity-70">🔒 {t('camPrivacy')}</p>
      </div>

      {/* routines */}
      <h2 className="font-black text-lg">{t('routines')}</h2>
      <div className="grid grid-cols-2 gap-3">
        {ROUTINES.map((r) => {
          const n = progress.routines?.[r.id] || 0
          return (
            <button
              key={r.id}
              onClick={() => { sfx.pop(); setRun(r) }}
              className={`text-start rounded-3xl p-4 text-white shadow-md bg-gradient-to-br ${r.color} active:scale-95 transition-transform flex flex-col gap-1 min-h-[140px]`}
            >
              <span className="text-4xl">{r.emoji}</span>
              <span className="font-black text-sm leading-tight">{pick(r.title)}</span>
              <span className="text-[11px] opacity-90 leading-tight">{pick(r.sub)}</span>
              <span className="mt-auto flex justify-between text-[11px] font-black">
                <span className="bg-white/25 px-2 rounded-full">+{r.xp} XP</span>
                {n > 0 && <span>✅ ×{n}</span>}
              </span>
            </button>
          )
        })}
      </div>
      {!xpLeft && <p className="text-xs text-center text-[var(--text-soft)]">{t('xpCap')}</p>}

      {/* single exercises */}
      <h2 className="font-black text-lg">{t('single')}</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {singles.map((id) => {
          const ex = EXERCISES[id]
          return (
            <button
              key={id}
              onClick={() => { sfx.pop(); setRun({ id: 'single', xp: 5, rest: 0, steps: [id], title: ex.name, emoji: ex.emoji }) }}
              className="bg-white border border-[var(--border)] rounded-2xl p-2 flex flex-col items-center gap-0.5 shadow-sm active:scale-90"
            >
              <Kid ex={id} {...kidProps(child)} size={64} playing={false} />
              <span className="text-[11px] font-bold text-gray-700 text-center leading-tight">{ex.name[lang]}</span>
            </button>
          )
        })}
      </div>

      {cam && (
        <CameraCoach
          cam={cam}
          age={child.age}
          child={child}
          onClose={() => setCam(null)}
          onFinish={(seconds, complete) => actions.completeExercise(child.id, { seconds, routineId: complete ? 'cam' : null, xp: complete ? 30 : 0 })}
        />
      )}
      {run && (
        <Runner
          routine={run}
          age={child.age}
          child={child}
          onClose={() => setRun(null)}
          onFinish={(seconds, complete) => actions.completeExercise(child.id, { seconds, routineId: complete ? run.id : null, xp: complete ? run.xp : 0 })}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
function shuffle(a) {
  const b = [...a]
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[b[i], b[j]] = [b[j], b[i]]
  }
  return b
}


function Runner({ routine, age, child, onClose, onFinish }) {
  const { t, pick, lang } = useT()
  const [steps] = useState(() => (routine.random ? shuffle(routine.steps).slice(0, routine.random) : routine.steps))
  const [idx, setIdx] = useState(0)
  const [phase, setPhase] = useState('ready') // ready | count | work | rest | done
  const [left, setLeft] = useState(0)
  const [total, setTotal] = useState(1)
  const [paused, setPaused] = useState(false)
  const endAt = useRef(0)
  const pausedLeft = useRef(0)
  const worked = useRef(0) // seconds actually exercised
  const lastSec = useRef(-1)
  const finished = useRef(false)
  useBack(() => quitRef.current(), 3)
  const quitRef = useRef(() => {})

  const ex = EXERCISES[steps[idx]]
  const nextEx = EXERCISES[steps[idx + 1]]
  const secFor = (e) => exerciseSeconds(e, age)

  // keep the screen awake during the workout
  useEffect(() => {
    let lock = null
    navigator.wakeLock?.request('screen').then((l) => (lock = l)).catch(() => {})
    return () => { lock?.release?.().catch(() => {}) }
  }, [])

  const begin = (ph, secs) => {
    setPhase(ph)
    setTotal(secs)
    setLeft(secs)
    lastSec.current = secs
    endAt.current = Date.now() + secs * 1000
  }

  const startWork = (i) => {
    const e = EXERCISES[steps[i]]
    sfx.sparkle()
    say([e.name[lang], pick(e.how)], lang)
    begin('work', secFor(e))
  }

  const finish = (complete) => {
    if (finished.current) return
    finished.current = true
    const secs = Math.round(worked.current)
    if (complete) { sfx.fanfare(); confetti(); say(t('done'), lang) }
    if (complete || secs >= 30) onFinish(secs, complete)
  }

  const advance = () => {
    if (phase === 'count') return startWork(idx)
    if (phase === 'work') {
      if (idx + 1 >= steps.length) { setPhase('done'); finish(true); return }
      if (routine.rest) {
        if (routine.freeze) { sfx.alarm(); say(t('freeze'), lang) } else sfx.whoosh()
        return begin('rest', routine.rest)
      }
      setIdx(idx + 1)
      return startWork(idx + 1)
    }
    if (phase === 'rest') {
      setIdx(idx + 1)
      startWork(idx + 1)
    }
  }

  // ticking (timestamp-based so it stays accurate if the tab lags)
  useEffect(() => {
    if (!['count', 'work', 'rest'].includes(phase) || paused) return
    const id = setInterval(() => {
      const ms = endAt.current - Date.now()
      const s = Math.max(0, Math.ceil(ms / 1000))
      if (s !== lastSec.current) {
        if (phase === 'work') worked.current += lastSec.current - s
        lastSec.current = s
        setLeft(s)
        if (phase === 'count' && s > 0) { sfx.pop(); say(String(s), lang) }
        if (phase === 'work' && s > 0 && s <= 3) sfx.pop()
        if (phase === 'work' && total >= 20 && s === Math.floor(total / 2)) say(t('half'), lang)
      }
      if (ms <= 0) advance()
    }, 100)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, paused, idx, total])

  const togglePause = () => {
    if (paused) {
      endAt.current = Date.now() + pausedLeft.current
      setPaused(false)
    } else {
      pausedLeft.current = Math.max(0, endAt.current - Date.now())
      setPaused(true)
      stopSpeech()
    }
  }
  const skip = () => {
    if (paused) setPaused(false)
    endAt.current = Date.now()
    advance()
  }
  const quit = (quitRef.current = () => {
    // close no matter what happens while saving / stopping speech
    try { if (phase !== 'done') finish(false) } catch { /* ignore */ }
    stopSpeech()
    onClose()
  })


  const shown = phase === 'rest' ? nextEx : ex
  const shownId = phase === 'rest' ? steps[idx + 1] : steps[idx]
  const progressPct = total ? left / total : 0
  const ringColor = phase === 'rest' ? (routine.freeze ? '#38bdf8' : '#a3a3a3') : '#ff6b4a'

  return (
    <div className="fixed inset-0 z-50 bg-[var(--bg)] flex flex-col max-w-xl mx-auto">
      {/* top bar */}
      <div className="flex items-center justify-between p-4">
        <button onClick={quit} className="px-3 py-1.5 rounded-xl bg-white border border-[var(--border)] text-sm font-bold">✕ {t('quit')}</button>
        <span className="font-black text-sm">{routine.emoji} {pick(routine.title)}</span>
        <span className="text-xs font-bold text-[var(--text-soft)]">{Math.min(idx + 1, steps.length)}/{steps.length}</span>
      </div>
      {/* step dots */}
      <div className="flex gap-1.5 px-6">
        {steps.map((s, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full ${i < idx || phase === 'done' ? 'bg-[var(--primary)]' : i === idx ? 'bg-[var(--primary)]/50' : 'bg-gray-200'}`} />
        ))}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
        {phase === 'ready' && (
          <>
            <div className="text-8xl anim-bounce">{routine.emoji}</div>
            <h2 className="font-black text-2xl">{pick(routine.title)}</h2>
            <div className="flex flex-wrap justify-center gap-1">{steps.map((s, i) => <Kid key={i} ex={s} {...kidProps(child)} size={44} playing={false} />)}</div>
            <p className="text-sm text-[var(--text-soft)]">{t('ready')}</p>
            <button onClick={() => { sfx.pop(); begin('count', 3); say('3', lang) }} className="mt-2 px-12 py-4 rounded-full bg-[var(--primary)] text-white font-black text-xl shadow-lg active:scale-95">
              {t('exStart')} ▶
            </button>
          </>
        )}

        {phase === 'count' && <div key={left} className="text-[120px] font-black text-[var(--primary)] anim-pop leading-none">{left || t('go')}</div>}

        {(phase === 'work' || phase === 'rest') && shown && (
          <>
            {phase === 'rest' && (
              <div className={`font-black text-2xl ${routine.freeze ? 'text-sky-500' : 'text-gray-500'}`}>
                {routine.freeze ? t('freeze') : t('rest')}
              </div>
            )}
            <div className="relative">
              <div className={`w-[230px] max-w-[70vw] rounded-[36px] bg-white border border-[var(--border)] shadow-sm flex justify-center pt-1 ${routine.freeze && phase === 'rest' ? 'grayscale opacity-70' : ''}`}>
                <Kid ex={shownId} {...kidProps(child)} size={200} playing={phase === 'work' && !paused} />
              </div>
              {ANIMALS.includes(shownId) && <span className="absolute -top-4 -end-4 text-6xl drop-shadow">{shown.emoji}</span>}
            </div>
            <div className="flex items-center gap-3 w-[230px] max-w-[70vw]" dir="ltr">
              <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${progressPct * 100}%`, background: ringColor, transition: 'width .25s linear' }} />
              </div>
              <span className="text-3xl font-black tabular-nums w-12 text-end">{left}</span>
            </div>
            <div>
              {phase === 'rest' && <span className="text-xs font-bold text-[var(--text-soft)]">{t('next')} </span>}
              <h3 className="font-black text-2xl">{shown.name[lang]}</h3>
              <p className="text-base font-bold text-[var(--text-soft)] max-w-xs mt-1">{pick(shown.how)}</p>
            </div>
          </>
        )}

        {phase === 'done' && (
          <>
            <div className="text-8xl anim-bounce">🏆</div>
            <h2 className="font-black text-2xl">{t('done')}</h2>
            <p className="font-black text-[var(--primary)]">⚡ {Math.max(1, Math.round(worked.current / 60))} {t('minutes')}</p>
            <button onClick={onClose} className="mt-2 px-12 py-4 rounded-full bg-[var(--primary)] text-white font-black text-lg shadow-lg">{t('ok')}</button>
          </>
        )}
      </div>

      {(phase === 'work' || phase === 'rest') && (
        <div className="flex gap-3 p-4 pb-safe">
          <button onClick={togglePause} className="flex-1 py-4 rounded-2xl bg-gray-900 text-white font-black">{paused ? `▶ ${t('resume')}` : `⏸ ${t('pause')}`}</button>
          <button onClick={skip} className="px-6 py-4 rounded-2xl bg-white border border-[var(--border)] font-black">⏭ {t('skip')}</button>
        </div>
      )}
    </div>
  )
}

export { EX_XP_CAP }
