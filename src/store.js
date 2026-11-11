// ---------------------------------------------------------------------------
// State + game rules. Every action works on a deep copy (no state mutation),
// returns the next state plus a list of "events" (sound, toast, badge...).
// Side effects run AFTER the state is committed, never inside setState.
// ---------------------------------------------------------------------------
import { useCallback, useEffect, useRef, useState } from 'react'
import { BADGES, FOODS, MANNERS, QUEST_POOL, questDef, sectionOf, waterGoalForAge } from './data'
import { FAST_CHOICES, RAMADAN_QUESTS, defaultRamadan, hijri, isEidDay, ramadanActive } from './modules/ramadan/data'
import { OUTDOOR_MIN, moveGoalForAge } from './modules/move/data'
import { portionOf } from './modules/growth/portions'
import { isNative, nativeLoad, nativeSave } from './native'
import { defaultReminders } from './reminderDefaults'
import { defaultIsland } from './modules/island/islandLogic'

const EX_XP_CAP = 6

const KEY = 'yummyquest.v2'

export const todayStr = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const yesterdayStr = () => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return todayStr(d)
}

// Small non-crypto hash: the PIN only keeps kids out of the parent panel.
// Recovery code: 8 chars, no look-alike letters (0/O, 1/I/L). Stored only as a hash.
export function newRecoveryCode() {
  const A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  const r = new Uint32Array(8)
  crypto.getRandomValues(r)
  const c = Array.from(r, (n) => A[n % A.length]).join('')
  return `${c.slice(0, 4)}-${c.slice(4)}`
}
export const normCode = (s) => (s || '').replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).toUpperCase().replace(/[^A-Z0-9]/g, '')

export const hashPin = (pin) => {
  let h = 2166136261
  for (const ch of 'yq:' + pin) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  return (h >>> 0).toString(16)
}

// Deterministic daily quest pick per child (same 3 quests all day, new ones tomorrow).
function dailyQuests(childId, date, ramadan = false) {
  let seed = 0
  for (const ch of childId + date) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0
  const pool = [...(ramadan ? RAMADAN_QUESTS : QUEST_POOL)]
  const out = []
  while (out.length < 3) {
    seed = (seed * 1103515245 + 12345) >>> 0
    out.push(pool.splice(seed % pool.length, 1)[0])
  }
  return out.map((q) => ({ id: q.id, done: false, pending: false }))
}

const newProgress = () => ({
  xp: 0, streak: 0, bestStreak: 0, lastActiveDay: null,
  plant: 0, treesGrown: 0, badges: [],
  plates: [], foodsTried: [],
  platesSaved: 0, balancedPlates: 0, completePlates: 0, waterGoalDays: 0,
  routines: {}, routinesDone: 0, moveGoalDays: 0, mannersDays: 0,
  nightsDone: 0, brushCount: 0, nightLog: [], // bedtime routine
  ramadanFasts: {}, eidYears: [], // Ramadan mode
  facts: [], arcade: { best: {}, trophies: {} }, // fact bank + mini games
  history: {}, // date -> { plates, quests, water, missing: {veg,grain,protein,dairy} }
  day: null, // { date, quests, water, platesXp, gameRuns, waterHit }
})

const initial = () => ({
  v: 2,
  pin: null,
  settings: { lang: 'ar', sound: true, speak: true, approval: false, camera: false, reminders: defaultReminders(), ramadan: defaultRamadan() },
  children: [],
  progress: {},
})

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const s = JSON.parse(raw)
      if (s && s.v === 2) {
        for (const p of Object.values(s.progress || {})) {
          p.badges = (p.badges || []).filter((b) => b !== 'rainbow')
          delete p.rainbowPlates
          p.completePlates ??= 0
          p.facts ??= []
          p.arcade ??= { best: {}, trophies: {} }
          ;(p.plates || []).forEach((pl) => delete pl.rainbow)
        }
      }
      if (s && s.v === 2) return { ...initial(), ...s, settings: { ...initial().settings, ...s.settings } }
    }
  } catch {
    /* corrupted or blocked storage */
  }
  return initial()
}

// ---- level / rank ---------------------------------------------------------
export function levelInfo(xp) {
  let level = 1, threshold = 100, prev = 0
  while (xp >= threshold) {
    level++
    prev = threshold
    threshold += level * 50
  }
  return { level, percent: Math.min(100, ((xp - prev) / (threshold - prev)) * 100), toNext: threshold - xp }
}

// ---- plate analysis ------------------------------------------------------
const foodById = Object.fromEntries(FOODS.map((f) => [f.id, f]))
export const getFood = (id) => foodById[id]

export function analysePlate(items) {
  // items: { veg:[{id,count}], grain, protein, dairy }
  const has = {}
  let total = 0
  for (const sec of Object.keys(items)) {
    const n = items[sec].reduce((a, b) => a + b.count, 0)
    has[sec] = n > 0
    total += n
  }
  const balanced = has.veg && has.grain && has.protein
  return { has, total, balanced, complete: balanced && has.dairy }
}

// meal slot by clock time (the child can change it)
export function mealNow(d = new Date()) {
  const m = d.getHours() * 60 + d.getMinutes()
  return m < 10 * 60 + 30 ? 'breakfast' : m < 16 * 60 ? 'lunch' : 'dinner'
}
export const plateDate = (pl) => pl.date || todayStr(new Date(pl.ts))
// how much of a food on this plate was really eaten (not checked yet = planned = 1)
export const eatenFactor = (pl, id) => (pl.eaten && pl.eaten[id] != null ? pl.eaten[id] : 1)
// what was really eaten, as plate items (count x factor)
export function eatenItems(pl) {
  return Object.fromEntries(Object.entries(pl.items).map(([sec, list]) => [sec, list.map((x) => ({ ...x, count: x.count * eatenFactor(pl, x.id) })).filter((x) => x.count > 0)]))
}

// Rebuild a day's food numbers from that day's plates (after save / edit / delete).
function recomputeDay(p, date) {
  const h = p.history[date]
  if (!h) return
  const plates = p.plates.filter((pl) => plateDate(pl) === date)
  h.plates = 0
  h.snacks = 0
  h.missing = { veg: 0, grain: 0, protein: 0, dairy: 0 }
  h.serv = { veg: 0, fruit: 0, grain: 0, protein: 0, dairy: 0 }
  h.kcal = 0
  for (const pl of plates) {
    const items = eatenItems(pl)
    if (pl.meal === 'snack') h.snacks += 1
    else {
      h.plates += 1
      const a = analysePlate(items)
      for (const sec of ['veg', 'grain', 'protein', 'dairy']) if (!a.has[sec]) h.missing[sec] += 1
    }
    for (const it of Object.values(items).flat()) {
      const f = foodById[it.id]
      if (!f) continue
      h.serv[f.category] = (h.serv[f.category] || 0) + it.count
      h.kcal += portionOf(it.id)[0] * it.count
    }
  }
}

// ---- helpers working on a draft progress object ---------------------------
function ensureDay(p, child, date, settings) {
  const rmd = ramadanActive(settings?.ramadan)
  if (p.day && p.day.quests.some((q) => !questDef(q.id))) p.day.quests = dailyQuests(child.id, date, rmd)
  if (!p.day || p.day.date !== date) {
    p.day = { date, quests: dailyQuests(child.id, date, rmd), water: 0, platesXp: 0, gameRuns: 0, waterHit: false }
  }
  // fill fields added in newer versions (old saves)
  for (const [k, v] of Object.entries(newProgress())) if (p[k] === undefined) p[k] = v
  p.day = { moveSec: 0, moveHit: false, exXp: 0, outdoor: 0, manners: {}, ...p.day }
  if (!p.history[date]) p.history[date] = { plates: 0, quests: 0, water: 0, move: 0, missing: { veg: 0, grain: 0, protein: 0, dairy: 0 } }
  // keep ~60 days of history
  const keys = Object.keys(p.history).sort()
  while (keys.length > 60) delete p.history[keys.shift()]
}

function markActive(p, date, ev) {
  if (p.lastActiveDay === date) return
  p.streak = p.lastActiveDay === yesterdayStr() ? p.streak + 1 : 1
  p.lastActiveDay = date
  p.bestStreak = Math.max(p.bestStreak, p.streak)
  if (p.streak > 1) ev.push({ type: 'toast', key: 'streakUp', n: p.streak })
}

// trophy thresholds per mini game
export const TROPHIES = { sort: [150, 300, 500], catch: [100, 200, 350], plate: [60, 120, 200], quiz: [100, 180, 260] }
export const TROPHY_ORDER = [undefined, 'bronze', 'silver', 'gold']
export function trophyFor(game, score) {
  const t = TROPHIES[game]
  if (!t) return null
  return score >= t[2] ? 'gold' : score >= t[1] ? 'silver' : score >= t[0] ? 'bronze' : null
}

function addXp(p, amount, ev) {
  const before = levelInfo(p.xp).level
  p.xp = Math.max(0, p.xp + amount)
  if (levelInfo(p.xp).level > before) ev.push({ type: 'levelUp', level: levelInfo(p.xp).level })
}

function growPlant(p, amount, ev) {
  p.plant += amount
  if (p.plant >= 100) {
    p.plant = 0
    p.treesGrown += 1
    ev.push({ type: 'treeGrown' })
  }
}

function checkBadges(p, ev) {
  const stats = { ...p, uniqueFoods: p.foodsTried.length, factsKnown: (p.facts || []).length, golds: Object.values(p.arcade?.trophies || {}).filter((t) => t === 'gold').length }
  for (const b of BADGES) {
    if (!p.badges.includes(b.id) && b.check(stats)) {
      p.badges.push(b.id)
      addXp(p, 50, ev)
      ev.push({ type: 'badge', id: b.id })
    }
  }
}

function addMove(p, ev, child, date, seconds, extra) {
  p.day.moveSec += Math.max(0, seconds)
  p.history[date].move = p.day.moveSec
  extra?.()
  markActive(p, date, ev)
  const goal = (child.moveGoal || moveGoalForAge(child.age)) * 60
  if (!p.day.moveHit && p.day.moveSec >= goal) {
    p.day.moveHit = true
    p.moveGoalDays += 1
    addXp(p, 30, ev)
    growPlant(p, 15, ev)
    ev.push({ type: 'waterGoal', move: true })
  }
}

// exercise history for the parents' day log
function logMove(p, date, seconds, log) {
  if (!log) return
  p.moveLog ||= []
  p.moveLog.unshift({ ts: Date.now(), date, seconds: Math.round(seconds), ...log })
  p.moveLog = p.moveLog.slice(0, 300)
}

// Visible streak: broken if the child skipped a whole day.
export const liveStreak = (p) =>
  p && (p.lastActiveDay === todayStr() || p.lastActiveDay === yesterdayStr()) ? p.streak : 0

// ---------------------------------------------------------------------------
export function useStore() {
  const [state, setState] = useState(load)
  const ref = useRef(state)
  const listeners = useRef(null)

  useEffect(() => {
    const json = JSON.stringify(state)
    try {
      localStorage.setItem(KEY, json)
    } catch {
      /* storage full / blocked */
    }
    // Android: also keep a durable copy outside the WebView cache
    if (isNative) nativeSave(KEY, json)
  }, [state])

  // Android: on start, restore from the durable copy if it is newer
  // (or if the WebView storage was wiped).
  useEffect(() => {
    if (!isNative) return
    nativeLoad(KEY).then((raw) => {
      if (!raw) return
      try {
        const saved = JSON.parse(raw)
        if (saved?.v === 2 && (saved.savedAt || 0) > (ref.current.savedAt || 0)) {
          ref.current = saved
          setState(saved)
        }
      } catch {
        /* ignore a broken copy */
      }
    })
  }, [])

  // act(fn): fn(draft, ev) mutates a CLONE; events are dispatched after commit.
  const act = useCallback((fn) => {
    const draft = structuredClone(ref.current)
    draft.savedAt = Date.now()
    const ev = []
    fn(draft, ev)
    ref.current = draft
    setState(draft)
    if (ev.length && listeners.current) listeners.current(ev)
  }, [])

  const onEvent = useCallback((cb) => {
    listeners.current = cb
  }, [])

  // ---- child-scoped actions --------------------------------------------
  const withChild = (childId, fn) =>
    act((s, ev) => {
      const child = s.children.find((c) => c.id === childId)
      if (!child) return
      if (!s.progress[childId]) s.progress[childId] = newProgress()
      const p = s.progress[childId]
      const date = todayStr()
      ensureDay(p, child, date, s.settings)
      fn(p, ev, { s, child, date })
      checkBadges(p, ev)
    })

  const actions = {
    // Called on open + every minute: rolls the day over at midnight.
    touchDay: (childId) => withChild(childId, () => {}),

    toggleQuest: (childId, questId) =>
      withChild(childId, (p, ev, { s, date }) => {
        const q = p.day.quests.find((x) => x.id === questId)
        const def = questDef(questId)
        if (!q || !def) return
        if (s.settings.approval) {
          if (q.done) return // approved quests can't be undone by the child
          q.pending = !q.pending
          ev.push({ type: q.pending ? 'questPending' : 'undo' })
          return
        }
        q.done = !q.done
        if (q.done) {
          addXp(p, def.xp, ev)
          growPlant(p, 10, ev)
          p.history[date].quests += 1
          markActive(p, date, ev)
          ev.push({ type: 'questDone' })
        } else {
          addXp(p, -def.xp, ev)
          p.plant = Math.max(0, p.plant - 10)
          p.history[date].quests = Math.max(0, p.history[date].quests - 1)
          ev.push({ type: 'undo' })
        }
        if (p.day.quests.every((x) => x.done)) ev.push({ type: 'allQuests' })
      }),

    addWater: (childId, ml) =>
      withChild(childId, (p, ev, { child, date }) => {
        const goal = child.waterGoal || waterGoalForAge(child.age)
        p.day.water = Math.max(0, Math.min(goal * 2, p.day.water + ml))
        p.history[date].water = p.day.water
        ev.push({ type: ml > 0 ? 'water' : 'undo' })
        if (!p.day.waterHit && p.day.water >= goal) {
          p.day.waterHit = true
          p.waterGoalDays += 1
          addXp(p, 30, ev)
          growPlant(p, 15, ev)
          markActive(p, date, ev)
          ev.push({ type: 'waterGoal' })
        }
      }),

    // A plate is what the child PLANNED (built). After eating, the child (or a
    // parent) marks what was really eaten: all / half / none per food. The day's
    // servings are always recomputed from the day's plates x eaten amounts.
    // meal: breakfast | lunch | dinner | snack
    savePlate: (childId, items, meal = mealNow(), opts = {}) =>
      withChild(childId, (p, ev, { date }) => {
        const a = analysePlate(items)
        const snack = meal === 'snack'
        if (a.total < (snack ? 1 : 2)) return
        const clean = Object.fromEntries(Object.entries(items).map(([k, v]) => [k, v.map((x) => ({ ...x }))]))
        const now = Date.now()
        const plate = { id: now, ts: now, date, meal, items: clean, balanced: !snack && a.balanced, complete: !snack && a.complete, eaten: opts.eaten || null }
        p.plates.unshift(plate)
        p.plates = p.plates.slice(0, 150)
        p.foodFirst ||= {} // food id -> date first put on a plate (weekly report)
        Object.values(items).flat().forEach((it) => {
          if (!p.foodsTried.includes(it.id)) { p.foodsTried.push(it.id); p.foodFirst[it.id] = date }
        })
        let xp = 0
        if (snack) {
          // a snack: small reward, twice a day at most
          p.day.snackXp ||= 0
          if (p.day.snackXp < 2) { xp = 5; p.day.snackXp += 1; addXp(p, xp, ev) }
        } else {
          p.platesSaved += 1
          if (a.balanced) p.balancedPlates += 1
          if (a.complete) p.completePlates += 1
          // XP only for the first 3 plates a day (breakfast / lunch / dinner)
          if (p.day.platesXp < 3) {
            xp = 20 + (a.balanced ? 20 : 0) + (a.has.dairy ? 10 : 0)
            p.day.platesXp += 1
            addXp(p, xp, ev)
            growPlant(p, a.balanced ? 25 : 10, ev)
          }
        }
        recomputeDay(p, date)
        markActive(p, date, ev)
        ev.push({ type: 'plateSaved', xp, snack })
      }),
    // eaten: { foodId: 1 | 0.5 | 0 }
    setEaten: (childId, plateId, eaten, by = 'child') =>
      withChild(childId, (p, ev) => {
        const pl = p.plates.find((x) => x.id === plateId)
        if (!pl) return
        const first = !pl.eaten
        pl.eaten = { ...eaten }
        pl.checkedAt = Date.now()
        if (by === 'parent') pl.confirmed = true
        if (first && by === 'child') {
          // honesty is rewarded the same whatever was eaten
          p.day.eatXp ||= 0
          if (p.day.eatXp < 4) { p.day.eatXp += 1; addXp(p, 5, ev) }
        }
        recomputeDay(p, plateDate(pl))
        ev.push({ type: 'eatenSaved', first })
      }),
    deletePlate: (childId, plateId) =>
      withChild(childId, (p) => {
        const pl = p.plates.find((x) => x.id === plateId)
        if (!pl) return
        p.plates = p.plates.filter((x) => x.id !== plateId)
        recomputeDay(p, plateDate(pl))
      }),
    confirmPlate: (childId, plateId, on = true) =>
      withChild(childId, (p) => {
        const pl = p.plates.find((x) => x.id === plateId)
        if (pl) pl.confirmed = on
      }),

    // ---- movement module -------------------------------------------------
    completeExercise: (childId, { seconds, routineId, xp, log }) =>
      withChild(childId, (p, ev, { child, date }) => addMove(p, ev, child, date, seconds, () => {
        logMove(p, date, seconds, log)
        if (routineId) {
          p.routines[routineId] = (p.routines[routineId] || 0) + 1
          p.routinesDone += 1
          if (p.day.exXp < EX_XP_CAP && xp) {
            p.day.exXp += 1
            addXp(p, xp, ev)
            growPlant(p, 10, ev)
          }
        }
      })),

    logOutdoor: (childId) =>
      withChild(childId, (p, ev, { child, date }) => {
        if (p.day.outdoor >= 2) return
        p.day.outdoor += 1
        logMove(p, date, OUTDOOR_MIN * 60, { kind: 'outdoor', emoji: '🌳', title: { ar: 'لعب برا', en: 'Outdoor play' }, complete: true })
        addXp(p, 10, ev)
        ev.push({ type: 'water' })
        addMove(p, ev, child, date, OUTDOOR_MIN * 60)
      }),

    toggleManner: (childId, id) =>
      withChild(childId, (p, ev, { date }) => {
        const m = MANNERS.find((x) => x.id === id)
        if (!m) return
        const was = !!p.day.manners[id]
        p.day.manners[id] = !was
        addXp(p, was ? -m.xp : m.xp, ev)
        ev.push({ type: was ? 'undo' : 'water' })
        const all = MANNERS.every((x) => p.day.manners[x.id])
        if (all && !p.day.mannersAll) {
          p.day.mannersAll = true
          p.mannersDays += 1
          growPlant(p, 10, ev)
          markActive(p, date, ev)
          ev.push({ type: 'questDone' })
        }
      }),

    // ---- Ramadan -------------------------------------------------------------
    // choice: 'full' | 'bird' | 'none'. Changing it later adjusts the XP.
    setFast: (childId, choice) =>
      withChild(childId, (p, ev, { date }) => {
        const prev = p.ramadanFasts[date]
        if (prev === choice) return
        const xpOf = (c) => FAST_CHOICES.find((x) => x.id === c)?.xp || 0
        p.ramadanFasts[date] = choice
        addXp(p, xpOf(choice) - xpOf(prev), ev)
        if (!prev && choice !== 'none') { growPlant(p, 15, ev); ev.push({ type: 'questDone' }) }
        markActive(p, date, ev)
      }),
    // water plan slot between iftar and suhoor; each glass also fills the water battery
    ramadanWater: (childId, slot) =>
      withChild(childId, (p, ev, { child, date }) => {
        p.day.rwater ||= {}
        const on = !p.day.rwater[slot]
        p.day.rwater[slot] = on
        const goal = child.waterGoal || waterGoalForAge(child.age)
        p.day.water = Math.max(0, p.day.water + (on ? 250 : -250))
        p.history[date].water = p.day.water
        ev.push({ type: on ? 'water' : 'undo' })
        if (on && !p.day.waterHit && p.day.water >= goal) {
          p.day.waterHit = true
          p.waterGoalDays += 1
          addXp(p, 30, ev)
          ev.push({ type: 'waterGoal' })
        }
      }),
    // once per Eid (1-3 Shawwal), per child
    celebrateEid: (childId) =>
      withChild(childId, (p, ev, { s }) => {
        const off = s.settings.ramadan?.hijriOffset || 0
        if (!isEidDay(new Date(), off)) return
        const y = hijri(new Date(), off).y
        if (p.eidYears.includes(y)) return
        p.eidYears.push(y)
        addXp(p, 50, ev)
        ev.push({ type: 'eid' })
      }),

    // ---- bedtime "Star Journey" --------------------------------------------
    nightStep: (childId, stepId, extra) =>
      withChild(childId, (p, ev, { date }) => {
        p.day.night ||= { steps: {}, thanks: [] }
        const n = p.day.night
        if (n.steps[stepId] || n.done) return
        n.steps[stepId] = true
        if (stepId === 'brush') { p.brushCount += 1; p.history[date].brush = true }
        if (stepId === 'thanks' && Array.isArray(extra)) n.thanks = extra.slice(0, 3)
        addXp(p, 5, ev)
        markActive(p, date, ev)
      }),

    nightFinish: (childId) =>
      withChild(childId, (p, ev, { date }) => {
        const n = p.day.night
        if (!n || n.done) return
        n.done = true
        n.doneAt = Date.now()
        p.nightsDone += 1
        p.nightLog = [{ date, thanks: n.thanks || [], at: n.doneAt }, ...p.nightLog.filter((x) => x.date !== date)].slice(0, 30)
        addXp(p, 30, ev)
        growPlant(p, 15, ev)
        markActive(p, date, ev)
      }),

    // XP from games: 3 runs a day across all games. Best score and a trophy
    // (bronze / silver / gold) per game.
    finishGame: (childId, score, game = 'sort') =>
      withChild(childId, (p, ev) => {
        let xp = 0
        if (p.day.gameRuns < 3 && score > 0) xp = Math.min(60, Math.round(score / 2))
        p.day.gameRuns += 1
        if (xp) addXp(p, xp, ev)
        p.arcade ||= { best: {}, trophies: {} }
        const prevBest = p.arcade.best[game] || 0
        const newBest = score > prevBest
        if (newBest) p.arcade.best[game] = score
        const tier = trophyFor(game, score)
        const old = p.arcade.trophies[game]
        const upgraded = tier && TROPHY_ORDER.indexOf(tier) > TROPHY_ORDER.indexOf(old)
        if (upgraded) p.arcade.trophies[game] = tier
        ev.push({ type: 'gameOver', xp, game, newBest: newBest && prevBest > 0, trophy: upgraded ? tier : null })
      }),
    // 🏝️ streak island (parents)
    setIsland: (childId, patch) =>
      withChild(childId, (p, ev, { date }) => {
        const cur = { ...defaultIsland(), ...(p.island || {}) }
        const next = { ...cur, ...patch }
        // switching on, or changing goal / rules, starts the island today
        if ((patch.on && !cur.on) || patch.restart || !next.start) next.start = date
        delete next.restart
        p.island = next
      }),
    claimIsland: (childId) =>
      withChild(childId, (p, ev, { date }) => {
        if (!p.island) return
        p.islands ||= []
        p.islands.unshift({ goal: p.island.goal, prize: p.island.prize, emoji: p.island.emoji, done: date })
        p.island = { ...p.island, start: date }
      }),
    learnFact: (childId, factId) =>
      withChild(childId, (p) => {
        p.facts ||= []
        if (!p.facts.includes(factId)) p.facts.push(factId)
      }),

    // ---- parent actions ---------------------------------------------------
    approveQuest: (childId, questId, ok) =>
      withChild(childId, (p, ev, { date }) => {
        const q = p.day.quests.find((x) => x.id === questId)
        const def = questDef(questId)
        if (!q || !q.pending) return
        q.pending = false
        if (ok) {
          q.done = true
          addXp(p, def.xp, ev)
          growPlant(p, 10, ev)
          p.history[date].quests += 1
          markActive(p, date, ev)
        }
      }),

    saveChild: (child) =>
      act((s) => {
        const i = s.children.findIndex((c) => c.id === child.id)
        if (i >= 0) s.children[i] = child
        else {
          s.children.push(child)
          s.progress[child.id] = newProgress()
        }
      }),
    deleteChild: (id) =>
      act((s) => {
        s.children = s.children.filter((c) => c.id !== id)
        delete s.progress[id]
      }),
    setSetting: (k, v) => act((s) => { s.settings[k] = v }),
    setPin: (pin) => act((s) => { s.pin = hashPin(pin) }),
    setRecovery: (hash) => act((s) => { s.recovery = hash }),
    replaceAll: (data) => act((s) => { Object.keys(s).forEach((k) => delete s[k]); Object.assign(s, data) }),
  }

  return { state, actions, onEvent }
}

export { sectionOf }
