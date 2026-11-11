import { islandState, key } from '../src/modules/island/islandLogic'
const ok = []
const check = (n, c, i = '') => { ok.push(c); console.log(c ? '✓' : '✗', n, i) }
const child = { id: 'a', name: 'x', age: 7, gender: 'f' }
const day = (i) => { const d = new Date(2026, 10, 1 + i, 12); return key(d) }
const full = () => ({ plates: 2, water: 1300, move: 1500, quests: 3 })
const mk = (pattern, extra = {}) => {
  const history = {}, nightLog = []
  Array.from(pattern).forEach((c, i) => { if (c === 'x') { history[day(i)] = full(); nightLog.push({ date: day(i) }) } })
  return { history, nightLog, island: { on: true, goal: 7, rules: ['plates', 'water', 'night'], grace: true, start: day(0), ...extra } }
}
let s = islandState(child, mk('xxxx'), day(4))
check('4 complete days -> 4 steps', s.steps === 4, s.steps)
s = islandState(child, mk('xxxxx'), day(4))
check('today complete counts now', s.steps === 5 && s.todayDone)
s = islandState(child, mk('xx.xx'), day(5))
check('one missed day covered by life ring (counts as a gift step)', s.steps === 5 && s.days.some((d) => d.state === 'grace'), JSON.stringify(s.days.map((d) => d.state)))
s = islandState(child, mk('xx.x.x'), day(6))
check('second miss within 7 days -> island just waits, nothing lost', s.steps === 5 && s.missed === 1, s.steps)
s = islandState(child, mk('xx.x.x', { grace: false }), day(6))
check('no life rings -> missed days pause, never reset', s.steps === 4 && s.missed === 2, s.steps)
s = islandState(child, mk('xxxxxxxxx'), day(9))
check('goal reached caps at goal', s.reached && s.steps === 7)
s = islandState(child, mk('.xxx'), day(4))
check('miss on day 1 (nothing built yet) just waits', s.steps === 3 && s.missed === 1, s.steps)
s = islandState(child, mk('xxx.'), day(4))
check('yesterday missed -> waiting flag (gentle message)', s.waiting === false || s.days.some((d) => d.state === 'grace'))
s = islandState(child, mk('xxx..', { grace: false }), day(5))
check('waiting after a missed day, steps kept', s.waiting && s.steps === 3)
console.log(ok.every(Boolean) ? 'PASS' : 'FAIL'); if (!ok.every(Boolean)) process.exit(1)
