// Parent-only screen: growth (WHO), energy needs (NASEM 2023), servings plan
// (DGA 2025-2030) and estimated intake from the plates the child saved.
import { useState } from 'react'
import { todayStr } from '../../store'
import { Card, useT } from '../../ui'
import { GROUPS, PAL_LEVELS, ageMonths, assess, avgMoveMinutes, palFromMinutes, whoCurve, whoRange } from './calc'

const tx = (lang) => (ar, en) => (lang === 'ar' ? ar : en)
const GROUP_NAME = { veg: ['خضار', 'Vegetables'], fruit: ['فواكه', 'Fruits'], grain: ['نشويات (حبوب كاملة)', 'Grains (whole)'], protein: ['بروتين', 'Protein'], dairy: ['ألبان', 'Dairy'] }
const GROUP_EX = {
  veg: ['كاسة خضار نيّة أو مطبوخة، أو كاستين ورق', '1 cup raw/cooked, or 2 cups leafy'],
  fruit: ['كاسة فاكهة أو حبة وسط، أو نص كاسة مجفف', '1 cup or 1 medium, or ½ cup dried'],
  grain: ['شريحة خبز، أو نص كاسة رز/برغل/شوفان مطبوخ', '1 slice bread, or ½ cup cooked grain'],
  protein: ['بيضة، أو نص كاسة بقوليات، أو ٣ أونصة لحم/جاج/سمك، أو ٣٠غ مكسرات', '1 egg, ½ cup legumes, 3 oz meat/fish, 1 oz nuts'],
  dairy: ['كاسة حليب، أو ¾ كاسة لبن، أو ٣٠غ جبنة', '1 cup milk, ¾ cup yogurt, 1 oz cheese'],
}
const PAL_NAME = { inactive: ['قليل الحركة', 'Inactive'], low: ['نشاط خفيف', 'Low active'], active: ['نشيط', 'Active'], very: ['نشيط جداً', 'Very active'] }
const CAT = {
  normal: ['طبيعي', 'Normal', 'bg-green-100 text-green-800'],
  risk: ['احتمال زيادة وزن', 'Possible risk of overweight', 'bg-amber-100 text-amber-800'],
  over: ['وزن زائد', 'Overweight', 'bg-amber-100 text-amber-800'],
  obese: ['سمنة', 'Obesity', 'bg-red-100 text-red-800'],
  thin: ['نحافة', 'Thinness', 'bg-amber-100 text-amber-800'],
  severeThin: ['نحافة شديدة', 'Severe thinness', 'bg-red-100 text-red-800'],
  short: ['قِصَر قامة', 'Stunted', 'bg-amber-100 text-amber-800'],
  severeShort: ['قِصَر قامة شديد', 'Severely stunted', 'bg-red-100 text-red-800'],
  tall: ['طويل جداً', 'Very tall', 'bg-sky-100 text-sky-800'],
}
const fmt = (n, d = 0) => (n == null || isNaN(n) ? '—' : n.toLocaleString('en', { maximumFractionDigits: d, minimumFractionDigits: d }))
const ord = (p) => (p < 0.1 ? '<0.1' : p > 99.9 ? '>99.9' : fmt(p, p < 3 || p > 97 ? 1 : 0))

function ageText(months, T) {
  const y = Math.floor(months / 12), m = Math.floor(months % 12)
  const n = (v) => v.toLocaleString('ar-EG')
  return T(`${n(y)} ${y >= 3 && y <= 10 ? 'سنين' : 'سنة'} و${n(m)} ${m >= 3 && m <= 10 ? 'شهور' : 'شهر'}`, `${y} y ${m} m`)
}

function lastDays(n) {
  const out = []
  for (let i = 0; i < n; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    out.push(todayStr(d))
  }
  return out
}

// ---------------------------------------------------------------------------
function GrowthChart({ child, kind, T }) {
  const sex = child.gender === 'f' ? 'f' : 'm'
  const pts = (child.measures || [])
    .filter((m) => m.h && m.w && child.birth)
    .map((m) => ({ x: ageMonths(child.birth, m.d), y: kind === 'bmi' ? m.w / (m.h / 100) ** 2 : m.h }))
  const [r0, r1] = whoRange(kind)
  const nowM = child.birth ? ageMonths(child.birth) : (child.age + 0.5) * 12
  const m0 = Math.max(r0, Math.floor(Math.min(nowM, ...pts.map((p) => p.x)) - 24))
  const m1 = Math.min(r1, Math.ceil(Math.max(nowM, ...pts.map((p) => p.x)) + 24))
  const lines = [-2, -1, 0, 1, 2].map((z) => ({ z, c: whoCurve(kind, sex, z, m0, m1) }))
  const ys = lines.flatMap((l) => l.c.map((p) => p[1])).concat(pts.map((p) => p.y))
  const y0 = Math.floor(Math.min(...ys) * 0.97), y1 = Math.ceil(Math.max(...ys) * 1.02)
  const W = 320, H = 200, pl = 34, pb = 22, pt = 8, pr = 8
  const X = (m) => pl + ((m - m0) / (m1 - m0)) * (W - pl - pr)
  const Y = (v) => pt + (1 - (v - y0) / (y1 - y0)) * (H - pt - pb)
  const path = (c) => c.map(([m, v], i) => `${i ? 'L' : 'M'}${X(m).toFixed(1)},${Y(v).toFixed(1)}`).join('')
  const yTicks = 5
  const xYears = []
  for (let y = Math.ceil(m0 / 12); y <= Math.floor(m1 / 12); y++) xYears.push(y)
  const band = (zLo, zHi) => {
    const lo = lines.find((l) => l.z === zLo).c, hi = lines.find((l) => l.z === zHi).c
    return path(hi) + lo.slice().reverse().map(([m, v]) => `L${X(m).toFixed(1)},${Y(v).toFixed(1)}`).join('') + 'Z'
  }
  return (
    <div className="overflow-x-auto" dir="ltr">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[480px] mx-auto" role="img" aria-label="WHO growth chart">
        <path d={band(-1, 1)} fill="#22c55e" opacity=".14" />
        <path d={band(1, 2)} fill="#f59e0b" opacity=".12" />
        <path d={band(-2, -1)} fill="#f59e0b" opacity=".08" />
        {Array.from({ length: yTicks + 1 }, (_, i) => {
          const v = y0 + ((y1 - y0) * i) / yTicks
          return (
            <g key={i}>
              <line x1={pl} x2={W - pr} y1={Y(v)} y2={Y(v)} stroke="currentColor" opacity=".08" />
              <text x={pl - 4} y={Y(v) + 3} fontSize="9" textAnchor="end" fill="currentColor" opacity=".6">{fmt(v, kind === 'bmi' ? 1 : 0)}</text>
            </g>
          )
        })}
        {xYears.map((y) => (
          <text key={y} x={X(y * 12)} y={H - 6} fontSize="9" textAnchor="middle" fill="currentColor" opacity=".6">{y}</text>
        ))}
        {lines.map(({ z, c }) => (
          <g key={z}>
            <path d={path(c)} fill="none" stroke={z === 0 ? '#16a34a' : Math.abs(z) === 2 ? '#dc2626' : '#f59e0b'} strokeWidth={z === 0 ? 1.8 : 1.1} strokeDasharray={Math.abs(z) === 1 ? '4 3' : ''} />
            <text x={W - pr - 2} y={Y(c[c.length - 1][1]) - 2} fontSize="8" textAnchor="end" fill="currentColor" opacity=".55">{z > 0 ? `+${z}` : z}</text>
          </g>
        ))}
        {pts.length > 1 && <path d={pts.sort((a, b) => a.x - b.x).map((p, i) => `${i ? 'L' : 'M'}${X(p.x)},${Y(p.y)}`).join('')} fill="none" stroke="#ff6b4a" strokeWidth="2" />}
        {pts.map((p, i) => <circle key={i} cx={X(p.x)} cy={Y(p.y)} r={i === pts.length - 1 ? 4.5 : 3} fill="#ff6b4a" stroke="#fff" strokeWidth="1.5" />)}
      </svg>
      <p className="text-[10px] text-center opacity-60">{T('العمر بالسنين • الخطوط = انحرافات معيارية WHO (‎−2 … +2)', 'Age (years) • lines = WHO z-scores (−2 … +2)')}</p>
      {!child.birth && <p className="text-[11px] text-center text-amber-700">{T('أدخلوا تاريخ الميلاد لرسم القياسات على المنحنى', 'Add the birth date to plot measurements')}</p>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Arabic keyboards type ٠-٩ and ٫ or ، : normalise to 0-9 and "."
const decimalLatin = (v) => v.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٫,،]/g, '.').replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1').slice(0, 6)

export default function GrowthView({ child, progress, actions, onBack }) {
  const { lang } = useT()
  const T = tx(lang)
  const [form, setForm] = useState({ d: todayStr(), h: '', w: '' })
  const [chart, setChart] = useState('bmi')
  const avgMin = avgMoveMinutes(progress)
  const a = assess(child, { avgMoveMin: avgMin })
  const save = (patch) => actions.saveChild({ ...child, ...patch })

  const addMeasure = () => {
    const h = parseFloat(form.h), w = parseFloat(form.w)
    if (!(h > 40 && h < 230 && w > 5 && w < 200)) return
    const measures = [...(child.measures || []).filter((m) => m.d !== form.d), { d: form.d, h, w }].sort((x, y) => x.d.localeCompare(y.d)).slice(-60)
    save({ measures })
    setForm({ d: todayStr(), h: '', w: '' })
  }

  const days = lastDays(7)
  const rows = days.map((d) => ({ d, ...(progress?.history?.[d] || {}) }))
  const kcalDays = rows.filter((r) => r.kcal > 0)
  const avgKcal = kcalDays.length ? kcalDays.reduce((s, r) => s + r.kcal, 0) / kcalDays.length : null
  const today = rows[0]

  const Chip = ({ cat }) => (cat ? <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${CAT[cat][2]}`}>{T(CAT[cat][0], CAT[cat][1])}</span> : null)
  const input = 'w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-white outline-none focus:border-[var(--primary)]'

  return (
    <div className="space-y-4 anim-pop">
      <div className="flex items-center justify-between">
        <h1 className="font-black text-lg">📏 {T('النمو والتغذية', 'Growth & nutrition')} · {child.name}</h1>
        <button onClick={onBack} className="px-3 py-1.5 rounded-xl bg-white border border-[var(--border)] text-sm font-bold">{T('رجوع', 'Back')}</button>
      </div>
      <p className="text-[11px] text-[var(--text-soft)] bg-amber-50 border border-amber-200 rounded-xl p-2">🔒 {T('هالصفحة للأهل بس. الطفل ما بيشوف أي سعرات أو وزن، بيشوف عدد الحصص فقط.', 'Parents only. The child never sees calories or weight, only serving counts.')}</p>

      {/* measurements */}
      <Card className="space-y-3">
        <h2 className="font-black">{T('القياسات', 'Measurements')}</h2>
        <label className="block text-xs font-bold text-[var(--text-soft)]">
          {T('تاريخ الميلاد (للدقة)', 'Birth date (for accuracy)')}
          <input id="g-birth" type="date" value={child.birth || ''} max={todayStr()} onChange={(e) => save({ birth: e.target.value || null, ...(e.target.value ? { age: Math.floor(ageMonths(e.target.value) / 12) } : {}) })} className={input + ' mt-1'} dir="ltr" />
        </label>
        <p className="text-xs">{T('العمر:', 'Age:')} <b>{ageText(a.months, T)}</b> {!child.birth && <span className="text-amber-700">({T('تقريبي', 'approx.')})</span>}</p>
        <div className="grid grid-cols-3 gap-2">
          <input id="g-date" type="date" value={form.d} max={todayStr()} onChange={(e) => setForm({ ...form, d: e.target.value })} className={input + ' col-span-3'} dir="ltr" />
          <input id="g-h" type="text" inputMode="decimal" autoComplete="off" placeholder={T('الطول سم', 'Height cm')} value={form.h} onChange={(e) => setForm({ ...form, h: decimalLatin(e.target.value) })} className={input} dir="ltr" />
          <input id="g-w" type="text" inputMode="decimal" autoComplete="off" placeholder={T('الوزن كغ', 'Weight kg')} value={form.w} onChange={(e) => setForm({ ...form, w: decimalLatin(e.target.value) })} className={input} dir="ltr" />
          <button onClick={addMeasure} className="rounded-xl bg-[var(--primary)] text-white font-black text-sm">+ {T('أضف', 'Add')}</button>
        </div>
        {(child.measures || []).length > 0 && (
          <div className="max-h-36 overflow-y-auto text-xs divide-y divide-[var(--border)]" dir="ltr">
            {[...child.measures].reverse().map((m) => (
              <div key={m.d} className="flex items-center gap-3 py-1.5 tabular-nums">
                <span className="w-24">{m.d}</span><span className="w-16">{m.h} cm</span><span className="w-16">{m.w} kg</span>
                <span className="flex-1 opacity-60">BMI {fmt(m.w / (m.h / 100) ** 2, 1)}</span>
                <button onClick={() => save({ measures: child.measures.filter((x) => x.d !== m.d) })} className="text-red-500 px-2" aria-label="delete">✕</button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* growth results */}
      {a.measure && (
        <Card className="space-y-3">
          <h2 className="font-black">{T('النمو حسب منحنيات WHO', 'Growth (WHO curves)')} <span className="text-[11px] font-bold opacity-60">· {a.measure.d}</span></h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
            <div className="rounded-xl bg-[var(--bg-soft)] p-2.5 space-y-1">
              <div className="text-[11px] font-bold opacity-70">BMI-for-age</div>
              <div className="font-black text-lg tabular-nums" dir="ltr">{fmt(a.bmi, 1)} <span className="text-xs font-bold opacity-60">kg/m²</span></div>
              <div className="text-xs tabular-nums" dir="ltr">z = {fmt(a.bmiZ?.z, 2)} · P{ord(a.bmiZ?.pct)}</div>
              <Chip cat={a.bmiCat} />
            </div>
            <div className="rounded-xl bg-[var(--bg-soft)] p-2.5 space-y-1">
              <div className="text-[11px] font-bold opacity-70">{T('الطول للعمر', 'Height-for-age')}</div>
              <div className="font-black text-lg tabular-nums" dir="ltr">{fmt(a.measure.h, 1)} <span className="text-xs font-bold opacity-60">cm</span></div>
              <div className="text-xs tabular-nums" dir="ltr">z = {fmt(a.hZ?.z, 2)} · P{ord(a.hZ?.pct)}</div>
              <Chip cat={a.hCat} />
            </div>
            <div className="rounded-xl bg-[var(--bg-soft)] p-2.5 space-y-1">
              <div className="text-[11px] font-bold opacity-70">{T('الوزن للعمر', 'Weight-for-age')}</div>
              <div className="font-black text-lg tabular-nums" dir="ltr">{fmt(a.measure.w, 1)} <span className="text-xs font-bold opacity-60">kg</span></div>
              <div className="text-xs tabular-nums" dir="ltr">{a.wZ ? <>z = {fmt(a.wZ.z, 2)} · P{ord(a.wZ.pct)}</> : T('WHO ما بتستخدمه بعد ١٠ سنين', 'WHO: not used after 10 y')}</div>
            </div>
          </div>
          <div className="flex gap-1.5">
            {[['bmi', 'BMI'], ['hgt', T('الطول', 'Height')]].map(([k, l]) => (
              <button key={k} onClick={() => setChart(k)} className={`px-3 py-1 rounded-full text-xs font-bold ${chart === k ? 'bg-[var(--primary)] text-white' : 'bg-white border border-[var(--border)]'}`}>{l}</button>
            ))}
          </div>
          <GrowthChart child={child} kind={chart} T={T} />
        </Card>
      )}

      {/* energy */}
      <Card className="space-y-3">
        <h2 className="font-black">{T('الاحتياج اليومي من الطاقة', 'Daily energy requirement')}</h2>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => save({ pal: 'auto' })} className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${a.palAuto ? 'bg-[var(--primary)] text-white' : 'bg-white border border-[var(--border)]'}`}>
            {T('تلقائي', 'Auto')} ({T(PAL_NAME[palFromMinutes(avgMin)][0], PAL_NAME[palFromMinutes(avgMin)][1])})
          </button>
          {PAL_LEVELS.map((p) => (
            <button key={p} onClick={() => save({ pal: p })} className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${!a.palAuto && a.pal === p ? 'bg-[var(--primary)] text-white' : 'bg-white border border-[var(--border)]'}`}>{T(PAL_NAME[p][0], PAL_NAME[p][1])}</button>
          ))}
        </div>
        <p className="text-[11px] text-[var(--text-soft)]">{T(`التلقائي مبني على معدل الحركة بالتطبيق آخر ٧ أيام (${fmt(avgMin)} د/يوم). إذا الطفل بيلعب برّا أو عنده رياضة بالمدرسة، اختاروا المستوى يدوياً.`, `Auto uses the app's 7-day movement average (${fmt(avgMin)} min/day). Pick manually if the child is active outside the app.`)}</p>
        {a.energy ? (
          <div className="rounded-2xl bg-[var(--bg-soft)] p-3">
            <div className="font-black text-2xl tabular-nums" dir="ltr">≈ {fmt(a.energy.eer)} <span className="text-sm">kcal/{T('يوم', 'day')}</span></div>
            <div className="text-[11px] opacity-70" dir="ltr">TEE {fmt(a.energy.tee)} + {T('نمو', 'growth')} {fmt(a.energy.eer - a.energy.tee)} · NASEM 2023 · {T(PAL_NAME[a.pal][0], PAL_NAME[a.pal][1])}</div>
          </div>
        ) : (
          <p className="text-sm text-amber-800 bg-amber-50 rounded-xl p-2">{T(`أدخلوا الطول والوزن للحساب الدقيق. حالياً الحصص مبنية على تقدير عام للعمر (${fmt(a.kcal)} سعرة).`, `Add height and weight for an exact estimate. Servings now use a general age estimate (${fmt(a.kcal)} kcal).`)}</p>
        )}
      </Card>

      {/* servings plan */}
      <Card className="space-y-2">
        <h2 className="font-black">{T('الحصص اليومية المقترحة', 'Recommended daily servings')} <span className="text-[11px] font-bold opacity-60" dir="ltr">· {fmt(a.level)} kcal</span></h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="text-[var(--text-soft)]"><th className="text-start py-1">{T('المجموعة', 'Group')}</th><th className="text-center px-2">{T('الدليل', 'Guideline')}</th><th className="text-center px-2">{T('هدف الطفل', 'Kid target')}</th><th className="text-center px-2">{T('اليوم', 'Today')}</th></tr></thead>
            <tbody className="divide-y divide-[var(--border)]">
              {GROUPS.map((g) => {
                const t = a.targets[g]
                const got = today?.serv?.[g] || 0
                return (
                  <tr key={g} className="align-top">
                    <td className="py-1.5 font-bold">{T(GROUP_NAME[g][0], GROUP_NAME[g][1])}<div className="font-normal text-[10px] opacity-60 max-w-[150px]">{T(GROUP_EX[g][0], GROUP_EX[g][1])}</div></td>
                    <td className="tabular-nums text-center px-2 whitespace-nowrap"><bdi>{t.lo === t.hi ? fmt(t.lo, 2) : `${fmt(t.lo, 2)}–${fmt(t.hi, 2)}`}</bdi></td>
                    <td className="tabular-nums font-black text-center px-2">{t.target}</td>
                    <td className={`tabular-nums font-black text-center px-2 ${got >= t.target ? 'text-green-700' : ''}`}>{got}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* intake */}
      <Card className="space-y-2">
        <h2 className="font-black">{T('المأخوذ (تقديري)', 'Intake (estimated)')}</h2>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="rounded-xl bg-[var(--bg-soft)] p-2"><div className="font-black text-lg tabular-nums" dir="ltr">{fmt(today?.kcal || 0)}</div><div className="text-[11px]">{T('سعرة اليوم', 'kcal today')}{a.energy ? ` · ${fmt(((today?.kcal || 0) / a.kcal) * 100)}%` : ''}</div></div>
          <div className="rounded-xl bg-[var(--bg-soft)] p-2"><div className="font-black text-lg tabular-nums" dir="ltr">{fmt(avgKcal)}</div><div className="text-[11px]">{T('معدل الأيام المسجّلة', 'avg of logged days')} ({kcalDays.length}/7)</div></div>
        </div>
        <div className="space-y-1" dir="ltr">
          {rows.map((r) => (
            <div key={r.d} className="flex items-center gap-2 text-[11px] tabular-nums">
              <span className="w-20 opacity-70">{r.d.slice(5)}</span>
              <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden relative">
                <div className="h-full bg-[var(--primary)] rounded-full" style={{ width: `${Math.min(100, ((r.kcal || 0) / (a.kcal * 1.3)) * 100)}%` }} />
                <div className="absolute top-0 bottom-0 w-0.5 bg-green-600" style={{ left: `${(1 / 1.3) * 100}%` }} />
              </div>
              <span className="w-12 text-end">{r.kcal ? fmt(r.kcal) : '—'}</span>
            </div>
          ))}
          <p className="text-[10px] opacity-60 text-center">{T('الخط الأخضر = الاحتياج اليومي', 'green line = daily requirement')}</p>
        </div>
        <p className="text-[11px] text-[var(--text-soft)] leading-relaxed">
          {T('⚠️ السعرات هون تقديرية: مبنية على الأطباق اللي سجّلها الطفل، وكل كبسة = حصة قياسية بسعرات متوسطة. الأكل اللي ما انسجّل (سناك، عصير، أكل المدرسة) ما بينحسب. استخدموها كمؤشر للاتجاه، مش رقم دقيق.',
            '⚠️ Calories are estimates from plates the child logged; each tap = one standard serving with average calories. Unlogged food (snacks, juice, school) is missing. Use as a trend, not an exact number.')}
        </p>
      </Card>

      <p className="text-[10px] text-[var(--text-soft)] leading-relaxed px-1">
        {T('المصادر: WHO Child Growth Standards 2006 و WHO Growth Reference 2007 (منحنيات النمو)، NASEM Dietary Reference Intakes for Energy 2023 (معادلات الطاقة)، Dietary Guidelines for Americans 2025–2030 (الحصص). هالأرقام للتوعية ومتابعة الاتجاه، ومش بديل عن تقييم طبيب الأطفال.',
          'Sources: WHO Child Growth Standards 2006 & Growth Reference 2007; NASEM DRI for Energy 2023; Dietary Guidelines for Americans 2025–2030. For awareness and trends; not a substitute for a pediatric assessment.')}
      </p>
    </div>
  )
}
