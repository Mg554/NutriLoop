// Weekly parent report (behind the PIN). Shows the last 7 days for one child:
// what went well, 1-2 things to focus on with a practical tip, food groups vs
// the age target, a 7-day habit grid, and a share / print button.
import { useState } from 'react'
import { Share } from '@capacitor/share'
import { isNative } from '../../native'
import { useT } from '../../ui'
import { GRATITUDE } from '../night/data'
import { weekReport } from './weekStats'

const ICON = { veg: '🥦', fruit: '🍎', grain: '🍞', protein: '🥚', dairy: '🥛' }
const GNAME = {
  ar: { veg: 'الخضار', fruit: 'الفواكه', grain: 'النشويات', protein: 'البروتين', dairy: 'الألبان' },
  en: { veg: 'Veggies', fruit: 'Fruit', grain: 'Grains', protein: 'Protein', dairy: 'Dairy' },
}
const MEAL = { ar: { breakfast: 'الفطور', lunch: 'الغدا', dinner: 'العشا' }, en: { breakfast: 'breakfast', lunch: 'lunch', dinner: 'dinner' } }
const n1 = (x) => (x == null ? '—' : (Math.round(x * 10) / 10).toString())
// Arabic: Arabic-Indic digits and counted nouns (يوم / يومين / ٣ أيام / ١١ يوم)
const arDigits = (v) => (typeof v === 'string' ? v.replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]).replace(/(\d)\.(\d)/g, '$1٫$2').replace(/([٠-٩])\.([٠-٩])/g, '$1٫$2') : v)
const cnt = (n, [one, two, few, many]) => (n === 1 ? one : n === 2 ? two : n >= 3 && n <= 10 ? `${n} ${few}` : `${n} ${many}`)
const DAYS_AR = ['يوم واحد', 'يومين', 'أيام', 'يوم']
const NIGHTS_AR = ['ليلة وحدة', 'ليلتين', 'ليالي', 'ليلة']
const FOODS_AR = ['أكلة جديدة', 'أكلتين جداد', 'أكلات جديدة', 'أكلة جديدة']

// Texts. G(m, f) picks the child's grammatical gender (Arabic).
function texts(lang, child, r) {
  const f = child.gender === 'f'
  const G = (m, fm) => (f ? fm : m)
  const name = child.name
  const ar = lang === 'ar'
  const D = (v) => (ar ? arDigits(v) : v)
  const c = r.cur
  const list = (xs) => (xs.length < 2 ? xs[0] : xs.slice(0, -1).join(ar ? '، ' : ', ') + (ar ? ' و' : ' and ') + xs[xs.length - 1])
  const foodWin = (gs) => (ar ? `${gs.map((g) => ICON[g]).join('')} ${list(gs.map((g) => GNAME.ar[g]))}: ${gs.length > 1 ? 'وصلوا' : 'وصلت'} للهدف اليومي 👏` : `${gs.map((g) => ICON[g]).join('')} ${list(gs.map((g) => GNAME.en[g]))}: daily target reached 👏`)
  const WIN = {
    water: ar ? `💧 ${G('وصل', 'وصلت')} لهدف المي ${c.waterDays} من 7 أيام` : `💧 Reached the water goal on ${c.waterDays} of 7 days`,
    move: ar ? `⚡ ${G('حقّق', 'حقّقت')} هدف الحركة ${c.moveDays} من 7 أيام` : `⚡ Met the movement goal on ${c.moveDays} of 7 days`,
    nights: ar ? `🌙 ${G('خلّص', 'خلّصت')} رحلة النجوم ${cnt(c.nights, NIGHTS_AR)}` : `🌙 Finished the Star Journey on ${c.nights} nights`,
    newFoods: ar ? `🆕 ${G('جرّب', 'جرّبت')} ${cnt(r.newFoods.length, FOODS_AR)} لأول مرة` : `🆕 Tried ${r.newFoods.length} new foods for the first time`,
    fasts: ar ? `🏮 ${G('صام', 'صامت')} ${cnt(c.fastFull, DAYS_AR)} كاملة و${c.fastBird} صيام عصافير` : `🏮 Fasted ${c.fastFull} full days and ${c.fastBird} bird fasts`,
  }
  const FOCUS = {
    'g-veg': [ar ? `🥦 الخضار أقل من الهدف (${n1(c.servAvg.veg)} من ${r.target.veg} باليوم)` : `🥦 Veggies below target (${n1(c.servAvg.veg)} of ${r.target.veg} a day)`,
      ar ? `حطّوا كمية صغيرة من الخضار أول شي بالطبق، وخلّوا خيار وجزر مقطّع جاهز قبل الأكل. الطفل أحيانًا بيحتاج يشوف الصنف ويذوقه ٨ لـ١٥ مرة لحتى يتقبّله، فلا تستسلموا بسرعة.` : 'Put a small amount of veggies on the plate first and keep cut cucumber and carrots ready before meals. Children may need 8 to 15 tastes of a food before accepting it, so keep offering.'],
    'g-fruit': [ar ? `🍎 الفواكه أقل من الهدف (${n1(c.servAvg.fruit)} من ${r.target.fruit} باليوم)` : `🍎 Fruit below target (${n1(c.servAvg.fruit)} of ${r.target.fruit} a day)`,
      ar ? 'خلّوا صحن فواكه مقطّعة على مستوى نظر الطفل؛ اللي بيشوفه بياكله. الفاكهة الكاملة أحسن من العصير.' : 'Keep a bowl of cut fruit at eye level: what children see, they eat. Whole fruit beats juice.'],
    'g-dairy': [ar ? `🥛 الألبان أقل من الهدف (${n1(c.servAvg.dairy)} من ${r.target.dairy} باليوم)` : `🥛 Dairy below target (${n1(c.servAvg.dairy)} of ${r.target.dairy} a day)`,
      ar ? 'كاسة حليب مع الفطور أو لبن مع العشا بتسكّر الحصة بسهولة. الجبنة واللبنة بينحسبوا كمان.' : 'A glass of milk at breakfast or yogurt at dinner closes the gap easily. Cheese and labneh count too.'],
    'g-protein': [ar ? `🥚 البروتين أقل من الهدف (${n1(c.servAvg.protein)} من ${r.target.protein} باليوم)` : `🥚 Protein below target (${n1(c.servAvg.protein)} of ${r.target.protein} a day)`,
      ar ? 'بيضة على الفطور، أو حمص وعدس وفول مع الغدا. البقوليات بروتين ممتاز ورخيص.' : 'An egg at breakfast, or hummus, lentils or beans at lunch. Legumes are cheap, excellent protein.'],
    'grain-high': [ar ? `🍞 النشويات أكثر من اللازم (${n1(c.servAvg.grain)} باليوم والهدف ${r.target.grain})` : `🍞 More grains than needed (${n1(c.servAvg.grain)} a day, target ${r.target.grain})`,
      ar ? 'خلّوا نص الطبق خضار وفواكه، وجرّبوا خبز القمح الكامل بدل الأبيض.' : 'Make half the plate veggies and fruit, and try whole-wheat bread instead of white.'],
    log: [ar ? `📝 الأطباق انسجّلت ${c.loggedDays ? cnt(c.loggedDays, DAYS_AR) : 'ولا يوم'} بس هالأسبوع` : `📝 Plates were logged on only ${c.loggedDays} days`,
      ar ? `التقرير بيصير أدق لما ${G('يسجّل', 'تسجّل')} ${name} أطباقه ٣ أيام على الأقل. ${G('ذكّروه', 'ذكّروها')} يسجّل بعد الأكل مباشرة، أو شغّلوا تذكيرات الوجبات.` : `The report gets accurate once ${name} logs plates on at least 3 days. A reminder right after meals helps.`],
    water: [ar ? `💧 هدف المي تحقّق ${c.waterDays ? cnt(c.waterDays, DAYS_AR) : 'ولا يوم'} بس` : `💧 Water goal reached on only ${c.waterDays} days`,
      ar ? 'قنينة مي خاصة فيه بمكان واضح، وكاسة مي مع كل وجبة. تذكيرات المي بتساعد.' : 'A personal water bottle in sight and a glass with every meal. Water reminders help.'],
    move: [ar ? `⚡ الحركة معدلها ${Math.round(c.moveAvg)} دقيقة باليوم من ${c.goalMove}` : `⚡ Movement averaged ${Math.round(c.moveAvg)} min a day of ${c.goalMove}`,
      ar ? 'منظمة الصحة العالمية بتوصي بمعدل ٦٠ دقيقة حركة باليوم للأطفال من ٥ لـ١٧ سنة. ابدأوا بـ١٠ دقايق بعد المدرسة، والعبوا مع بعض.' : 'WHO recommends an average of 60 minutes of activity a day for ages 5 to 17. Start with 10 minutes after school, together.'],
    nights: [ar ? `🌙 رحلة النجوم ${c.nights ? cnt(c.nights, NIGHTS_AR) : 'ولا ليلة'} بس` : `🌙 Star Journey on only ${c.nights} nights`,
      ar ? 'روتين نوم ثابت بنفس الوقت كل ليلة بيحسّن النوم. خلّوا رحلة النجوم آخر شي، بعد الشاشات.' : 'A steady bedtime routine at the same time each night improves sleep. Make the Star Journey the last thing, after screens.'],
    late: [ar ? `⏰ الرحلة بتخلص متأخرة حوالي ${r.lateBy} دقيقة` : `⏰ The journey ends about ${r.lateBy} min late`,
      ar ? `معدل الانتهاء ${c.bedAvg} والوقت المقترح ${r.bedtime}. جرّبوا تبلّشوا الرحلة أبكر بربع ساعة كل كم يوم.` : `Average finish ${c.bedAvg}, suggested ${r.bedtime}. Try starting 15 minutes earlier every few days.`],
    vegMeal: [ar ? `🥗 الخضار ناقصة غالبًا ب${MEAL.ar[r.vegGap]}` : `🥗 Veggies are often missing at ${MEAL.en[r.vegGap]}`,
      ar ? { breakfast: 'خيار وبندورة ونعنع جنب الفطور بياخدوا دقيقة.', lunch: 'صحن سلطة صغير جنب الغدا، أو خضار مطبوخة مع الطبخة.', dinner: 'أصابع جزر وخيار وفلفل مع العشا.' }[r.vegGap]
        : { breakfast: 'Cucumber, tomato and mint next to breakfast take a minute.', lunch: 'A small salad next to lunch, or veggies cooked into the main dish.', dinner: 'Carrot, cucumber and pepper sticks with dinner.' }[r.vegGap]],
  }
  return {
    win: (w) => D(w.groups ? foodWin(w.groups) : WIN[w.id]),
    focus: (x) => (x.g ? FOCUS[`g-${x.g}`] : FOCUS[x.id]).map(D),
    hero: D(ar ? `${G('كان نشيط', 'كانت نشيطة')} ${c.activeDays} من 7 أيام` : `Active on ${c.activeDays} of 7 days`),
  }
}

export function shareText(lang, child, r) {
  const T = texts(lang, child, r)
  const ar = lang === 'ar'
  const fmt = (d) => new Date(d + 'T12:00').toLocaleDateString(ar ? 'ar' : 'en', { day: 'numeric', month: 'short' })
  const c = r.cur
  const lines = [
    `📊 ${ar ? 'تقرير أسبوع' : 'Weekly report:'} ${child.name} ${child.avatar || ''}`,
    `${fmt(r.days[0])} – ${fmt(r.days[6])}`,
    '',
    `🍽️ ${c.plates} ${ar ? 'أطباق' : 'plates'} · 💧 ${c.waterDays}/7 · ⚡ ${Math.round(c.moveAvg)} ${ar ? 'د/يوم' : 'min/day'} · 🌙 ${c.nights}/7`,
  ]
  if (r.wins.length) lines.push('', ar ? '🌟 أحلى إشي:' : '🌟 Wins:', ...r.wins.map((w) => '• ' + T.win(w)))
  if (r.focus.length) lines.push('', ar ? '🎯 نركّز الأسبوع الجاي على:' : '🎯 Focus next week:', ...r.focus.map((x) => '• ' + T.focus(x)[0] + '\n  ' + T.focus(x)[1]))
  lines.push('', 'NutriLoop 🌱')
  return lines.join('\n')
}

export default function ReportView({ child, progress, onBack, toast }) {
  const { lang } = useT()
  const ar = lang === 'ar'
  const A = (a, e) => (ar ? a : e)
  const [back, setBack] = useState(0) // weeks back
  const end = new Date(); end.setDate(end.getDate() - back * 7)
  const r = weekReport(child, progress, end)
  const T = texts(lang, child, r)
  const c = r.cur
  const fmtDay = (d, o) => new Date(d + 'T12:00').toLocaleDateString(ar ? 'ar' : 'en', o)

  const share = async () => {
    const text = shareText(lang, child, r)
    try {
      if (isNative) await Share.share({ title: 'NutriLoop', text, dialogTitle: 'NutriLoop' })
      else if (navigator.share) await navigator.share({ text })
      else { await navigator.clipboard.writeText(text); toast?.(A('تم نسخ التقرير ✅', 'Report copied ✅')) }
    } catch { /* user cancelled */ }
  }

  const Trend = ({ v, unit = '' }) =>
    v == null || Math.round(v) === 0 ? null : (
      <span dir="ltr" className={`text-[10px] font-black ${v > 0 ? 'text-green-600' : 'text-rose-500'}`}>{v > 0 ? '▲' : '▼'} {Math.abs(Math.round(v))}{unit}</span>
    )
  const Tile = ({ emoji, value, label, trend, bg }) => (
    <div className={`rounded-2xl p-2.5 text-center ${bg}`}>
      <div className="text-lg leading-none">{emoji}</div>
      <div className="font-black text-xl tabular-nums" dir="ltr">{value}</div>
      <div className="text-[11px] leading-tight">{label}</div>
      {trend}
    </div>
  )

  const grid = [
    { id: 'plates', emoji: '🍽️', label: A('أطباق', 'Plates'), cell: (row) => (row.plates ? <span className="font-black text-[11px]">{row.plates}</span> : null), on: (row) => row.plates > 0 },
    { id: 'water', emoji: '💧', label: A('المي', 'Water'), on: (row) => row.water >= c.goalWater, half: (row) => row.water > 0 },
    { id: 'move', emoji: '⚡', label: A('الحركة', 'Move'), on: (row) => row.move >= c.goalMove, half: (row) => row.move > 0 },
    { id: 'night', emoji: '🌙', label: A('النجوم', 'Stars'), on: (row) => !!row.night },
    { id: 'brush', emoji: '🦷', label: A('الأسنان', 'Teeth'), on: (row) => row.brush },
    ...(c.fastFull + c.fastBird + r.prev.fastFull + r.prev.fastBird > 0 || c.rows.some((x) => x.fast) ? [{ id: 'fast', emoji: '🏮', label: A('صيام', 'Fast'), on: (row) => row.fast === 'full', half: (row) => row.fast === 'bird' }] : []),
  ]

  return (
    <div className="space-y-4 report">
      <div className="flex items-center justify-between print:hidden">
        <button onClick={onBack} className="px-3 py-1.5 rounded-xl bg-white border border-[var(--border)] text-sm font-bold">{A('رجوع', 'Back')}</button>
        <div className="flex gap-2">
          <button onClick={share} className="px-3 py-1.5 rounded-xl bg-[var(--primary)] text-white text-sm font-black">📤 {A('مشاركة', 'Share')}</button>
          {!isNative && <button onClick={() => window.print()} className="px-3 py-1.5 rounded-xl bg-white border border-[var(--border)] text-sm font-bold">🖨️</button>}
        </div>
      </div>

      {/* header */}
      <div className="rounded-3xl p-4 text-white shadow-lg" style={{ background: 'linear-gradient(135deg,#F2533C,#f59e0b)' }}>
        <div className="flex items-center gap-3">
          <span className="text-5xl">{child.avatar}</span>
          <div className="flex-1 min-w-0">
            <h1 className="font-black text-lg">📊 {A('تقرير الأسبوع', 'Weekly report')} · {child.name}</h1>
            <p className="text-sm font-bold opacity-90">{T.hero}</p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 bg-black/15 rounded-2xl px-2 py-1.5 text-sm font-bold">
          <button aria-label={A('الأسبوع اللي قبل', 'Previous week')} onClick={() => setBack(back + 1)} disabled={back >= 7} className="w-8 h-8 rounded-full bg-white/20 disabled:opacity-30 print:hidden">{ar ? '›' : '‹'}</button>
          <span>{fmtDay(r.days[0], { day: 'numeric', month: 'short' })} – {fmtDay(r.days[6], { day: 'numeric', month: 'short' })}</span>
          <button aria-label={A('الأسبوع اللي بعد', 'Next week')} onClick={() => setBack(back - 1)} disabled={back === 0} className="w-8 h-8 rounded-full bg-white/20 disabled:opacity-30 print:hidden">{ar ? '‹' : '›'}</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-2">
        <Tile emoji="🍽️" value={c.plates} label={A('أطباق', 'plates')} trend={<Trend v={r.trend.plates} />} bg="bg-amber-50" />
        <Tile emoji="💧" value={`${c.waterDays}/7`} label={A('أيام هدف المي', 'water goal days')} trend={<Trend v={r.trend.waterDays} />} bg="bg-sky-50" />
        <Tile emoji="⚡" value={Math.round(c.moveAvg)} label={A(`د/يوم من ${c.goalMove}`, `min/day of ${c.goalMove}`)} trend={<Trend v={r.trend.moveAvg} />} bg="bg-orange-50" />
        <Tile emoji="🌙" value={`${c.nights}/7`} label={A('رحلة النجوم', 'Star Journey')} trend={<Trend v={r.trend.nights} />} bg="bg-indigo-50" />
      </div>

      {/* wins & focus */}
      {r.wins.length > 0 && (
        <div className="rounded-3xl bg-green-50 border border-green-200 p-4 space-y-1.5">
          <h2 className="font-black text-green-800">🌟 {A('أحلى إشي هالأسبوع', 'Wins this week')}</h2>
          {r.wins.map((w) => <p key={w.id} className="text-sm font-bold text-green-900">{T.win(w)}</p>)}
        </div>
      )}
      {r.focus.length > 0 && (
        <div className="rounded-3xl bg-amber-50 border border-amber-200 p-4 space-y-3">
          <h2 className="font-black text-amber-800">🎯 {A('نركّز الأسبوع الجاي على', 'Focus for next week')}</h2>
          {r.focus.map((x) => {
            const [title, tip] = T.focus(x)
            return (
              <div key={x.id}>
                <p className="text-sm font-black text-amber-900">{title}</p>
                <p className="text-[13px] text-amber-900/80 leading-relaxed">💡 {tip}</p>
              </div>
            )
          })}
        </div>
      )}

      {/* food groups */}
      <div className="bg-white rounded-3xl border border-[var(--border)] p-4 space-y-2.5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-black">🍽️ {A('الحصص: معدل اليوم', 'Servings: daily average')}</h2>
          <span className="text-[11px] text-[var(--text-soft)]">{A(`من ${c.loggedDays} أيام مسجّلة`, `over ${c.loggedDays} logged days`)}</span>
        </div>
        {['veg', 'fruit', 'grain', 'protein', 'dairy'].map((g) => {
          const v = c.servAvg[g] || 0
          const tgt = r.target[g]
          const scale = Math.max(tgt * 1.6, v, 1)
          const ok = v >= tgt * 0.9 && (g !== 'grain' || v <= tgt * 1.6)
          return (
            <div key={g} className="flex items-center gap-2">
              <span className="w-6 text-center text-lg">{ICON[g]}</span>
              <span className="w-16 text-xs font-bold shrink-0">{GNAME[lang][g]}</span>
              <div className="flex-1 h-3.5 bg-gray-100 rounded-full relative" dir="ltr">
                <div className={`h-full rounded-full ${ok ? 'bg-green-400' : 'bg-amber-400'}`} style={{ width: `${(v / scale) * 100}%` }} />
                <div className="absolute top-[-3px] bottom-[-3px] w-0.5 bg-gray-700 rounded" style={{ left: `${(tgt / scale) * 100}%` }} title="target" />
              </div>
              <span className="w-16 text-end text-[11px] font-black tabular-nums" dir="ltr">{c.loggedDays ? n1(v) : '—'} / {tgt}</span>
            </div>
          )
        })}
        <p className="text-[10px] text-[var(--text-soft)]">{A('الخط الأسود = الهدف اليومي حسب العمر والحجم (إرشادات DGA)', 'Black line = daily target for age and size (DGA)')}</p>
      </div>

      {/* habit grid */}
      <div className="bg-white rounded-3xl border border-[var(--border)] p-4">
        <h2 className="font-black mb-2">🗓️ {A('أيام الأسبوع', 'Day by day')}</h2>
        <table className="w-full text-center border-separate border-spacing-y-1">
          <thead>
            <tr>
              <th />
              {r.days.map((d) => <th key={d} className="text-[10px] font-bold text-[var(--text-soft)]">{fmtDay(d, { weekday: 'short' })}</th>)}
            </tr>
          </thead>
          <tbody>
            {grid.map((row) => (
              <tr key={row.id}>
                <td className="text-start text-[11px] font-bold whitespace-nowrap pe-1">{row.emoji} {row.label}</td>
                {c.rows.map((d) => {
                  const on = row.on(d), half = !on && row.half?.(d)
                  return (
                    <td key={d.date}>
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${on ? 'bg-green-400 text-white' : half ? 'bg-amber-200' : 'bg-gray-100'}`}>{row.cell?.(d)}</span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* extras */}
      {(r.newFoods.length > 0 || c.thanks.length > 0) && (
        <div className="bg-white rounded-3xl border border-[var(--border)] p-4 space-y-2">
          {r.newFoods.length > 0 && (
            <div>
              <h3 className="text-sm font-black mb-1">🆕 {A('أكلات جديدة لأول مرة', 'New foods, first time')}</h3>
              <div className="flex flex-wrap gap-1.5">{r.newFoods.map((f) => <span key={f.id} className="px-2 py-1 rounded-full bg-[var(--surface-2,#f3f4f6)] text-xs font-bold">{f.emoji} {f.name[lang]}</span>)}</div>
            </div>
          )}
          {c.thanks.length > 0 && (
            <div>
              <h3 className="text-sm font-black mb-1">💛 {A('لحظات الامتنان', 'Thankful moments')}</h3>
              <p className="text-xs">{c.thanks.map((id) => GRATITUDE.find((g) => g.id === id)).filter(Boolean).map((g) => `${g.emoji} ${g[lang]}`).join(' · ')}</p>
            </div>
          )}
        </div>
      )}

      {/* energy: parents only */}
      {r.enough && c.kcalAvg > 0 && (
        <div className="bg-white rounded-3xl border border-[var(--border)] p-4 space-y-1">
          <h2 className="font-black">🔥 {A('الطاقة (للأهل بس)', 'Energy (parents only)')}</h2>
          <p className="text-sm"><span className="font-black tabular-nums" dir="ltr">≈ {Math.round(c.kcalAvg)}</span> {A('سعرة بالأيام المسجّلة، والاحتياج التقديري', 'kcal on logged days; estimated need')} <span className="font-black tabular-nums" dir="ltr">{Math.round(r.a.kcal)}</span></p>
          <p className="text-[11px] text-[var(--text-soft)]">{A('رقم تقريبي من الحصص المسجّلة؛ الأكل اللي ما انسجّل مش محسوب. للمتابعة العامة، مش للحساب الدقيق.', 'A rough figure from logged servings; unlogged food is not counted. For trends only.')}{r.a.estimated ? A(' أضيفوا الطول والوزن لتقدير أدق.', ' Add height and weight for a better estimate.') : ''}</p>
        </div>
      )}
    </div>
  )
}
