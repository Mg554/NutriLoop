// ---------------------------------------------------------------------------
// 🏝️ Streak Island. Parents pick a goal (days in a row), a prize and the
// conditions of a "complete day". Each complete day builds the island one step
// toward the treasure. One missed day per 7 days can be covered by a life
// ring (🛟) if the parents allow it; otherwise a missed day starts a new island.
// Pure functions: everything is computed from the saved history.
// ---------------------------------------------------------------------------
import { waterGoalForAge } from '../../data'

export const RULES = [
  { id: 'plates', emoji: '🍽️', ar: 'وجبتين مسجّلات', en: '2 meals logged' },
  { id: 'eaten', emoji: '✅', ar: 'قال شو أكل', en: 'Told what was eaten' },
  { id: 'water', emoji: '💧', ar: 'هدف المي', en: 'Water goal' },
  { id: 'move', emoji: '⚡', ar: '٢٠ دقيقة حركة', en: '20 min moving' },
  { id: 'night', emoji: '🌙', ar: 'رحلة النجوم', en: 'Star Journey' },
  { id: 'quests', emoji: '📋', ar: 'مهمتين', en: '2 quests' },
]
export const GOALS = [7, 14, 21, 30]
export const PRIZE_EMOJI = ['🎁', '🎡', '🍦', '📚', '⚽', '🧸', '🏊', '🎨', '🚲', '🍕']

export const defaultIsland = () => ({ on: false, goal: 14, prize: '', emoji: '🎁', rules: ['plates', 'water', 'night'], grace: true, start: null })

const pad = (n) => String(n).padStart(2, '0')
export const key = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const addDays = (k, n) => { const d = new Date(k + 'T12:00'); d.setDate(d.getDate() + n); return key(d) }

// which rules a given day met
export function dayChecks(child, p, date, rules) {
  const h = p.history?.[date] || {}
  const goalWater = child.waterGoal || waterGoalForAge(child.age)
  const eaten = (p.plates || []).some((pl) => (pl.date || key(new Date(pl.ts))) === date && pl.meal !== 'snack' && pl.eaten)
  const all = {
    plates: (h.plates || 0) >= 2,
    eaten,
    water: (h.water || 0) >= goalWater,
    move: (h.move || 0) >= 20 * 60,
    night: (p.nightLog || []).some((n) => n.date === date),
    quests: (h.quests || 0) >= 2,
  }
  return Object.fromEntries(rules.map((r) => [r, !!all[r]]))
}
export const dayComplete = (checks) => Object.values(checks).length > 0 && Object.values(checks).every(Boolean)

// walk the days from the island start: complete / grace / missed
export function islandState(child, p, today) {
  const cfg = { ...defaultIsland(), ...(p.island || {}) }
  if (!cfg.on || !cfg.start) return { cfg, on: false }
  let steps = 0
  let lastGrace = null
  let restarts = 0
  let start = cfg.start
  const days = [] // { date, state: 'done'|'grace' }
  for (let d = cfg.start; d < today; d = addDays(d, 1)) {
    if (steps >= cfg.goal) break
    const ok = dayComplete(dayChecks(child, p, d, cfg.rules))
    if (ok) { steps += 1; days.push({ date: d, state: 'done' }) } else if (cfg.grace && (!lastGrace || addDays(lastGrace, 7) <= d) && steps > 0) {
      lastGrace = d
      days.push({ date: d, state: 'grace' })
    } else {
      // missed: a new island starts the next day
      if (steps > 0) restarts += 1
      steps = 0; days.length = 0; lastGrace = null; start = addDays(d, 1)
    }
  }
  const todayChecks = dayChecks(child, p, today, cfg.rules)
  const todayDone = dayComplete(todayChecks)
  if (todayDone && steps < cfg.goal) { steps += 1; days.push({ date: today, state: 'done' }) }
  const graceLeft = cfg.grace && (!lastGrace || addDays(lastGrace, 7) <= today)
  return { cfg, on: true, steps: Math.min(steps, cfg.goal), goal: cfg.goal, reached: steps >= cfg.goal, todayChecks, todayDone, days, graceLeft, restarts, start }
}
