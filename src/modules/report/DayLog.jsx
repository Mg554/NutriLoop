// 📜 Day log (parents, behind the PIN): a timeline of one day for one child -
// plates and snacks (what was really eaten), exercises with their duration,
// the bedtime journey - plus edit / confirm / delete and a share button.
import { useState } from 'react'
import { Share } from '@capacitor/share'
import { FOODS, waterGoalForAge } from '../../data'
import { eatenFactor, plateDate, todayStr } from '../../store'
import { isNative } from '../../native'
import { moveGoalForAge } from '../move/data'
import { EatCheck, eatenShare, mealOf } from '../meals/Meals'
import { useT } from '../../ui'

const getFood = (id) => FOODS.find((f) => f.id === id)
const hm = (ts) => { const d = new Date(ts); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` }
const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

export function dayEntries(progress, date) {
  const plates = (progress.plates || []).filter((pl) => plateDate(pl) === date).map((pl) => ({ type: 'plate', ts: pl.ts, pl }))
  const moves = (progress.moveLog || []).filter((m) => m.date === date).map((m) => ({ type: 'move', ts: m.ts, m }))
  const night = (progress.nightLog || []).filter((n) => n.date === date && n.at).map((n) => ({ type: 'night', ts: n.at, n }))
  return [...plates, ...moves, ...night].sort((a, b) => a.ts - b.ts)
}

export function dayText(lang, child, progress, date) {
  const ar = lang === 'ar'
  const h = progress.history?.[date] || {}
  const goalMove = child.moveGoal || moveGoalForAge(child.age)
  const goalWater = child.waterGoal || waterGoalForAge(child.age)
  const lines = [`📜 ${ar ? 'يوم' : 'Day of'} ${child.name} ${child.avatar || ''} · ${new Date(date + 'T12:00').toLocaleDateString(ar ? 'ar' : 'en', { weekday: 'long', day: 'numeric', month: 'short' })}`, '']
  for (const e of dayEntries(progress, date)) {
    if (e.type === 'plate') {
      const m = mealOf(e.pl.meal)
      const foods = Object.values(e.pl.items).flat().map((it) => `${getFood(it.id)?.emoji || ''}${e.pl.eaten ? ({ 1: '', 0.5: '½', 0: '✗' })[eatenFactor(e.pl, it.id)] : ''}`).join(' ')
      const share = e.pl.meal !== 'snack' ? (e.pl.eaten ? ` (${Math.round(eatenShare(e.pl) * 100)}%)` : ' (?)') : ''
      lines.push(`${hm(e.ts)} ${m.emoji} ${ar ? { breakfast: 'فطور', lunch: 'غدا', dinner: 'عشا', snack: 'سناك' }[e.pl.meal || 'lunch'] : e.pl.meal || 'meal'}: ${foods}${share}`)
    } else if (e.type === 'move') lines.push(`${hm(e.ts)} ${e.m.emoji || '⚡'} ${e.m.title?.[lang] || ''} · ${mmss(e.m.seconds)}${e.m.complete ? ' ✅' : ''}`)
    else lines.push(`${hm(e.ts)} 🌙 ${ar ? 'رحلة النجوم' : 'Star Journey'} ✅`)
  }
  lines.push('', `⚡ ${Math.round((h.move || 0) / 60)}/${goalMove} ${ar ? 'دقيقة حركة' : 'min moving'} · 💧 ${h.water || 0}/${goalWater} ml`, 'NutriLoop 🌱')
  return lines.join('\n')
}

export default function DayLog({ child, progress, actions, toast, onBack }) {
  const { lang } = useT()
  const ar = lang === 'ar'
  const A = (a, e) => (ar ? a : e)
  const [back, setBack] = useState(0)
  const [edit, setEdit] = useState(null)
  const [del, setDel] = useState(null)
  const d = new Date(); d.setDate(d.getDate() - back)
  const date = todayStr(d)
  const h = progress.history?.[date] || {}
  const entries = dayEntries(progress, date)
  const goalMove = child.moveGoal || moveGoalForAge(child.age)
  const goalWater = child.waterGoal || waterGoalForAge(child.age)
  const mins = Math.round((h.move || 0) / 60)
  const movePct = Math.min(100, (mins / goalMove) * 100)

  const share = async () => {
    const text = dayText(lang, child, progress, date)
    try {
      if (isNative) await Share.share({ title: 'NutriLoop', text, dialogTitle: 'NutriLoop' })
      else if (navigator.share) await navigator.share({ text })
      else { await navigator.clipboard.writeText(text); toast?.(A('تم نسخ السجل ✅', 'Log copied ✅')) }
    } catch { /* cancelled */ }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="px-3 py-1.5 rounded-xl bg-white border border-[var(--border)] text-sm font-bold">{A('رجوع', 'Back')}</button>
        <button onClick={share} className="px-3 py-1.5 rounded-xl bg-[var(--primary)] text-white text-sm font-black">📤 {A('مشاركة اليوم', 'Share day')}</button>
      </div>
      <div className="rounded-3xl p-4 text-white shadow-lg space-y-3" style={{ background: 'linear-gradient(135deg,#0ea5e9,#6366f1)' }}>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{child.avatar}</span>
          <h1 className="font-black text-lg flex-1">📜 {A('سجل', 'Log')} · {child.name}</h1>
        </div>
        <div className="flex items-center justify-between bg-black/15 rounded-2xl px-2 py-1.5 text-sm font-bold">
          <button aria-label={A('اليوم اللي قبل', 'Previous day')} onClick={() => setBack(back + 1)} disabled={back >= 30} className="w-8 h-8 rounded-full bg-white/20 disabled:opacity-30">{ar ? '›' : '‹'}</button>
          <span>{back === 0 ? A('اليوم', 'Today') : d.toLocaleDateString(ar ? 'ar' : 'en', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
          <button aria-label={A('اليوم اللي بعد', 'Next day')} onClick={() => setBack(back - 1)} disabled={back === 0} className="w-8 h-8 rounded-full bg-white/20 disabled:opacity-30">{ar ? '‹' : '›'}</button>
        </div>
        <div>
          <div className="flex justify-between text-xs font-bold mb-1">
            <span>⚡ {A('الحركة', 'Movement')} {mins}/{goalMove} {A('د', 'min')}</span>
            <span>{mins >= goalMove ? '✅' : A(`باقي ${goalMove - mins} د`, `${goalMove - mins} min left`)}</span>
          </div>
          <div className="h-2.5 bg-white/25 rounded-full overflow-hidden" dir="ltr"><div className="h-full bg-white rounded-full" style={{ width: `${movePct}%` }} /></div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
          <div className="bg-white/15 rounded-xl py-1.5">🍽️ {h.plates || 0} {A('وجبات', 'meals')}</div>
          <div className="bg-white/15 rounded-xl py-1.5">🍎 {h.snacks || 0} {A('سناك', 'snacks')}</div>
          <div className="bg-white/15 rounded-xl py-1.5" dir="ltr">💧 {h.water || 0}/{goalWater}</div>
        </div>
      </div>

      {entries.length === 0 && <p className="text-center text-sm text-[var(--text-soft)] py-8">{A('ما في إشي مسجّل بهاليوم', 'Nothing logged on this day')}</p>}
      <ol className="relative border-s-2 border-[var(--border)] ms-3 space-y-3">
        {entries.map((e) => (
          <li key={e.type + e.ts} className="ms-4">
            <span className="absolute -start-[9px] w-4 h-4 rounded-full bg-white border-2 border-[var(--primary)]" />
            <div className="bg-white rounded-2xl border border-[var(--border)] p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tabular-nums text-[var(--text-soft)]" dir="ltr">{hm(e.ts)}</span>
                {e.type === 'plate' && (() => {
                  const pl = e.pl, m = mealOf(pl.meal)
                  return (
                    <>
                      <span className="font-black text-sm flex-1">{m.emoji} {A({ breakfast: 'فطور', lunch: 'غدا', dinner: 'عشا', snack: 'سناك' }[pl.meal || 'lunch'], pl.meal || 'Meal')}</span>
                      {pl.meal !== 'snack' && (pl.eaten
                        ? <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-green-100 text-green-700" dir="ltr">{Math.round(eatenShare(pl) * 100)}%</span>
                        : <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{A('مش مسجّل شو انأكل', 'eaten: ?')}</span>)}
                      {pl.confirmed && <span title="confirmed">✔️</span>}
                    </>
                  )
                })()}
                {e.type === 'move' && (
                  <>
                    <span className="font-black text-sm flex-1">{e.m.emoji} {e.m.title?.[lang]}</span>
                    <span className="text-[11px] font-black tabular-nums" dir="ltr">{mmss(e.m.seconds)}</span>
                    <span className="text-xs">{e.m.complete ? '✅' : '◐'}</span>
                  </>
                )}
                {e.type === 'night' && <span className="font-black text-sm flex-1">🌙 {A('رحلة النجوم خلصت', 'Star Journey done')}</span>}
              </div>
              {e.type === 'plate' && (
                <>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {Object.values(e.pl.items).flat().map((it) => {
                      const f = eatenFactor(e.pl, it.id)
                      return (
                        <span key={it.id} className={`text-xs font-bold px-2 py-1 rounded-full bg-[var(--surface-2,#f8f5ef)] ${e.pl.eaten && f === 0 ? 'line-through opacity-50' : ''}`}>
                          {getFood(it.id)?.emoji} {getFood(it.id)?.name[lang]}{it.count > 1 ? ` ×${it.count}` : ''}{e.pl.eaten && f === 0.5 ? ' ½' : ''}
                        </span>
                      )
                    })}
                  </div>
                  <div className="flex gap-1.5 mt-2 justify-end">
                    <button onClick={() => setEdit(e.pl)} className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 text-[11px] font-black">✏️ {A('عدّل', 'Edit')}</button>
                    {!e.pl.confirmed && <button onClick={() => actions.confirmPlate(child.id, e.pl.id)} className="px-2.5 py-1 rounded-lg bg-green-100 text-green-800 text-[11px] font-black">✔️ {A('تأكيد', 'Confirm')}</button>}
                    {del === e.pl.id
                      ? <button onClick={() => { actions.deletePlate(child.id, e.pl.id); setDel(null) }} className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-black">{A('أكيد؟ احذف', 'Sure? Delete')}</button>
                      : <button onClick={() => setDel(e.pl.id)} className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 text-[11px] font-black">🗑️</button>}
                  </div>
                </>
              )}
            </div>
          </li>
        ))}
      </ol>
      {edit && <EatCheck parent plate={edit} onClose={() => setEdit(null)} onSave={(eaten) => { actions.setEaten(child.id, edit.id, eaten, 'parent'); setEdit(null) }} />}
    </div>
  )
}
