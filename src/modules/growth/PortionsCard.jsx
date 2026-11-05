// Child-facing "my servings today": counts of servings per food group vs an
// age/size-appropriate target. NO calories, NO weight — only portions.
import { useState } from 'react'
import { todayStr } from '../../store'
import { useT } from '../../ui'
import { GROUPS, assess, avgMoveMinutes } from './calc'

const ICON = { veg: '🥦', fruit: '🍎', grain: '🍞', protein: '🥚', dairy: '🥛' }
const NAME = {
  ar: { veg: 'خضار', fruit: 'فواكه', grain: 'نشويات', protein: 'بروتين', dairy: 'ألبان' },
  en: { veg: 'Veggies', fruit: 'Fruit', grain: 'Grains', protein: 'Protein', dairy: 'Dairy' },
}
const GUIDE = {
  ar: { veg: 'كاسة خضار، أو كاستين ورق أخضر', fruit: 'حبة فاكهة وسط أو كاسة مقطّعة', grain: 'شريحة خبز أو نص كاسة رز', protein: 'بيضة، أو نص كاسة عدس/حمص، أو قطعة بحجم كفّك', dairy: 'كاسة حليب، أو ¾ كاسة لبن، أو شريحة جبنة' },
  en: { veg: '1 cup veggies or 2 cups leafy greens', fruit: '1 medium fruit or 1 cup', grain: '1 slice bread or ½ cup rice', protein: '1 egg, ½ cup beans, or a palm-size piece', dairy: '1 cup milk, ¾ cup yogurt or 1 slice cheese' },
}

export default function PortionsCard({ child, progress }) {
  const { lang, gender } = useT()
  const [open, setOpen] = useState(false)
  const a = assess(child, { avgMoveMin: avgMoveMinutes(progress) })
  const serv = progress.history?.[todayStr()]?.serv || {}
  const ar = lang === 'ar'
  return (
    <div className="bg-white rounded-3xl border border-[var(--border)] p-4 shadow-sm space-y-2.5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-black text-sm">🍽️ {ar ? 'حصصي اليوم' : 'My servings today'}</h3>
          <p className="text-[11px] text-[var(--text-soft)]">{ar ? (gender === 'f' ? 'كل كبسة عالأكل بالطبق = حصة وحدة' : 'كل كبسة عالأكل بالطبق = حصة وحدة') : 'Each tap on a food = one serving'}</p>
        </div>
        <button onClick={() => setOpen(!open)} className="px-2.5 py-1 rounded-full bg-[var(--surface-2)] text-[11px] font-black">{open ? '✕' : ar ? 'قدّيش الحصة؟' : 'How big?'}</button>
      </div>
      {GROUPS.map((g) => {
        const target = a.targets[g].target
        const have = serv[g] || 0
        const dots = Math.max(target, Math.min(have, target + 3))
        const done = have >= target
        const over = have > target + 1
        return (
          <div key={g} className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xl w-7 text-center">{ICON[g]}</span>
              <span className="text-xs font-bold w-14 shrink-0">{NAME[lang][g]}</span>
              <div className="flex gap-1 flex-wrap flex-1">
                {Array.from({ length: dots }, (_, i) => (
                  <span key={i} className={`w-4 h-4 rounded-full border-2 ${i < have ? (i >= target ? 'bg-amber-300 border-amber-400' : 'bg-green-400 border-green-500') : 'border-gray-300'}`} />
                ))}
              </div>
              <span className="text-[11px] font-black w-12 text-end">{done ? (over ? (ar ? 'كفاية 👍' : 'enough 👍') : '✅') : ''}</span>
            </div>
            {open && <p className="text-[11px] text-[var(--text-soft)] ps-9">{ar ? 'الحصة = ' : '1 serving = '}{GUIDE[lang][g]}</p>}
          </div>
        )
      })}
    </div>
  )
}
