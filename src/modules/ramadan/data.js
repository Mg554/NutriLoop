// ---------------------------------------------------------------------------
// Ramadan mode: calendar, prayer times, content.
// Hijri date: Intl 'islamic-umalqura' (offline) + a parent offset (-1..+1 day)
// for local moon sighting. Prayer times: adhan (astronomical, offline).
// Children are not obliged to fast; "bird fasting" (part of the day) is the
// usual way kids practise. Nothing here shames a child for not fasting.
// ---------------------------------------------------------------------------
import { CalculationMethod, Coordinates, PrayerTimes } from 'adhan'

const g = (m, f) => ({ m, f })

// ---- Hijri ------------------------------------------------------------------
const fmt = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { year: 'numeric', month: 'numeric', day: 'numeric' })
export function hijri(date = new Date(), offset = 0) {
  const d = new Date(date)
  d.setDate(d.getDate() + offset)
  const [m, day, y] = fmt.format(d).replace(' AH', '').split('/').map(Number)
  return { y, m, d: day }
}
export const isRamadanDay = (date, offset) => hijri(date, offset).m === 9
export const isEidDay = (date, offset) => { const h = hijri(date, offset); return h.m === 10 && h.d <= 3 }
// days until 1 Ramadan (0 = today is in Ramadan, null = more than 40 days away)
export function daysToRamadan(date = new Date(), offset = 0) {
  for (let i = 0; i <= 40; i++) {
    const d = new Date(date)
    d.setDate(d.getDate() + i)
    if (hijri(d, offset).m === 9) return i
  }
  return null
}

// ---- cities & prayer times ---------------------------------------------------------
export const CITIES = [
  { id: 'hebron', ar: 'الخليل', en: 'Hebron', lat: 31.5326, lng: 35.0998 },
  { id: 'jerusalem', ar: 'القدس', en: 'Jerusalem', lat: 31.7683, lng: 35.2137 },
  { id: 'bethlehem', ar: 'بيت لحم', en: 'Bethlehem', lat: 31.7054, lng: 35.2024 },
  { id: 'ramallah', ar: 'رام الله', en: 'Ramallah', lat: 31.9038, lng: 35.2034 },
  { id: 'nablus', ar: 'نابلس', en: 'Nablus', lat: 32.2211, lng: 35.2544 },
  { id: 'jenin', ar: 'جنين', en: 'Jenin', lat: 32.4597, lng: 35.3009 },
  { id: 'tulkarm', ar: 'طولكرم', en: 'Tulkarm', lat: 32.3104, lng: 35.0286 },
  { id: 'qalqilya', ar: 'قلقيلية', en: 'Qalqilya', lat: 32.1897, lng: 34.9706 },
  { id: 'jericho', ar: 'أريحا', en: 'Jericho', lat: 31.8667, lng: 35.45 },
  { id: 'gaza', ar: 'غزة', en: 'Gaza', lat: 31.5017, lng: 34.4668 },
  { id: 'amman', ar: 'عمّان', en: 'Amman', lat: 31.9539, lng: 35.9106 },
]
export const METHODS = {
  egyptian: { ar: 'الهيئة المصرية', en: 'Egyptian Authority', fn: () => CalculationMethod.Egyptian() },
  mwl: { ar: 'رابطة العالم الإسلامي', en: 'Muslim World League', fn: () => CalculationMethod.MuslimWorldLeague() },
  ummalqura: { ar: 'أم القرى', en: 'Umm al-Qura', fn: () => CalculationMethod.UmmAlQura() },
  karachi: { ar: 'كراتشي (١٨°)', en: 'Karachi (18°)', fn: () => CalculationMethod.Karachi() },
}
export const defaultRamadan = () => ({ mode: 'auto', city: 'hebron', method: 'egyptian', hijriOffset: 0, fajrAdj: 0, maghribAdj: 0 })

// fajr (= end of suhoor) and maghrib (= iftar) for a date, in local time
export function fastTimes(cfg, date = new Date()) {
  const c = CITIES.find((x) => x.id === cfg.city) || CITIES[0]
  const params = (METHODS[cfg.method] || METHODS.egyptian).fn()
  const t = new PrayerTimes(new Coordinates(c.lat, c.lng), date, params)
  const fajr = new Date(t.fajr.getTime() + (cfg.fajrAdj || 0) * 60000)
  const maghrib = new Date(t.maghrib.getTime() + (cfg.maghribAdj || 0) * 60000)
  return { fajr, maghrib, isha: t.isha }
}
// Arabic count of days with the right plural: يوم / يومين / ٣ أيام / ١١ يوم
export function daysText(n, lang) {
  if (lang !== 'ar') return `${n} day${n === 1 ? '' : 's'}`
  const d = n.toLocaleString('ar-EG')
  return n === 1 ? 'يوم واحد' : n === 2 ? 'يومين' : n <= 10 ? `${d} أيام` : `${d} يوم`
}
export const hhmm = (d) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`

// Is Ramadan mode active today? mode: auto (by calendar) | on | off
export const ramadanActive = (cfg, date = new Date()) =>
  cfg?.mode === 'on' || (cfg?.mode !== 'off' && isRamadanDay(date, cfg?.hijriOffset || 0))

// ---- content -------------------------------------------------------------------
export const FAST_CHOICES = [
  { id: 'full', emoji: '🌙', ar: 'صمت اليوم كامل', en: 'Fasted the whole day', xp: 40 },
  { id: 'bird', emoji: '🐦', ar: 'صيام عصافير', en: 'Bird fasting (part of the day)', xp: 25 },
  { id: 'none', emoji: '💧', ar: 'ما صمت اليوم', en: "Didn't fast today", xp: 0 },
]

export const IFTAR_DUA = { text: 'ذَهَبَ الظَّمَأُ، وَابْتَلَّتِ الْعُرُوقُ، وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ', note: { ar: 'دعاء الإفطار (رواه أبو داود، حسن)', en: 'Dua for breaking the fast (Abu Dawud, hasan)' } }

// Plate guidance for children (nursing view: hydration + slow energy + protein)
export const IFTAR_TIPS = {
  ar: ['ابدأ بتمرة وكاسة مي، متل ما كان يفطر النبي ﷺ', 'بعدها شوربة دافية (عدس أو خضار)', 'طبق متوازن: خضار، بروتين، نشويات', 'كُل على مهلك، ومعدتك بتشكرك'],
  en: ['Start with a date and a glass of water, as the Prophet ﷺ did', 'Then a warm soup (lentil or vegetable)', 'A balanced plate: veggies, protein, grains', 'Eat slowly, your tummy will thank you'],
}
export const SUHOOR_TIPS = {
  ar: ['شوفان أو خبز أسمر: طاقة بطيئة لطول النهار', 'بيض أو لبنة أو فول: بروتين بيشبّع', 'خيار وبندورة: مي وفيتامينات', 'قلّل المالح والحلو كتير، بيعطّشوا', 'كاستين مي قبل الفجر'],
  en: ['Oats or brown bread: slow energy for the day', 'Eggs, labneh or fava beans: filling protein', 'Cucumber and tomato: water and vitamins', 'Go easy on salty and very sweet food, they make you thirsty', 'Two glasses of water before fajr'],
}
export const WATER_PLAN = [
  { id: 'iftar', emoji: '🌅', ar: 'عند الإفطار', en: 'At iftar' },
  { id: 'after', emoji: '🕌', ar: 'بعد التراويح', en: 'After taraweeh' },
  { id: 'bed', emoji: '🌙', ar: 'قبل النوم', en: 'Before bed' },
  { id: 'suhoor', emoji: '🥣', ar: 'بالسحور', en: 'At suhoor' },
]

// Ramadan quests (replace the normal pool during Ramadan)
export const RAMADAN_QUESTS = [
  { id: 'r-dates', emoji: '🌴', xp: 20, title: { ar: 'إفطار السنّة', en: 'Sunnah iftar' }, desc: { ar: g('افطر على تمرة ومي', 'افطري على تمرة ومي'), en: 'Break your fast with a date and water' } },
  { id: 'r-suhoor', emoji: '🥚', xp: 25, title: { ar: 'سحور البطل', en: "Hero's suhoor" }, desc: { ar: g('خلّي سحورك فيه بروتين (بيض، لبنة، فول)', 'خلّي سحورك فيه بروتين (بيض، لبنة، فول)'), en: 'Have protein at suhoor (eggs, labneh, beans)' } },
  { id: 'r-help', emoji: '🍽️', xp: 30, title: { ar: 'مساعد الإفطار', en: 'Iftar helper' }, desc: { ar: g('ساعد بتجهيز سفرة الإفطار', 'ساعدي بتجهيز سفرة الإفطار'), en: 'Help set the iftar table' } },
  { id: 'r-share', emoji: '🤝', xp: 30, title: { ar: 'فطّر صايم', en: 'Share iftar' }, desc: { ar: g('شارك أكل مع جيرانك أو صاحبك', 'شاركي أكل مع جيرانك أو صاحبتك'), en: 'Share food with a neighbour or friend' } },
  { id: 'r-quran', emoji: '📖', xp: 30, title: { ar: 'صفحة نور', en: 'A page of light' }, desc: { ar: g('اقرأ صفحة قرآن مع حدا من العيلة', 'اقرئي صفحة قرآن مع حدا من العيلة'), en: 'Read a page of Quran with family' } },
  { id: 'r-dua', emoji: '🤲', xp: 20, title: { ar: 'دعاء الإفطار', en: 'Iftar dua' }, desc: { ar: g('قول دعاء الإفطار قبل ما تاكل', 'قولي دعاء الإفطار قبل ما تاكلي'), en: 'Say the iftar dua before eating' } },
  { id: 'r-water', emoji: '💧', xp: 25, title: { ar: 'خطة المي', en: 'Water plan' }, desc: { ar: g('اشرب ٤ كاسات بين الإفطار والسحور', 'اشربي ٤ كاسات بين الإفطار والسحور'), en: 'Drink 4 glasses between iftar and suhoor' } },
  { id: 'r-kind', emoji: '💛', xp: 20, title: { ar: 'كلمة حلوة', en: 'Kind word' }, desc: { ar: g('قول كلمة حلوة لكل واحد بالعيلة', 'قولي كلمة حلوة لكل واحد بالعيلة'), en: 'Say something kind to everyone at home' } },
  { id: 'r-taraweeh', emoji: '🕌', xp: 30, title: { ar: 'ليلة التراويح', en: 'Taraweeh night' }, desc: { ar: g('صلّي ركعتين تراويح مع العيلة', 'صلّي ركعتين تراويح مع العيلة'), en: 'Pray two rakaat of taraweeh with family' } },
]

export const RAMADAN_STR = {
  ar: {
    ramadan: 'رمضان', ramadanKareem: 'رمضان كريم 🌙', ramadanDay: 'يوم {n} من رمضان', ramadanSoon: 'باقي {n} على رمضان 🌙',
    fastQ: g('كيف كان صيامك اليوم؟', 'كيف كان صيامك اليوم؟'), lanterns: 'فوانيسي',
    iftarAt: 'الإفطار', suhoorUntil: 'السحور لحد', toIftar: 'باقي على الإفطار', iftarTime: 'وقت الإفطار! 🎉',
    iftarPlate: 'طبق الإفطار', suhoorPlate: 'طبق السحور', waterPlan: 'خطة المي', iftarDua: 'دعاء الإفطار',
    eid: 'عيد مبارك! 🎉', eidSub: g('كل عام وإنت بخير يا {name}', 'كل عام وإنتِ بخير يا {name}'),
    rSettings: 'وضع رمضان', rMode: 'التشغيل', rAuto: 'تلقائي', rOn: 'شغّال', rOff: 'مطفي', rCity: 'المدينة', rMethod: 'طريقة الحساب',
    rOffset: 'تعديل التاريخ الهجري', rAdj: 'تعديل دقائق', rFajr: 'الفجر', rMaghrib: 'المغرب', rFasted: 'أيام الصيام',
  },
  en: {
    ramadan: 'Ramadan', ramadanKareem: 'Ramadan Kareem 🌙', ramadanDay: 'Day {n} of Ramadan', ramadanSoon: '{n} to Ramadan 🌙',
    fastQ: 'How was your fast today?', lanterns: 'My lanterns',
    iftarAt: 'Iftar', suhoorUntil: 'Suhoor until', toIftar: 'Until iftar', iftarTime: 'Iftar time! 🎉',
    iftarPlate: 'Iftar plate', suhoorPlate: 'Suhoor plate', waterPlan: 'Water plan', iftarDua: 'Iftar dua',
    eid: 'Eid Mubarak! 🎉', eidSub: 'Happy Eid, {name}',
    rSettings: 'Ramadan mode', rMode: 'Mode', rAuto: 'Auto', rOn: 'On', rOff: 'Off', rCity: 'City', rMethod: 'Method',
    rOffset: 'Hijri date adjustment', rAdj: 'Minute adjustment', rFajr: 'Fajr', rMaghrib: 'Maghrib', rFasted: 'Days fasted',
  },
}
