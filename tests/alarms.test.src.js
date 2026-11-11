import { alarmOccurrences } from '../src/alarms'
const ok = []
const check = (n, c, i = '') => { ok.push(c); console.log(c ? '✓' : '✗', n, i) }
const from = new Date(2026, 10, 11, 20, 0) // Wed 11 Nov 2026, 20:00
const state = {
  children: [{ id: 'a', name: 'تولين', wake: '06:30' }, { id: 'b', name: 'جود', wake: '07:00' }],
  settings: { lang: 'ar', reminders: { schoolDays: [0, 1, 2, 3, 4] }, alarms: { tone: 'birds', wake: { a: true }, items: [
    { id: 'x', label: 'تدريب كورة', emoji: '⚽', t: '20:30', days: [3], child: 'b', on: true },
    { id: 'y', label: 'off', t: '21:00', days: [0, 1, 2, 3, 4, 5, 6], on: false },
  ] } },
}
const occ = alarmOccurrences(state, from, 3)
const show = occ.map((o) => `${o.id}@${o.at.getDay()} ${o.at.getHours()}:${o.at.getMinutes()}`)
check('custom alarm tonight (Wed 20:30)', occ[0].id === 'x' && occ[0].at.getHours() === 20, show.join(' | '))
check('wake alarm Thu 06:30 (school day)', occ.some((o) => o.id === 'wake-a' && o.at.getDay() === 4 && o.at.getHours() === 6 && o.at.getMinutes() === 30))
check('no wake alarm on Friday (not a school day)', !occ.some((o) => o.id === 'wake-a' && o.at.getDay() === 5))
check('child without wake alarm gets none', !occ.some((o) => o.id === 'wake-b'))
check('switched-off alarm never rings', !occ.some((o) => o.id === 'y'))
check('past times today skipped', occ.every((o) => o.at > from))
check('sorted by time', occ.every((o, i) => !i || occ[i - 1].at <= o.at))
check('unique keys', new Set(occ.map((o) => o.key)).size === occ.length)
console.log(ok.every(Boolean) ? 'PASS' : 'FAIL'); if (!ok.every(Boolean)) process.exit(1)
