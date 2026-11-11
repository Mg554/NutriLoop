// ---------------------------------------------------------------------------
// ⏰ Alarms (parents set them up). Two kinds:
//  - wake: per child, at the child's wake-up time on school days
//  - custom: a label, a time, week days, one child or everyone
// On Android / iPhone each alarm is scheduled as a short burst of 4 loud
// notifications one minute apart (a system notification sound plays once, a
// burst keeps ringing until the child opens the app). Opening it shows the
// full-screen alarm with the looping tone, "Snooze 5 min" and "I'm up!".
// In the browser / on the PC the app itself rings while it is open.
// ---------------------------------------------------------------------------
import { LocalNotifications } from '@capacitor/local-notifications'
import { isIOS, isNative } from './native'

export const ALARM_TONES = [
  { id: 'birds', emoji: '🐦', ar: 'عصافير', en: 'Birds' },
  { id: 'melody', emoji: '🎵', ar: 'لحن الصباح', en: 'Morning tune' },
  { id: 'bells', emoji: '🔔', ar: 'أجراس', en: 'Bells' },
  { id: 'chime', emoji: '🎐', ar: 'هادي', en: 'Soft chime' },
]
export const ALARM_EMOJI = ['⏰', '🏫', '💊', '⚽', '📖', '🕌', '🎹', '🦷', '🧹', '🎒']
export const defaultAlarms = () => ({ tone: 'birds', wake: {}, items: [] })
export const toneUrl = (id) => `./sounds/alarm_${id}.mp3`

const ID_BASE = 8000
const BURST = 4
const DAYS_AHEAD = 3
export const SNOOZE_ID = 8990

// Every alarm ringing in the next `days` days, oldest first.
// -> [{ key, at: Date, label, emoji, child (id|null), kind }]
export function alarmOccurrences(state, from = new Date(), days = DAYS_AHEAD) {
  const cfg = { ...defaultAlarms(), ...(state.settings.alarms || {}) }
  const school = state.settings.reminders?.schoolDays || [0, 1, 2, 3, 4]
  const list = []
  const defs = [
    ...state.children.filter((c) => cfg.wake[c.id]).map((c) => ({ id: 'wake-' + c.id, kind: 'wake', t: c.wake || '06:30', days: school, child: c.id, emoji: '🌅', label: null })),
    ...cfg.items.filter((a) => a.on !== false).map((a) => ({ ...a, kind: 'custom' })),
  ]
  for (let off = 0; off < days; off++) {
    const day = new Date(from)
    day.setDate(day.getDate() + off)
    for (const a of defs) {
      const [hh, mm] = (a.t || '07:00').split(':').map(Number)
      const at = new Date(day)
      at.setHours(hh, mm, 0, 0)
      if (at <= from) continue
      if (!(a.days || []).includes(at.getDay())) continue
      list.push({ key: `${a.id}@${at.toISOString().slice(0, 16)}`, id: a.id, at, label: a.label, emoji: a.emoji || '⏰', child: a.child || null, kind: a.kind })
    }
  }
  return list.sort((x, y) => x.at - y.at)
}

export function alarmTitle(o, state, lang) {
  const c = state.children.find((x) => x.id === o.child)
  if (o.kind === 'wake') return lang === 'ar' ? `صباح الخير${c ? ' يا ' + c.name : ''}! 🌅` : `Good morning${c ? ' ' + c.name : ''}! 🌅`
  return `${o.emoji} ${o.label || (lang === 'ar' ? 'منبه' : 'Alarm')}${c ? ' · ' + c.name : ''}`
}
const alarmBody = (o, lang) => (o.kind === 'wake'
  ? (lang === 'ar' ? 'وقت الصحيان! افتح التطبيق ووقّف المنبه ⏰' : 'Time to wake up! Open the app to stop the alarm ⏰')
  : (lang === 'ar' ? 'افتح التطبيق ووقّف المنبه ⏰' : 'Open the app to stop the alarm ⏰'))

const channels = new Set()
async function ensureChannel(tone) {
  const id = 'alarm_' + tone
  if (isIOS || channels.has(id)) return id
  await LocalNotifications.createChannel({ id, name: `Alarm (${tone})`, description: 'NutriLoop alarms', importance: 5, visibility: 1, sound: `alarm_${tone}.wav`, vibration: true, lights: true, lightColor: '#F2533C' }).catch(() => {})
  channels.add(id)
  return id
}

function notif(id, o, state, tone, at) {
  const lang = state.settings.lang
  return {
    id, title: alarmTitle(o, state, lang), body: alarmBody(o, lang), largeBody: alarmBody(o, lang),
    channelId: 'alarm_' + tone, sound: `alarm_${tone}.wav`, smallIcon: 'ic_stat_nutriloop', iconColor: '#F2533C',
    schedule: { at, allowWhileIdle: true }, autoCancel: true,
    extra: { alarm: o.key, child: o.child, kind: o.kind, label: o.label || '', emoji: o.emoji, ts: o.at.getTime() },
  }
}

// (Re)plan alarms for the next 3 days. Called on start and when state changes.
export async function scheduleAlarms(state) {
  if (!isNative) return 0
  const pending = await LocalNotifications.getPending().catch(() => ({ notifications: [] }))
  const ours = pending.notifications.filter((n) => n.id >= ID_BASE && n.id < ID_BASE + 980)
  if (ours.length) await LocalNotifications.cancel({ notifications: ours.map((n) => ({ id: n.id })) }).catch(() => {})
  const occ = alarmOccurrences(state)
  if (!occ.length) return 0
  if ((await LocalNotifications.checkPermissions()).display !== 'granted') return 0
  const tone = state.settings.alarms?.tone || 'birds'
  await ensureChannel(tone)
  const dismissed = new Set(state.settings.alarms?.dismissed || [])
  const list = []
  occ.slice(0, 40).forEach((o, i) => {
    if (dismissed.has(o.key)) return
    for (let b = 0; b < BURST; b++) list.push(notif(ID_BASE + i * BURST + b, o, state, tone, new Date(o.at.getTime() + b * 60000)))
  })
  if (list.length) await LocalNotifications.schedule({ notifications: list }).catch(() => {})
  return list.length
}

// Stop the rest of a burst once the alarm is handled
export async function stopAlarmBurst(key) {
  if (!isNative) return
  const pending = await LocalNotifications.getPending().catch(() => ({ notifications: [] }))
  const mine = pending.notifications.filter((n) => n.extra?.alarm === key || n.id === SNOOZE_ID)
  if (mine.length) await LocalNotifications.cancel({ notifications: mine.map((n) => ({ id: n.id })) }).catch(() => {})
  await LocalNotifications.removeAllDeliveredNotifications?.().catch(() => {})
}

export async function snoozeAlarm(alarm, state, minutes = 5) {
  if (!isNative) return
  const tone = state.settings.alarms?.tone || 'birds'
  await ensureChannel(tone)
  const o = { ...alarm, at: new Date(Date.now() + minutes * 60000) }
  await LocalNotifications.schedule({ notifications: [notif(SNOOZE_ID, { ...o, key: alarm.key }, state, tone, o.at)] }).catch(() => {})
}

// Alarm arrives while the app is open, or the child taps the notification
export function onAlarm(cb) {
  if (!isNative) return () => {}
  const pick = (n) => n?.extra?.alarm && cb({ key: n.extra.alarm, child: n.extra.child, kind: n.extra.kind, label: n.extra.label, emoji: n.extra.emoji, at: new Date(n.extra.ts) })
  const a = LocalNotifications.addListener('localNotificationReceived', (n) => pick(n))
  const b = LocalNotifications.addListener('localNotificationActionPerformed', (e) => pick(e.notification))
  return () => { a.then((x) => x.remove()); b.then((x) => x.remove()) }
}
