// ---------------------------------------------------------------------------
// System reminders (Android local notifications).
// Instead of fixed repeating alarms, the next 3 days are (re)scheduled every
// time the app opens or progress changes, so TODAY's reminder is skipped when
// it is already done (water goal reached, breakfast plate saved ...).
// The plugin restores pending reminders after a reboot.
// ---------------------------------------------------------------------------
import { LocalNotifications } from '@capacitor/local-notifications'
import { isNative } from './native'
import { todayStr } from './store'
import { fastTimes, ramadanActive } from './modules/ramadan/data'

import { REMINDERS } from './reminderDefaults'
export { REMINDERS, defaultReminders } from './reminderDefaults'

// Texts: m = boy, f = girl, p = several children. {n} = name
const TXT = {
  ar: {
    morning: ['صباح النشاط 🏫', { m: 'صباح الخير يا {n}! دقيقتين روتين الصباح قبل المدرسة 🙆', f: 'صباح الخير يا {n}! دقيقتين روتين الصباح قبل المدرسة 🙆', p: 'صباح الخير يا أبطال! دقيقتين روتين الصباح قبل المدرسة 🙆' }],
    breakfast: ['وقت الفطور 🍳', { m: 'يلا يا {n}، اعمل طبق فطورك وسجّله 🍽️', f: 'يلا يا {n}، اعملي طبق فطورك وسجّليه 🍽️', p: 'يلا يا أبطال، اعملوا أطباق الفطور وسجّلوها 🍽️' }],
    lunch: ['وقت الغدا 🍽️', { m: 'يا {n}، شو في بطبقك اليوم؟ لا تنسى الخضار 🥦', f: 'يا {n}، شو في بطبقك اليوم؟ لا تنسي الخضار 🥦', p: 'شو في بأطباقكم اليوم؟ لا تنسوا الخضار 🥦' }],
    dinner: ['وقت العشا 🌙', { m: 'يا {n}، طبق العشا بستناك! شو رأيك بحصة ألبان؟ 🥛', f: 'يا {n}، طبق العشا بستناكِ! شو رأيك بحصة ألبان؟ 🥛', p: 'أطباق العشا بتستناكم! حصة ألبان؟ 🥛' }],
    water: ['كاسة مي 💧', { m: 'اشرب كاسة مي يا {n}، شاحن المي بستناك', f: 'اشربي كاسة مي يا {n}، شاحن المي بستناكِ', p: 'اشربوا كاسة مي يا أبطال 💧' }],
    suhoor: ['السحور 🥣', { m: 'يا {n}، وقت السحور! بيض أو لبنة وكاستين مي 💧', f: 'يا {n}، وقت السحور! بيض أو لبنة وكاستين مي 💧', p: 'وقت السحور يا أبطال! بروتين وكاستين مي 💧' }],
    iftar: ['قرّب الإفطار 🌅', { m: 'يا {n}، جهّز التمرة وكاسة المي 🌴', f: 'يا {n}، جهّزي التمرة وكاسة المي 🌴', p: 'جهّزوا التمر والمي يا أبطال 🌴' }],
    rwater: ['خطة المي 💧', { m: 'كاسة مي بعد التراويح يا {n}', f: 'كاسة مي بعد التراويح يا {n}', p: 'كاسة مي بعد التراويح يا أبطال' }],
    bedtime: ['رحلة النجوم 🌙', { m: 'يا {n}، النجوم بتستناك! يلا نجهّز للنوم ⭐', f: 'يا {n}، النجوم بتستناكِ! يلا نجهّز للنوم ⭐', p: 'يا أبطال، النجوم بتستناكم! يلا نجهّز للنوم ⭐' }],
    move: ['وقت الحركة ⚡', { m: 'يلا يا {n}! ١٠ دقايق حركة وبتكبر شجرتك 🌳', f: 'يلا يا {n}! ١٠ دقايق حركة وبتكبر شجرتك 🌳', p: 'يلا يا أبطال! ١٠ دقايق حركة وبتكبر شجرتكم 🌳' }],
  },
  en: {
    morning: ['Morning boost 🏫', { m: 'Good morning {n}! Two minutes of morning stretches before school 🙆', f: 'Good morning {n}! Two minutes of morning stretches before school 🙆', p: 'Good morning heroes! Two minutes of morning stretches 🙆' }],
    breakfast: ['Breakfast time 🍳', { m: 'Build your breakfast plate, {n} 🍽️', f: 'Build your breakfast plate, {n} 🍽️', p: 'Build your breakfast plates, heroes 🍽️' }],
    lunch: ['Lunch time 🍽️', { m: "What's on your plate, {n}? Don't forget veggies 🥦", f: "What's on your plate, {n}? Don't forget veggies 🥦", p: "What's on your plates? Don't forget veggies 🥦" }],
    dinner: ['Dinner time 🌙', { m: 'Your dinner plate is waiting, {n}! A dairy serving? 🥛', f: 'Your dinner plate is waiting, {n}! A dairy serving? 🥛', p: 'Dinner plates are waiting! A dairy serving? 🥛' }],
    water: ['Water time 💧', { m: 'Drink a glass of water, {n}', f: 'Drink a glass of water, {n}', p: 'Drink a glass of water, heroes 💧' }],
    suhoor: ['Suhoor 🥣', { m: 'Suhoor time, {n}! Eggs or labneh and two glasses of water 💧', f: 'Suhoor time, {n}! Eggs or labneh and two glasses of water 💧', p: 'Suhoor time, heroes! Protein and two glasses of water 💧' }],
    iftar: ['Iftar is close 🌅', { m: 'Get your date and water ready, {n} 🌴', f: 'Get your date and water ready, {n} 🌴', p: 'Get the dates and water ready, heroes 🌴' }],
    rwater: ['Water plan 💧', { m: 'A glass of water after taraweeh, {n}', f: 'A glass of water after taraweeh, {n}', p: 'A glass of water after taraweeh, heroes' }],
    bedtime: ['Star Journey 🌙', { m: 'The stars are waiting, {n}! Time to get ready for bed ⭐', f: 'The stars are waiting, {n}! Time to get ready for bed ⭐', p: 'The stars are waiting, heroes! Time for bed ⭐' }],
    move: ['Move time ⚡', { m: 'Come on {n}! 10 minutes of moving grows your tree 🌳', f: 'Come on {n}! 10 minutes of moving grows your tree 🌳', p: '10 minutes of moving, heroes! 🌳' }],
  },
}
const textKey = (r) => (r.water ? 'water' : r.id)

export function reminderText(r, children, lang) {
  const [title, body] = TXT[lang][textKey(r)]
  const form = children.length === 1 ? (children[0].gender === 'f' ? 'f' : 'm') : 'p'
  return { title, body: body[form].replace('{n}', children[0]?.name || '') }
}

// Is this reminder already done today by EVERY child?
function doneToday(r, state) {
  const d = todayStr()
  return state.children.every((c) => {
    const p = state.progress[c.id]
    const h = p?.history?.[d]
    const day = p?.day?.date === d ? p.day : null
    if (r.meal) return (h?.plates || 0) >= r.meal
    if (r.water) return !!day?.waterHit
    if (r.move) return !!day?.moveHit
    if (r.school) return (h?.move || 0) > 0
    if (r.night) return !!day?.night?.done
    if (r.id === 'rwater') return !!day?.rwater?.after
    return false
  })
}

const ID_BASE = 7000
const DAYS_AHEAD = 3
let channelReady = false

export async function enableNotifications() {
  if (!isNative) return 'web'
  let p = await LocalNotifications.checkPermissions()
  if (p.display !== 'granted') p = await LocalNotifications.requestPermissions()
  return p.display
}

export async function scheduleReminders(state) {
  if (!isNative) return
  const cfg = state.settings.reminders
  const pending = await LocalNotifications.getPending().catch(() => ({ notifications: [] }))
  const ours = pending.notifications.filter((n) => n.id >= ID_BASE && n.id < ID_BASE + 1000)
  if (ours.length) await LocalNotifications.cancel({ notifications: ours.map((n) => ({ id: n.id })) }).catch(() => {})
  if (!cfg?.on || !state.children.length) return
  if ((await LocalNotifications.checkPermissions()).display !== 'granted') return

  if (!channelReady) {
    await LocalNotifications.createChannel({ id: 'reminders', name: 'تذكيرات NutriLoop', description: 'Meals, water and movement', importance: 4, visibility: 1, vibration: true, lights: true, lightColor: '#F2533C' }).catch(() => {})
    channelReady = true
  }
  const lang = state.settings.lang
  const now = Date.now()
  const list = []
  for (let off = 0; off < DAYS_AHEAD; off++) {
    REMINDERS.forEach((r, i) => {
      const it = cfg.items[r.id] || { on: true, t: r.def } // reminders added in later versions default to on
      if (!it?.on) return
      const day = new Date()
      day.setDate(day.getDate() + off)
      day.setHours(12, 0, 0, 0)
      const rDay = ramadanActive(state.settings.ramadan, day)
      let at
      if (r.ramadan) {
        if (!rDay) return
        const ft = fastTimes(state.settings.ramadan, day)
        at = new Date(ft[r.ramadan].getTime() + r.offset * 60000)
      } else {
        // on Ramadan days the daytime meal / water / movement reminders pause
        if (rDay && (r.meal || r.water || r.move)) return
        const [hh, mm] = it.t.split(':').map(Number)
        at = new Date(day)
        at.setHours(hh, mm, 0, 0)
      }
      if (at.getTime() < now + 60000) return
      if (r.school && !cfg.schoolDays.includes(at.getDay())) return
      if (off === 0 && doneToday(r, state)) return
      const { title, body } = reminderText(r, state.children, lang)
      list.push({
        id: ID_BASE + off * 50 + i,
        title, body, largeBody: body,
        channelId: 'reminders',
        smallIcon: 'ic_stat_nutriloop',
        iconColor: '#F2533C',
        schedule: { at, allowWhileIdle: true },
        extra: { tab: r.tab, child: state.children.length === 1 ? state.children[0].id : null },
      })
    })
  }
  if (list.length) await LocalNotifications.schedule({ notifications: list }).catch(() => {})
  return list.length
}

export async function testReminder(state) {
  if (!isNative) return
  const r = REMINDERS[1]
  const { title, body } = reminderText(r, state.children.length ? state.children : [{ name: '', gender: 'm' }], state.settings.lang)
  await LocalNotifications.schedule({
    notifications: [{ id: ID_BASE + 999, title, body, channelId: 'reminders', smallIcon: 'ic_stat_nutriloop', iconColor: '#F2533C', schedule: { at: new Date(Date.now() + 5000), allowWhileIdle: true }, extra: { tab: 'plate', child: state.children.length === 1 ? state.children[0].id : null } }],
  })
}

// Tapping a reminder opens the right tab.
export function onReminderTap(cb) {
  if (!isNative) return () => {}
  const h = LocalNotifications.addListener('localNotificationActionPerformed', (e) => cb(e.notification?.extra || {}))
  return () => h.then((x) => x.remove())
}
