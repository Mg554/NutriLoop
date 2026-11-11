// Meals: meal picker, "what did you eat?" check, quick snacks, plate rows.
import { useState } from 'react'
import { FOODS } from '../../data'
import { eatenFactor, plateDate, todayStr } from '../../store'
import { sfx } from '../../sfx'
import { Modal, useT } from '../../ui'

const getFood = (id) => FOODS.find((f) => f.id === id)
export const MEALS = [
  { id: 'breakfast', emoji: '🍳', key: 'mlBreakfast' },
  { id: 'lunch', emoji: '🍽️', key: 'mlLunch' },
  { id: 'dinner', emoji: '🌙', key: 'mlDinner' },
  { id: 'snack', emoji: '🍎', key: 'mlSnack' },
]
export const mealOf = (id) => MEALS.find((m) => m.id === id) || MEALS[1]
const SNACKS = ['apple', 'banana', 'dates', 'yogurt', 'cheese', 'cucumber', 'carrot', 'nuts', 'grape', 'milk', 'orange', 'kaak']

export function MealPicker({ value, onChange }) {
  const { t } = useT()
  return (
    <div className="grid grid-cols-4 gap-1.5" role="radiogroup">
      {MEALS.map((m) => (
        <button key={m.id} role="radio" aria-checked={value === m.id} onClick={() => { sfx.pop(); onChange(m.id) }}
          className={`py-2 rounded-2xl text-xs font-black border-2 flex flex-col items-center ${value === m.id ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'bg-white border-[var(--border)]'}`}>
          <span className="text-lg">{m.emoji}</span>{t(m.key)}
        </button>
      ))}
    </div>
  )
}

// all / half / none per food
export function EatCheck({ plate, onSave, onClose, parent }) {
  const { t, lang } = useT()
  const list = Object.values(plate.items).flat()
  const [eaten, setEaten] = useState(() => Object.fromEntries(list.map((it) => [it.id, plate.eaten?.[it.id] ?? 1])))
  const opts = [[1, '✅', 'mlAll'], [0.5, '🌗', 'mlHalf'], [0, '⭕', 'mlNone']]
  return (
    <Modal onClose={onClose}>
      <h2 className="font-black text-lg">🍽️ {parent ? t('mlEdit') : t('mlWhatAte')}</h2>
      {!parent && <p className="text-xs text-[var(--text-soft)] -mt-2">{t('mlWhatAteSub')}</p>}
      <div className="w-full space-y-2 max-h-[55vh] overflow-y-auto">
        {list.map((it) => {
          const f = getFood(it.id)
          return (
            <div key={it.id} className="flex items-center gap-2 bg-[var(--surface-2,#f8f5ef)] rounded-2xl p-2">
              <span className="text-3xl">{f?.emoji}</span>
              <span className="flex-1 text-start text-sm font-bold">{f?.name[lang]}{it.count > 1 ? ` ×${it.count}` : ''}</span>
              {opts.map(([v, e, k]) => (
                <button key={v} onClick={() => { sfx.pop(); setEaten((x) => ({ ...x, [it.id]: v })) }} aria-label={t(k)}
                  className={`w-12 py-1 rounded-xl text-[10px] font-black border-2 flex flex-col items-center ${eaten[it.id] === v ? 'bg-green-100 border-green-400' : 'bg-white border-transparent'}`}>
                  <span className="text-base">{e}</span>{t(k)}
                </button>
              ))}
            </div>
          )
        })}
      </div>
      <button onClick={() => onSave(eaten)} className="w-full py-3 bg-[var(--primary)] text-white font-black rounded-2xl">{t('mlSaveEaten')}</button>
    </Modal>
  )
}

// share of the plate eaten, 0..1 (by servings)
export function eatenShare(pl) {
  const list = Object.values(pl.items).flat()
  const all = list.reduce((s, it) => s + it.count, 0)
  return all ? list.reduce((s, it) => s + it.count * eatenFactor(pl, it.id), 0) / all : 0
}

// Today: plates of today not checked yet -> ask "what did you eat?"
export function EatPrompt({ child, progress, actions, toast }) {
  const { t } = useT()
  const [open, setOpen] = useState(null)
  const today = todayStr()
  const pending = (progress.plates || []).filter((pl) => plateDate(pl) === today && !pl.eaten && pl.meal !== 'snack')
  if (!pending.length && !open) return null
  const pl = pending[0]
  return (
    <>
      {pl && (
        <button onClick={() => setOpen(pl)} className="w-full text-start rounded-3xl p-3 bg-amber-50 border-2 border-amber-300 flex items-center gap-3 shadow-sm active:scale-[.98]">
          <span className="text-3xl">{mealOf(pl.meal).emoji}</span>
          <span className="flex-1 text-sm font-bold">{t('mlPendingCard')}</span>
          <span className="px-3 py-1.5 rounded-full bg-amber-400 text-white text-xs font-black">{t('mlTell')} ✨</span>
        </button>
      )}
      {open && (
        <EatCheck plate={open} onClose={() => setOpen(null)} onSave={(e) => { actions.setEaten(child.id, open.id, e); setOpen(null); sfx.sparkle(); toast?.(t('mlThanks')) }} />
      )}
    </>
  )
}

export function QuickSnack({ child, actions, toast }) {
  const { t, lang } = useT()
  const foods = SNACKS.map(getFood).filter(Boolean)
  const add = (f) => {
    const sec = f.category === 'fruit' ? 'veg' : f.category
    const items = { veg: [], grain: [], protein: [], dairy: [], [sec]: [{ id: f.id, count: 1 }] }
    actions.savePlate(child.id, items, 'snack', { eaten: { [f.id]: 1 } })
    toast?.(`${f.emoji} ${t('mlSnackSaved')}`)
  }
  return (
    <div className="bg-white rounded-3xl border border-[var(--border)] p-3 space-y-2">
      <div>
        <h3 className="font-black text-sm">🍎 {t('mlQuickSnack')}</h3>
        <p className="text-[11px] text-[var(--text-soft)]">{t('mlQuickSnackSub')}</p>
      </div>
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {foods.map((f) => (
          <button key={f.id} onClick={() => add(f)} className="shrink-0 w-16 py-1.5 rounded-2xl bg-[var(--surface-2,#f8f5ef)] flex flex-col items-center active:scale-90">
            <span className="text-2xl">{f.emoji}</span>
            <span className="text-[10px] font-bold truncate w-full text-center">{f.name[lang]}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
