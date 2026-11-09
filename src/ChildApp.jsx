// The child's side of the app: quests, plate builder, sort game, diary, rewards.
import { useEffect, useMemo, useRef, useState } from 'react'
import { BADGES, FOODS, MANNERS, QUEST_POOL, RANKS, RANKS_F, waterGoalForAge } from './data'
import MoveTab from './modules/move/Move'
import PortionsCard from './modules/growth/PortionsCard'
import { portionOf } from './modules/growth/portions'
import { analysePlate, getFood, levelInfo, liveStreak, sectionOf } from './store'
import { say, sfx } from './sfx'
import { Card, Modal, Plate, emptyPlate, foodMatches, useDrag, useT } from './ui'
import { findFoods } from './voiceMatch'
import { isNative, nativeListen, nativeStopListen } from './native'
import { useBack } from './backStack'

const stageOf = (plant) => Math.min(4, Math.floor(plant / 25))
const STAGE_EMOJI = ['🫘', '🌱', '🌿', '🌸', '🌳']

// ---------------------------------------------------------------------------
export default function ChildApp({ child, progress, settings, actions, onSwitch, onLang, onMute, toast, deepTab }) {
  const { t, lang, gender } = useT()
  const [tab, setTab] = useState(deepTab?.tab || 'today')
  useEffect(() => { if (deepTab?.tab) setTab(deepTab.tab) }, [deepTab])
  useBack(onSwitch, 0)
  useBack(() => setTab(tab === 'diary' ? 'plate' : 'today'), 1, tab !== 'today')
  const lvl = levelInfo(progress.xp)
  const ranks = lang === 'ar' && gender === 'f' ? RANKS_F : RANKS[lang]
  const rank = ranks[Math.min(lvl.level - 1, ranks.length - 1)]

  const tabs = [
    ['today', '📋', t('today')],
    ['plate', '🍽️', t('plate')],
    ['move', '🏃', t('move')],
    ['game', '🎮', t('game')],
    ['rewards', '🎁', t('rewards')],
  ]

  return (
    <div className="h-full flex flex-col max-w-xl mx-auto bg-[var(--bg-soft)] md:shadow-2xl md:border-x border-[var(--border)]">
      {/* header */}
      <header className="bg-white/95 backdrop-blur px-4 py-3 border-b border-[var(--border)] flex items-center justify-between gap-2">
        <button onClick={onSwitch} className="flex items-center gap-2 text-start min-w-0">
          <div className="w-11 h-11 shrink-0 rounded-2xl bg-amber-100 border border-[var(--border)] flex items-center justify-center text-2xl">{child.avatar}</div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm truncate min-w-[3.5rem]">{child.name}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] whitespace-nowrap">Lv {lvl.level}<span className="hidden min-[430px]:inline"> • {rank}</span></span>
            </div>
            <div className="w-28 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-[var(--primary)] transition-all duration-500" style={{ width: `${lvl.percent}%` }} />
            </div>
          </div>
        </button>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="px-2.5 py-1 rounded-full bg-[var(--surface-2)] border border-[var(--border)] text-xs font-black text-[var(--primary)]">✨ {progress.xp}</span>
          <span className="px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-xs font-black">🔥 {liveStreak(progress)}</span>
          <button onClick={onMute} aria-label={settings.mute ? 'unmute' : 'mute'} className={`w-8 h-7 rounded-full border text-sm ${settings.mute ? 'bg-gray-800 border-gray-800' : 'bg-white border-[var(--border)]'}`}>{settings.mute ? '🔇' : '🔊'}</button>
          <button onClick={onLang} className="px-2 py-1 rounded-full bg-white border border-[var(--border)] text-xs font-black">{lang === 'ar' ? 'EN' : 'ع'}</button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar p-4 pb-28">
        {tab === 'today' && <Today {...{ child, progress, settings, actions }} />}
        {tab === 'plate' && <PlateBuilder {...{ child, progress, actions, toast }} onDiary={() => setTab('diary')} />}
        {tab === 'move' && <MoveTab {...{ child, progress, actions, settings }} />}
        {tab === 'game' && <SortGame {...{ child, progress, actions }} />}
        {tab === 'diary' && <Diary progress={progress} onBack={() => setTab('plate')} />}
        {tab === 'rewards' && <Rewards progress={progress} />}
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-40 max-w-xl mx-auto bg-white/95 backdrop-blur border-t border-[var(--border)] px-3 pt-2 pb-safe flex justify-between">
        {tabs.map(([id, icon, label]) => (
          <button
            key={id}
            onClick={() => { sfx.pop(); setTab(id) }}
            className={`flex-1 flex flex-col items-center gap-0.5 py-1 rounded-2xl transition-all ${tab === id || (id === 'plate' && tab === 'diary') ? 'text-[var(--primary)] bg-[var(--primary-soft)]' : 'text-gray-400'}`}
          >
            <span className="text-2xl">{icon}</span>
            <span className="text-[11px] font-bold">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

// ---------------------------------------------------------------------------
function Today({ child, progress, settings, actions }) {
  const { t, pick, lang } = useT()
  const day = progress.day
  if (!day) return null
  const goal = child.waterGoal || waterGoalForAge(child.age)
  const pct = Math.min(100, Math.round((day.water / goal) * 100))
  const done = day.quests.filter((q) => q.done).length

  return (
    <div className="space-y-4 anim-pop">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-black text-xl">{t('todaysQuests')}</h2>
          <p className="text-xs text-[var(--text-soft)]">{t('questsSub')}</p>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-[var(--border)] flex flex-col items-center justify-center font-black text-xs">
          <span className="text-lg text-[var(--primary)]">{done}/{day.quests.length}</span>
        </div>
      </div>

      <div className="space-y-2.5">
        {day.quests.map((q) => {
          const def = QUEST_POOL.find((x) => x.id === q.id)
          if (!def) return null
          return (
            <button
              key={q.id}
              onClick={() => actions.toggleQuest(child.id, q.id)}
              className={`w-full text-start p-4 rounded-2xl border-2 flex items-center gap-3 transition-all active:scale-[.98] ${q.done ? 'bg-green-50 border-green-300' : q.pending ? 'bg-amber-50 border-amber-300' : 'bg-white border-[var(--border)] shadow-sm'}`}
            >
              <span className="text-3xl">{q.done ? '✅' : q.pending ? '⏳' : def.emoji}</span>
              <div className="flex-1 min-w-0">
                <h4 className={`font-bold text-sm ${q.done ? 'line-through text-gray-400' : ''}`}>{pick(def.title)}</h4>
                <p className="text-xs text-gray-500">{q.pending ? t('pending') : pick(def.desc)}</p>
              </div>
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-[var(--surface-2)] text-[var(--primary)] shrink-0">+{def.xp}</span>
            </button>
          )
        })}
      </div>

      {/* water */}
      <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-3xl p-4 text-white shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">💧</span>
            <div>
              <h3 className="font-black text-sm">{t('water')}</h3>
              <p className="text-[11px] opacity-90" dir="ltr">{day.water} / {goal} ml</p>
            </div>
          </div>
          <span className="text-sm font-black px-2.5 py-1 rounded-full bg-white/20">{pct}%</span>
        </div>
        <div className="w-full h-3 bg-white/30 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={() => actions.addWater(child.id, -150)} disabled={day.water <= 0} className="px-3 py-1.5 rounded-xl bg-white/15 text-xs font-black disabled:opacity-40" aria-label="undo">↶</button>
          <button onClick={() => actions.addWater(child.id, 150)} className="px-3 py-1.5 rounded-xl bg-white/25 text-xs font-black active:scale-90">🥤 {lang === 'ar' ? 'كاسة صغيرة' : 'Small cup'}</button>
          <button onClick={() => actions.addWater(child.id, 250)} className="px-3 py-1.5 rounded-xl bg-white text-blue-600 text-xs font-black shadow active:scale-90">🥛 {lang === 'ar' ? 'كاسة' : 'Glass'}</button>
        </div>
      </div>

      <PortionsCard child={child} progress={progress} />
      <Manners {...{ child, progress, actions }} />
      <MealTimer />
      {settings.approval && <p className="text-[11px] text-center text-[var(--text-soft)]">🔒 {t('approval')}</p>}
    </div>
  )
}

// ---------------------------------------------------------------------------
function Manners({ child, progress, actions }) {
  const { t, pick } = useT()
  const done = progress.day?.manners || {}
  return (
    <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-4 text-white shadow-lg space-y-2.5">
      <div>
        <h3 className="font-black text-sm">🕌 {t('manners')}</h3>
        <p className="text-[11px] opacity-90">{t('mannersSub')}</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {MANNERS.map((m) => (
          <button
            key={m.id}
            onClick={() => actions.toggleManner(child.id, m.id)}
            className={`rounded-2xl p-2 flex flex-col items-center gap-1 text-center transition-all active:scale-95 ${done[m.id] ? 'bg-white text-emerald-700 shadow' : 'bg-white/15'}`}
          >
            <span className="text-2xl">{done[m.id] ? '✅' : m.emoji}</span>
            <span className="text-[11px] font-bold leading-tight">{pick(m.title)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
function MealTimer() {
  const { t } = useT()
  const [endAt, setEndAt] = useState(null)
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    if (!endAt) return
    const id = setInterval(() => {
      const n = Date.now()
      setNow(n)
      if (n >= endAt) {
        setEndAt(null)
        sfx.alarm()
      }
    }, 1000)
    return () => clearInterval(id)
  }, [endAt])
  const left = endAt ? Math.max(0, Math.ceil((endAt - now) / 1000)) : 0
  const mm = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`
  return (
    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-3xl p-4 text-white shadow-lg flex items-center justify-between">
      <div>
        <h3 className="font-black text-sm">⏳ {t('mealTimer')}</h3>
        <p className="text-xs opacity-90">{endAt ? <span dir="ltr" className="text-xl font-black">{mm}</span> : t('mealHint')}</p>
      </div>
      <button
        onClick={() => { sfx.pop(); setNow(Date.now()); setEndAt(endAt ? null : Date.now() + 20 * 60 * 1000) }}
        className={`px-4 py-2 rounded-xl font-black text-xs shadow ${endAt ? 'bg-white text-purple-700' : 'bg-purple-800/60 border border-purple-300'}`}
      >
        {endAt ? t('stopMeal') : t('startMeal')}
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
function PlateBuilder({ child, progress, actions, toast, onDiary }) {
  const { t, lang, L } = useT()
  const [items, setItems] = useState(emptyPlate)
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('all')
  const [listening, setListening] = useState(false)

  const add = (food, sec = sectionOf(food)) => {
    // Food dropped into the wrong section still goes to its correct one, with a hint.
    const correct = sectionOf(food)
    if (sec !== correct) {
      sfx.wrong()
      toast(`${food.emoji} → ${L[{ veg: 'vegFruits', grain: 'grains', protein: 'protein', dairy: 'dairy' }[correct]]}`)
    } else {
      sfx.pop()
      // portion awareness: show what ONE serving of this food looks like
      const pr = portionOf(food.id)
      toast(`${food.emoji} +1 ${lang === 'ar' ? 'حصة' : 'serving'} = ${lang === 'ar' ? pr[1] : pr[2]}`)
    }
    say(food.name[lang], lang)
    setItems((prev) => {
      const list = prev[correct]
      const exists = list.find((x) => x.id === food.id)
      const next = exists ? list.map((x) => (x.id === food.id ? { ...x, count: Math.min(5, x.count + 1) } : x)) : [...list, { id: food.id, count: 1 }]
      return { ...prev, [correct]: next }
    })
  }
  const remove = (sec, id) => {
    sfx.whoosh()
    setItems((prev) => ({ ...prev, [sec]: prev[sec].filter((x) => x.id !== id) }))
  }
  const { bind, over, ghostEl } = useDrag({ onDrop: add, onTap: add })

  const a = analysePlate(items)
  const buddy = useMemo(() => {
    if (a.total === 0) return { e: '😴', m: t('buddyEmpty', { name: child.name }) }
    if (!a.has.veg) return { e: '🤔', m: t('buddyNeedVeg') }
    if (!a.has.protein) return { e: '🤔', m: t('buddyNeedProtein') }
    if (!a.has.grain) return { e: '🙂', m: t('buddyNeedGrain') }
    if (!a.has.dairy) return { e: '😋', m: t('buddyNeedDairy') }
    if (a.complete) return { e: '🤩', m: t('buddyComplete') }
    return { e: '🥳', m: t('buddyBalanced') }
  }, [a.total, a.has.veg, a.has.protein, a.has.grain, a.has.dairy, a.complete, lang, child.name])

  const foods = FOODS.filter((f) => (cat === 'all' || (cat === 'pal' ? f.pal : f.category === cat)) && foodMatches(f, q))
  const xpLeft = (progress.day?.platesXp ?? 0) < 3

  const save = () => {
    actions.savePlate(child.id, items)
    setItems(emptyPlate())
  }

  const recRef = useRef(null)
  const addSpoken = (alts) => {
    const ids = findFoods(alts, FOODS)
    if (!ids.length) return toast(alts.length ? `${t('notFound')}: «${alts[0]}»` : t('voiceSilence'))
    const found = ids.map((id) => FOODS.find((f) => f.id === id))
    found.forEach((f) => add(f))
    setTimeout(() => toast(`${t('added')} ${found.map((f) => f.emoji).join(' ')}`), 50)
  }
  const nativeVoice = async () => {
    if (listening) { nativeStopListen(); setListening(false); return }
    setListening(true)
    toast(t('listening'))
    try {
      addSpoken(await nativeListen(lang))
    } catch (e) {
      toast(t({ unsupported: 'voiceNoNative', denied: 'voiceDenied', network: 'voiceOffline' }[e?.code] || 'voiceErr'))
    } finally {
      setListening(false)
    }
  }
  const voice = (retryLang) => {
    if (isNative) return nativeVoice()
    // tap again while listening = stop
    if (listening && recRef.current) { try { recRef.current.stop() } catch { /* ignore */ } return }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (window.self !== window.top) return toast(t('voicePreview'))
    if (!SR) return toast(t('voiceNo'))
    if (navigator.onLine === false) return toast(t('voiceOffline'))
    const r = new SR()
    recRef.current = r
    r.lang = retryLang || (lang === 'ar' ? 'ar-PS' : 'en-US')
    r.interimResults = false
    r.continuous = false
    r.maxAlternatives = 5
    let handled = false
    r.onstart = () => { setListening(true); toast(t('listening')) }
    r.onend = () => { setListening(false); if (!handled) toast(t('voiceSilence')) }
    r.onerror = (e) => {
      handled = true
      setListening(false)
      // Arabic (Palestine) not available on this device -> retry with Arabic (Jordan)
      if (e.error === 'language-not-supported' && lang === 'ar' && !retryLang) return voice('ar-JO')
      const key = { 'not-allowed': 'voiceDenied', 'service-not-allowed': 'voiceDenied', network: 'voiceOffline', 'no-speech': 'voiceSilence', 'audio-capture': 'voiceNoMic', aborted: null }[e.error]
      if (key !== null) toast(t(key || 'voiceErr'))
    }
    r.onresult = (e) => {
      handled = true
      addSpoken(Array.from(e.results[0] || []).map((x) => x.transcript))
    }
    try { r.start() } catch { setListening(false); toast(t('voiceErr')) }
  }

  return (
    <div className="space-y-4 anim-pop">
      {ghostEl}
      <div className="flex justify-end -mb-2">
        <button onClick={onDiary} className="px-3 py-1.5 rounded-full bg-white border border-[var(--border)] text-xs font-black shadow-sm">📖 {t('diary')}{progress.plates?.length ? ` (${progress.plates.length})` : ''}</button>
      </div>
      <div className="flex items-center gap-3 bg-white rounded-3xl border border-[var(--border)] p-3">
        <div className={`w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-3xl shrink-0 ${a.total ? 'anim-bounce' : ''}`}>{buddy.e}</div>
        <div>
          <span className="text-xs font-black text-[var(--primary)]">{t('buddy')}</span>
          <p className="text-sm font-bold leading-snug">{buddy.m}</p>
        </div>
      </div>

      <Plate items={items} over={over} onRemove={remove} />

      <button
        onClick={save}
        disabled={a.total < 2}
        className={`w-full py-3.5 rounded-2xl font-black transition-all active:scale-95 shadow-md ${a.total >= 2 ? 'bg-[#1A1A1A] text-white' : 'bg-gray-200 text-gray-400'}`}
      >
        {a.total < 2 ? t('needMore') : `${t('savePlate')}${xpLeft ? ' ✨' : ''}`}
      </button>
      {!xpLeft && <p className="text-xs text-center text-[var(--text-soft)]">{t('alreadySaved')}</p>}

      {/* palette */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('search')}
            className="flex-1 text-sm px-4 py-2 rounded-full border border-[var(--border)] bg-white outline-none focus:border-[var(--primary)]"
          />
          <button onClick={() => voice()} className={`w-10 h-10 rounded-full border border-[var(--border)] bg-white ${listening ? 'bg-red-100 animate-pulse' : ''}`} aria-label="voice">
            {listening ? '🔴' : '🎤'}
          </button>
        </div>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
          {['all', 'pal', 'veg', 'fruit', 'grain', 'protein', 'dairy'].map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${cat === c ? 'bg-[var(--primary)] text-white shadow-sm' : 'bg-white border border-[var(--border)] text-gray-600'}`}
            >
              {c === 'all' ? t('all') : c === 'pal' ? t('pal') : L.cat[c]}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {foods.map((f) => (
            <div
              key={f.id}
              role="button"
              tabIndex={0}
              {...bind(f)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && add(f)}
              className="bg-white border border-[var(--border)] rounded-2xl p-2 flex flex-col items-center gap-0.5 cursor-grab active:scale-90 hover:border-[var(--primary)] shadow-sm transition-transform"
            >
              <span className="text-3xl pointer-events-none">{f.emoji}</span>
              <span className="text-[11px] font-bold text-gray-700 truncate w-full text-center pointer-events-none">{f.name[lang]}</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-center text-[var(--text-soft)]">💡 {lang === 'ar' ? 'اكبس عالأكل، أو اضغط مطوّل واسحبه عالطبق' : 'Tap a food, or press & hold to drag it'}</p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sort game: a food appears, the child picks the plate section it belongs to.
const GAME_SECS = [
  ['veg', '🥦🍎', 'vegFruits'],
  ['grain', '🍞', 'grains'],
  ['protein', '🍗', 'protein'],
  ['dairy', '🥛', 'dairy'],
]
function SortGame({ child, progress, actions }) {
  const { t, lang } = useT()
  const [phase, setPhase] = useState('idle') // idle | play | over
  const [food, setFood] = useState(null)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [left, setLeft] = useState(30)
  const [flash, setFlash] = useState(null)
  const [earned, setEarned] = useState(0)
  const scoreRef = useRef(0)

  const next = (prev) => {
    let f
    do f = FOODS[Math.floor(Math.random() * FOODS.length)]
    while (prev && f.id === prev.id)
    setFood(f)
    say(f.name[lang], lang)
  }
  const start = () => {
    sfx.sparkle()
    setScore(0); scoreRef.current = 0; setCombo(0); setLeft(30); setPhase('play'); next()
  }
  useEffect(() => {
    if (phase !== 'play') return
    const end = Date.now() + 30000
    const id = setInterval(() => {
      const l = Math.max(0, Math.ceil((end - Date.now()) / 1000))
      setLeft(l)
      if (l === 0) {
        clearInterval(id)
        setPhase('over')
        const runs = progress.day?.gameRuns ?? 0
        setEarned(runs < 3 && scoreRef.current > 0 ? Math.min(60, Math.round(scoreRef.current / 2)) : 0)
        actions.finishGame(child.id, scoreRef.current)
      }
    }, 250)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const answer = (sec) => {
    if (phase !== 'play' || !food) return
    if (sectionOf(food) === sec) {
      const gain = 10 + Math.min(combo, 5) * 2
      scoreRef.current += gain
      setScore(scoreRef.current); setCombo((c) => c + 1); setFlash('ok'); sfx.pop(); next(food)
    } else {
      setCombo(0); setFlash('bad'); sfx.wrong()
    }
    setTimeout(() => setFlash(null), 300)
  }

  if (phase !== 'play')
    return (
      <div className="flex flex-col items-center text-center gap-3 pt-10 anim-pop">
        <div className="text-7xl anim-bounce">⚡</div>
        <h2 className="font-black text-2xl">{t('gameTitle')}</h2>
        <p className="text-sm text-[var(--text-soft)] px-6">{t('gameSort')}</p>
        {phase === 'over' && (
          <div className="text-xl font-black text-[var(--primary)]">
            {t('gameOver')} {score} 🎉 {earned > 0 && <span className="block text-sm">+{earned} XP</span>}
          </div>
        )}
        <button onClick={start} className="mt-4 px-10 py-3.5 rounded-full bg-[var(--primary)] text-white font-black text-lg shadow-lg active:scale-95">
          {phase === 'over' ? t('replay') : t('start')}
        </button>
        <p className="text-[11px] text-[var(--text-soft)]">{t('gameDaily')}</p>
      </div>
    )

  return (
    <div className="space-y-5 anim-pop">
      <div className="flex justify-between">
        <span className="font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-full text-sm">⏱️ {left}s</span>
        {combo > 1 && <span className="font-black text-purple-600 bg-purple-50 px-3 py-1 rounded-full text-sm">🔥 ×{combo}</span>}
        <span className="font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-sm">{t('score')} {score}</span>
      </div>
      {food && (
        <Card className={`flex flex-col items-center py-8 ${flash === 'bad' ? 'anim-shake border-red-300' : flash === 'ok' ? 'border-green-300' : ''}`}>
          <div key={food.id} className="text-8xl anim-pop">{food.emoji}</div>
          <div className="text-xl font-black mt-2">{food.name[lang]}</div>
        </Card>
      )}
      <div className="grid grid-cols-2 gap-3">
        {GAME_SECS.map(([sec, emo, key]) => (
          <button
            key={sec}
            onClick={() => answer(sec)}
            className={`py-5 rounded-3xl font-black text-sm shadow-md active:scale-95 border-2 ${{ veg: 'bg-green-100 border-green-300', grain: 'bg-amber-100 border-amber-300', protein: 'bg-orange-100 border-orange-300', dairy: 'bg-blue-100 border-blue-300' }[sec]}`}
          >
            <div className="text-3xl">{emo}</div>
            {t(key)}
          </button>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
function Diary({ progress, onBack }) {
  const { t, lang } = useT()
  const [sel, setSel] = useState(null)
  const fmt = (ts) => new Date(ts).toLocaleString(lang === 'ar' ? 'ar' : 'en', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  return (
    <div className="space-y-3 anim-pop">
      <div className="flex items-center justify-between">
        <h2 className="font-black text-xl">{t('diaryTitle')}</h2>
        <button onClick={onBack} className="px-3 py-1.5 rounded-full bg-white border border-[var(--border)] text-xs font-black">🍽️ {t('back')}</button>
      </div>
      {progress.plates.length === 0 ? (
        <Card className="text-center py-10 text-gray-500"><span className="text-5xl block mb-2">🍽️</span><p className="font-bold">{t('diaryEmpty')}</p></Card>
      ) : (
        progress.plates.map((p) => (
          <button key={p.id} onClick={() => { sfx.pop(); setSel(p) }} className="w-full text-start bg-white rounded-2xl p-3 border border-[var(--border)] flex gap-3 items-center active:scale-[.98] shadow-sm">
            <div className="flex flex-wrap gap-0.5 w-20 shrink-0 text-lg leading-none">
              {Object.values(p.items).flat().slice(0, 8).map((it) => <span key={it.id}>{getFood(it.id)?.emoji}</span>)}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm">{p.complete ? '🥇 ' : p.balanced ? '⚖️ ' : ''}{p.balanced ? t('balancedPlate') : t('plateLbl')}</h3>
              <p className="text-xs text-[var(--text-soft)]">{fmt(p.ts)}</p>
            </div>
          </button>
        ))
      )}
      {sel && (
        <Modal onClose={() => setSel(null)}>
          <p className="text-sm font-bold text-gray-400">{fmt(sel.ts)}</p>
          <Plate items={sel.items} small />
          <button onClick={() => setSel(null)} className="w-full py-3 bg-gray-900 text-white font-black rounded-2xl">{t('ok')}</button>
        </Modal>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
function Rewards({ progress }) {
  const { t, pick, L } = useT()
  const stage = stageOf(progress.plant)
  const lvl = levelInfo(progress.xp)
  return (
    <div className="space-y-4 anim-pop">
      <div className="bg-gradient-to-br from-emerald-500 to-teal-700 rounded-3xl p-5 text-white shadow-lg">
        <span className="text-[11px] font-black bg-white/20 px-2 py-0.5 rounded-full">{t('garden')}</span>
        <div className="flex items-center gap-4 mt-3">
          <div className="text-7xl anim-bounce">{STAGE_EMOJI[stage]}</div>
          <div className="flex-1">
            <h4 className="font-black">{L.stages[stage]}</h4>
            <div className="w-full h-3 bg-white/25 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progress.plant}%` }} />
            </div>
            <p className="text-[11px] opacity-90 mt-1">{t('gardenHint')}</p>
            {progress.treesGrown > 0 && <p className="text-sm mt-1">🌳 × {progress.treesGrown}</p>}
          </div>
        </div>
      </div>

      <Card className="flex items-center justify-between">
        <span className="font-black">Lv {lvl.level}</span>
        <span className="text-xs text-[var(--text-soft)]" dir="ltr">{lvl.toNext} XP →  Lv {lvl.level + 1}</span>
      </Card>

      <h3 className="font-black">{t('badges')}</h3>
      <div className="grid grid-cols-2 gap-2.5">
        {BADGES.map((b) => {
          const on = progress.badges.includes(b.id)
          return (
            <div key={b.id} className={`p-3 rounded-2xl border flex items-center gap-3 ${on ? 'bg-white border-amber-300 shadow-sm' : 'bg-gray-100 border-gray-200 opacity-60'}`}>
              <span className={`text-3xl ${on ? '' : 'grayscale'}`}>{on ? b.emoji : '🔒'}</span>
              <div className="min-w-0">
                <h4 className="font-bold text-xs truncate">{pick(b.title)}</h4>
                <p className="text-[10px] text-gray-500 leading-tight">{pick(b.desc)}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
