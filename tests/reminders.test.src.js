import { scheduleReminders, defaultReminders, REMINDERS } from '../src/reminders'
import { scheduled } from './mocks/local-notifications'
import { todayStr } from '../src/store'

const d = todayStr()
const base = (over = {}) => ({
  settings: { lang: 'ar', reminders: { ...defaultReminders(), on: true, schoolDays: [0, 1, 2, 3, 4, 5, 6] } },
  children: [{ id: 'a', name: 'تولين', gender: 'f' }],
  progress: { a: { history: { [d]: { plates: 0, move: 0 } }, day: { date: d, waterHit: false, moveHit: false } } },
  ...over,
})
// freeze "now" at 06:00 today so every reminder today is still in the future
const real = Date.now
const six = new Date(); six.setHours(6, 0, 0, 0)
Date.now = () => six.getTime()
const ok = []
const check = (name, cond, info = '') => { ok.push(cond); console.log(cond ? '✓' : '✗', name, info) }
const todays = () => scheduled.filter((n) => new Date(n.schedule.at).toDateString() === six.toDateString()).map((n) => n.id - 7000)

await scheduleReminders(base())
const N = REMINDERS.length
check(`${N} reminders x 3 days`, scheduled.length === N * 3, scheduled.length)
check('girl wording', scheduled[1].body.includes('اعملي') && scheduled[1].body.includes('تولين'), scheduled[1].body)

const s2 = base(); s2.progress.a.history[d].plates = 2; s2.progress.a.day.waterHit = true
await scheduleReminders(s2)
check('breakfast+lunch+both waters skipped today (plates 2, water done)', JSON.stringify(todays()) === JSON.stringify([0, 5, 6, 7]), todays())
check('old reminders replaced, not duplicated', scheduled.length === N * 3 - 4, scheduled.length)

const s3 = base(); s3.settings.reminders.schoolDays = []
await scheduleReminders(s3)
check('no school days -> no morning reminders', !scheduled.some((n) => (n.id - 7000) % 50 === 0), scheduled.length)

const s4 = base({ children: [{ id: 'a', name: 'تولين', gender: 'f' }, { id: 'b', name: 'آدم', gender: 'm' }] })
s4.progress.b = { history: { [d]: { plates: 1 } }, day: { date: d } }; s4.progress.a.history[d].plates = 1
await scheduleReminders(s4)
check('2 kids -> plural text, no single-child deep link', scheduled[0].body.includes('أبطال') && scheduled[0].extra.child === null, scheduled[0].body)
check('breakfast skipped only when BOTH kids ate', !todays().includes(1))

const s5 = base(); s5.settings.reminders.on = false
await scheduleReminders(s5)
check('turning reminders off cancels everything', scheduled.length === 0)
Date.now = real
// a saved config from an older version (no 'bedtime' item) still gets the new reminder
const s6 = base(); delete s6.settings.reminders.items.bedtime
await scheduleReminders(s6)
check('new reminder types default to on for old saved settings', scheduled.some((n) => (n.id - 7000) % 50 === 7))
const s7 = base(); s7.progress.a.day.night = { done: true }
await scheduleReminders(s7)
check('bedtime reminder skipped once tonight is done', !todays().includes(7), todays())
const pass = ok.every(Boolean); console.log(pass ? 'PASS' : 'FAIL'); process.exit(pass ? 0 : 1)
