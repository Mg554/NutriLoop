// ---------------------------------------------------------------------------
// Weekly parent report: pure functions (no React) so they can be unit-tested.
// Everything here is PARENT-ONLY (behind the PIN): it may show calories.
// Food servings are averaged over LOGGED days only, so a day the child did not
// record is "no data", never "ate nothing".
// ---------------------------------------------------------------------------
import { FOODS, waterGoalForAge } from '../../data'
import { moveGoalForAge } from '../move/data'
import { GROUPS, assess, avgMoveMinutes } from '../growth/calc'
import { bedtimeFor, toMin } from '../night/data'

const foodById = Object.fromEntries(FOODS.map((f) => [f.id, f]))
const pad = (n) => String(n).padStart(2, '0')
export const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

// 7 date keys ending at `end` (inclusive), oldest first
export function weekDays(end = new Date()) {
  const out = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(end)
    d.setHours(12, 0, 0, 0)
    d.setDate(d.getDate() - i)
    out.push(dayKey(d))
  }
  return out
}

// minutes after 12:00 so a 23:30 and a 00:30 bedtime average sensibly
const eveningMin = (ts) => { const d = new Date(ts); return (((d.getHours() * 60 + d.getMinutes()) - 720) + 1440) % 1440 }
const fromEvening = (m) => { const t = (Math.round(m) + 720) % 1440; return `${pad(Math.floor(t / 60))}:${pad(t % 60)}` }

const mealOf = (ts) => { const h = new Date(ts).getHours(); return h < 11 ? 'breakfast' : h < 17 ? 'lunch' : 'dinner' }

// raw numbers for one 7-day window
function measure(child, p, days) {
  const H = p.history || {}
  const goalWater = child.waterGoal || waterGoalForAge(child.age)
  const goalMove = child.moveGoal || moveGoalForAge(child.age)
  const nightBy = Object.fromEntries((p.nightLog || []).map((x) => [x.date, x]))
  const rows = days.map((d) => {
    const h = H[d] || {}
    return {
      date: d,
      plates: h.plates || 0,
      serv: h.serv || {},
      kcal: h.kcal || 0,
      water: h.water || 0,
      move: Math.round((h.move || 0) / 60),
      quests: h.quests || 0,
      night: nightBy[d] || null,
      brush: !!h.brush || !!nightBy[d],
      fast: p.ramadanFasts?.[d] || null,
    }
  })
  const logged = rows.filter((r) => r.plates > 0)
  const servAvg = Object.fromEntries(GROUPS.map((g) => [g, logged.length ? logged.reduce((s, r) => s + (r.serv[g] || 0), 0) / logged.length : null]))
  const nights = rows.filter((r) => r.night)
  const nightTimes = nights.map((r) => r.night.at).filter(Boolean)
  return {
    rows, goalWater, goalMove,
    loggedDays: logged.length,
    activeDays: rows.filter((r) => r.plates || r.water || r.move || r.quests || r.night).length,
    plates: rows.reduce((s, r) => s + r.plates, 0),
    servAvg,
    kcalAvg: logged.length ? logged.reduce((s, r) => s + r.kcal, 0) / logged.length : null,
    waterAvg: rows.reduce((s, r) => s + r.water, 0) / 7,
    waterDays: rows.filter((r) => r.water >= goalWater).length,
    moveAvg: rows.reduce((s, r) => s + r.move, 0) / 7,
    moveDays: rows.filter((r) => r.move >= goalMove).length,
    nights: nights.length,
    brushDays: rows.filter((r) => r.brush).length,
    bedAvg: nightTimes.length ? fromEvening(nightTimes.reduce((s, t) => s + eveningMin(t), 0) / nightTimes.length) : null,
    fastFull: rows.filter((r) => r.fast === 'full').length,
    fastBird: rows.filter((r) => r.fast === 'bird').length,
    thanks: [...new Set(nights.flatMap((r) => r.night.thanks || []))],
  }
}

export function weekReport(child, p = {}, end = new Date()) {
  const days = weekDays(end)
  const prevEnd = new Date(end); prevEnd.setDate(prevEnd.getDate() - 7)
  const cur = measure(child, p, days)
  const prev = measure(child, p, weekDays(prevEnd))
  const a = assess(child, { avgMoveMin: avgMoveMinutes(p) })
  const target = Object.fromEntries(GROUPS.map((g) => [g, a.targets[g].target]))

  // how often each food group reached its target on logged days
  const daysMet = Object.fromEntries(GROUPS.map((g) => [g, cur.rows.filter((r) => r.plates && (r.serv[g] || 0) >= target[g]).length]))

  // new foods this week (first ever time on a plate)
  const inWeek = new Set(days)
  const newFoods = Object.entries(p.foodFirst || {}).filter(([, d]) => inWeek.has(d)).map(([id]) => foodById[id]).filter(Boolean)

  // which meal most often misses vegetables / fruit
  const meals = { breakfast: [0, 0], lunch: [0, 0], dinner: [0, 0] }
  for (const pl of p.plates || []) {
    if (!inWeek.has(dayKey(new Date(pl.ts)))) continue
    const m = meals[mealOf(pl.ts)]
    m[0] += 1
    if (!(pl.items?.veg || []).length) m[1] += 1
  }
  const vegGap = Object.entries(meals).filter(([, [n, miss]]) => n >= 2 && miss / n >= 0.5).sort((x, y) => y[1][1] / y[1][0] - x[1][1] / x[1][0])[0]?.[0] || null

  const bedtime = bedtimeFor(child)
  const lateBy = cur.bedAvg ? ((toMin(cur.bedAvg) - toMin(bedtime) + 1440 + 720) % 1440) - 720 : null

  // ---- strengths and focus areas -------------------------------------------
  const ratio = (g) => (cur.servAvg[g] == null ? null : cur.servAvg[g] / target[g])
  const enough = cur.loggedDays >= 3
  const wins = []
  const focus = []
  if (enough) {
    // all food groups that reached the target -> ONE win line (keeps room for other habits)
    const met = ['veg', 'fruit', 'protein', 'dairy'].filter((g) => ratio(g) >= 0.9)
    if (met.length) wins.push({ id: 'food', groups: met, score: 0.6 + met.length * 0.1 })
    // food is the core of the app: a low food group outranks other focus areas
    const low = ['veg', 'fruit', 'dairy', 'protein'].map((g) => [g, ratio(g)]).filter(([, r]) => r < 0.7).sort((x, y) => x[1] - y[1])
    for (const [g, r] of low.slice(0, 2)) focus.push({ id: `g-${g}`, g, score: 1 + (1 - r) })
    if (ratio('grain') > 1.6) focus.push({ id: 'grain-high', score: 0.3 })
  } else focus.push({ id: 'log', score: 2 })
  if (cur.waterDays >= 5) wins.push({ id: 'water', score: cur.waterDays / 7 })
  else if (cur.waterDays <= 2) focus.push({ id: 'water', score: 1 - cur.waterDays / 7 })
  if (cur.moveDays >= 5) wins.push({ id: 'move', score: cur.moveDays / 7 })
  else if (cur.moveDays <= 2) focus.push({ id: 'move', score: 1 - cur.moveDays / 7 })
  if (cur.nights >= 5) wins.push({ id: 'nights', score: cur.nights / 7 })
  else if (cur.nights <= 2 && cur.activeDays >= 3) focus.push({ id: 'nights', score: 0.4 })
  if (lateBy != null && lateBy > 30) focus.push({ id: 'late', score: 0.45, n: lateBy })
  if (newFoods.length >= 2) wins.push({ id: 'newFoods', score: 0.8, n: newFoods.length })
  if (cur.fastFull + cur.fastBird >= 3) wins.push({ id: 'fasts', score: 0.85 })
  if (vegGap && !focus.some((f) => f.g === 'veg')) focus.push({ id: 'vegMeal', meal: vegGap, score: 0.35 })
  wins.sort((x, y) => y.score - x.score)
  focus.sort((x, y) => y.score - x.score)

  // ---- week-over-week trend ------------------------------------------------
  const trend = (k) => (prev.activeDays ? cur[k] - prev[k] : null)

  return {
    days, cur, prev, a, target, daysMet, newFoods, meals, vegGap, bedtime, lateBy, enough,
    wins: wins.slice(0, 3), focus: focus.slice(0, 2),
    trend: { plates: trend('plates'), waterDays: trend('waterDays'), moveAvg: trend('moveAvg'), nights: trend('nights') },
  }
}
