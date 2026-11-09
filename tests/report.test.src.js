import { weekReport, weekDays } from '../src/modules/report/weekStats'
import { shareText } from '../src/modules/report/Report'
const ok = []
const check = (name, cond, info = '') => { ok.push(cond); console.log(cond ? '✓' : '✗', name, info) }
const end = new Date(2026, 10, 13, 20) // Fri 13 Nov 2026
const days = weekDays(end)
check('7 days ending at end', days.length === 7 && days[6] === '2026-11-13' && days[0] === '2026-11-07', days.join(','))
const child = { id: 'a', name: 'تولين', gender: 'f', age: 7, avatar: '🦄' }
const at = (d, h) => new Date(d + `T${String(h).padStart(2, '0')}:00:00`).getTime()
// week: 5 logged days, low veg, good water, 2 move days, nights 6 at ~21:00 (bedtime for 7y w/ 06:30 wake = 20:30)
const history = {}, plates = [], nightLog = []
days.forEach((d, i) => {
  history[d] = { plates: i < 5 ? 2 : 0, serv: i < 5 ? { veg: 1, fruit: 2, grain: 4, protein: 2, dairy: 3 } : {}, kcal: i < 5 ? 1500 : 0, water: 1300, move: (i < 2 ? 65 : 10) * 60, quests: 2 }
  if (i < 5) { plates.push({ ts: at(d, 8), items: { veg: [], grain: [{ id: 'bread', count: 1 }] } }, { ts: at(d, 8), items: { veg: [], grain: [] } }) }
  if (i < 6) nightLog.push({ date: d, thanks: ['family'], at: at(d, 21) })
})
// previous week: quieter
weekDays(new Date(2026, 10, 6, 20)).forEach((d) => { history[d] = { plates: 1, serv: { veg: 1 }, water: 200, move: 0 } })
const p = { history, plates, nightLog, foodFirst: { apple: days[2], kiwi: days[4], bread: '2026-10-01' }, ramadanFasts: {} }
const r = weekReport(child, p, end)
check('logged days 5 (unlogged days are not zeros)', r.cur.loggedDays === 5)
check('veg avg 1 over logged days', r.cur.servAvg.veg === 1, r.cur.servAvg.veg)
check('water days 7 -> win', r.cur.waterDays === 7 && r.wins.some((w) => w.id === 'water'))
check('veg low -> focus #1', r.focus[0]?.g === 'veg', JSON.stringify(r.focus))
check('move 2 days -> in focus or ranked', r.cur.moveDays === 2)
check('wins: food line + water + nights', JSON.stringify(r.wins.map((w) => w.id)) === '["water","nights","food"]' || r.wins.map((w)=>w.id).sort().join() === 'food,nights,water', r.wins.map((w) => w.id))
check('late ~30 min computed', r.lateBy === 30 && r.cur.bedAvg === '21:00', `${r.lateBy} ${r.cur.bedAvg} ${r.bedtime}`)
check('new foods = 2 this week (old excluded)', r.newFoods.length === 2)
check('veg gap meal = breakfast', r.vegGap === 'breakfast')
check('trend plates vs prev week', r.trend.plates === 10 - 7, r.trend.plates)
check('max 3 wins, 2 focus', r.wins.length <= 3 && r.focus.length <= 2)
const empty = weekReport(child, {}, end)
check('empty week -> log focus, no crash', empty.focus[0]?.id === 'log' && empty.cur.servAvg.veg === null)
const txt = shareText('ar', child, r)
check('share text: girl wording + focus tip', txt.includes('وصلت') && txt.includes('💡') === false && txt.includes('الخضار'), '\n' + txt)
const en = shareText('en', child, r)
check('english share text', en.includes('Weekly report') && en.includes('Wins'))
console.log(ok.every(Boolean) ? 'PASS' : 'FAIL')
if (!ok.every(Boolean)) process.exit(1)
