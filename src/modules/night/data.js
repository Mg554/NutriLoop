// ---------------------------------------------------------------------------
// "Star Journey" bedtime routine: content + sleep science.
// Sleep need: American Academy of Sleep Medicine consensus (endorsed by AAP):
//   3-5 y: 10-13 h · 6-12 y: 9-12 h · 13-18 y: 8-10 h  (we use the middle)
// Adhkar: authentic hadith only (sources noted next to each).
// ---------------------------------------------------------------------------
const g = (m, f) => ({ m, f })

export const sleepHoursForAge = (age) => (age <= 5 ? 11.5 : age <= 12 ? 10 : 9)
export const sleepRangeForAge = (age) => (age <= 5 ? [10, 13] : age <= 12 ? [9, 12] : [8, 10])

// "HH:MM" helpers
export const toMin = (t) => { const [h, m] = (t || '00:00').split(':').map(Number); return h * 60 + m }
export const fromMin = (n) => { n = ((Math.round(n) % 1440) + 1440) % 1440; return `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}` }
export const bedtimeFor = (child) => child?.bedtime || fromMin(toMin(child?.wake || '06:30') - sleepHoursForAge(child?.age ?? 7) * 60)

// The constellation: each step is a star. x/y are positions on a 100x100 sky.
export const STEPS = [
  { id: 'screens', emoji: '📵', x: 12, y: 62, kind: 'tap', name: { ar: 'طفّي الشاشات', en: 'Screens off' }, how: { ar: g('سكّر التلفزيون والألعاب، عيونك بدها ترتاح', 'سكّري التلفزيون والألعاب، عيونك بدها ترتاح'), en: 'Turn off TV and games, your eyes need rest' } },
  { id: 'bag', emoji: '🎒', x: 24, y: 38, kind: 'tap', school: true, name: { ar: 'جهّز شنطتك', en: 'Pack your bag' }, how: { ar: g('حط كتب بكرة وقلمك بالشنطة', 'حطي كتب بكرة وقلمك بالشنطة'), en: "Put tomorrow's books and pencil in your bag" } },
  { id: 'pajamas', emoji: '👕', x: 38, y: 58, kind: 'tap', name: { ar: 'البس البيجاما', en: 'Pajamas on' }, how: { ar: g('البس بيجامتك المريحة', 'البسي بيجامتك المريحة'), en: 'Put on your comfy pajamas' } },
  { id: 'brush', emoji: '🦷', x: 50, y: 30, kind: 'brush', name: { ar: 'فرّش أسنانك', en: 'Brush teeth' }, how: { ar: 'دقيقتين، كل زاوية نص دقيقة', en: '2 minutes, 30 seconds per corner' } },
  { id: 'wudu', emoji: '💧', x: 62, y: 56, kind: 'tap', name: { ar: 'توضّأ', en: 'Wudu' }, how: { ar: g('توضّأ قبل النوم متل ما علّمنا النبي ﷺ', 'توضّئي قبل النوم متل ما علّمنا النبي ﷺ'), en: 'Make wudu before sleep, like the Prophet ﷺ taught' } },
  { id: 'adhkar', emoji: '🤲', x: 76, y: 34, kind: 'adhkar', name: { ar: 'أذكار النوم', en: 'Bedtime adhkar' }, how: { ar: 'اقرأها مع ماما أو بابا', en: 'Read them with mum or dad' } },
  { id: 'breathe', emoji: '🌬️', x: 86, y: 60, kind: 'breathe', name: { ar: 'تنفّس القمر', en: 'Moon breathing' }, how: { ar: 'خلّي جسمك يهدأ', en: 'Let your body calm down' } },
  { id: 'thanks', emoji: '💛', x: 72, y: 80, kind: 'thanks', name: { ar: 'لحظة امتنان', en: 'Thankful moment' }, how: { ar: 'شو أحلى إشي صار اليوم؟', en: 'What was the best thing today?' } },
]

// Brushing: 4 zones x 30 s (ADA / AAPD: brush 2 minutes, twice a day)
export const BRUSH_ZONES = [
  { id: 'ur', name: { ar: 'فوق يمين', en: 'Top right' } },
  { id: 'ul', name: { ar: 'فوق شمال', en: 'Top left' } },
  { id: 'll', name: { ar: 'تحت شمال', en: 'Bottom left' } },
  { id: 'lr', name: { ar: 'تحت يمين', en: 'Bottom right' } },
]
export const BRUSH_ZONE_SEC = 30

export const ADHKAR = [
  { id: 'bismika', text: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', note: { ar: 'رواه البخاري', en: 'Bukhari' }, count: 1 },
  { id: 'qul', text: 'قُلْ هُوَ اللَّهُ أَحَدٌ · قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ · قُلْ أَعُوذُ بِرَبِّ النَّاسِ', note: { ar: 'السور الثلاث، ٣ مرات، ثم امسح جسمك بكفّيك (رواه البخاري)', en: 'The three surahs, 3 times, then wipe over your body (Bukhari)' }, count: 3 },
  { id: 'tasbih', note: { ar: 'تسبيح فاطمة رضي الله عنها (متفق عليه)', en: "Fatimah's tasbih (Bukhari & Muslim)" }, tasbih: [['سُبْحَانَ اللَّهِ', 33], ['الْحَمْدُ لِلَّهِ', 33], ['اللَّهُ أَكْبَرُ', 34]] },
  { id: 'side', text: 'نام على جنبك اليمين 🛏️', note: { ar: 'من سنّة النبي ﷺ (متفق عليه)', en: 'Sleep on your right side, a sunnah (Bukhari & Muslim)' }, count: 1 },
]

export const GRATITUDE = [
  { id: 'plate', emoji: '🥗', ar: 'أكلت طبق ملوّن', en: 'Ate a colourful plate' },
  { id: 'play', emoji: '⚽', ar: 'لعبت ونشطت', en: 'Played and moved' },
  { id: 'help', emoji: '🧹', ar: 'ساعدت بالبيت', en: 'Helped at home' },
  { id: 'learn', emoji: '📚', ar: 'تعلّمت إشي جديد', en: 'Learned something new' },
  { id: 'family', emoji: '😄', ar: 'ضحكت مع العيلة', en: 'Laughed with family' },
  { id: 'friend', emoji: '👫', ar: 'لعبت مع صاحبي', en: 'Played with a friend' },
  { id: 'pray', emoji: '🕌', ar: 'صلّيت وقرأت قرآن', en: 'Prayed and read Quran' },
  { id: 'art', emoji: '🎨', ar: 'رسمت ولوّنت', en: 'Drew and coloured' },
]

export const NIGHT_STR = {
  ar: {
    nightTitle: 'رحلة النجوم', nightSub: g('ضوّي نجومك وجهّز حالك للنوم', 'ضوّي نجومك وجهّزي حالك للنوم'),
    nightStart: 'يلا نبلّش 🌙', nightContinue: 'كمّل رحلتك', nightDoneCard: g('نمت نومة النجوم الليلة 🌟', 'نمتِ نومة النجوم الليلة 🌟'),
    bedtimeAt: 'وقت النوم', starsLit: 'نجوم مضويّة', doneStep: 'خلّصت ✓', doneStepF: 'خلّصت ✓',
    brushNow: 'فرّش هون', brushNowF: 'فرّشي هون', brushGo: 'بلّش التفريش', brushGoF: 'بلّشي التفريش',
    brushDone: 'أسنانك بتلمع ✨', brushTip: 'حبّة معجون أد حبّة البازيلا، وما تبلع المعجون',
    tapCount: 'اكبس مع كل مرة', breatheIn: 'شهيق… خلّي القمر يكبر', breatheOut: 'زفير… خلّيه يصغر',
    thanksQ: g('شو أحلى إشي صار معك اليوم؟', 'شو أحلى إشي صار معكِ اليوم؟'),
    goodnight: g('تصبح على خير يا {name} 🌙', 'تصبحي على خير يا {name} 🌙'), goodnightSub: 'الله يحفظك ويحرسك لبكرة 🤲',
    finish: 'تصبحوا على خير', constellation: 'كوكبة', nights: 'ليالي النجوم', bestMoments: 'أحلى لحظات الأسبوع',
    wake: 'وقت الصحيان', bedtime: 'وقت النوم', bedSuggest: 'المقترح حسب العمر', sleepNeed: 'ساعات نوم',
  },
  en: {
    nightTitle: 'Star Journey', nightSub: 'Light your stars and get ready for sleep',
    nightStart: "Let's start 🌙", nightContinue: 'Continue', nightDoneCard: 'Star sleep tonight 🌟',
    bedtimeAt: 'Bedtime', starsLit: 'stars lit', doneStep: 'Done ✓', doneStepF: 'Done ✓',
    brushNow: 'Brush here', brushNowF: 'Brush here', brushGo: 'Start brushing', brushGoF: 'Start brushing',
    brushDone: 'Your teeth are shining ✨', brushTip: "A pea-sized bit of toothpaste, and don't swallow it",
    tapCount: 'Tap each time', breatheIn: 'Breathe in… let the moon grow', breatheOut: 'Breathe out… let it shrink',
    thanksQ: 'What was the best thing today?',
    goodnight: 'Good night, {name} 🌙', goodnightSub: 'May Allah protect you until morning 🤲',
    finish: 'Good night', constellation: 'Constellation', nights: 'Star nights', bestMoments: "This week's best moments",
    wake: 'Wake-up time', bedtime: 'Bedtime', bedSuggest: 'Suggested for age', sleepNeed: 'hours of sleep',
  },
}
