// Shared UI pieces: translation helper, unified mouse/touch drag, plate, modal.
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { STR } from './data'
import { getFood } from './store'

// ---- i18n ------------------------------------------------------------------
export const LangCtx = createContext({ lang: 'ar', gender: 'm' })

// Resolves a string that may be { m, f } and fills {placeholders}.
export function resolve(v, gender, vars) {
  if (v && typeof v === 'object' && ('m' in v || 'f' in v)) v = v[gender] ?? v.m
  if (typeof v !== 'string') return v
  return vars ? v.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '') : v
}

export function useT() {
  const { lang, gender } = useContext(LangCtx)
  const L = STR[lang]
  const t = (key, vars) => resolve((gender === 'f' && L[key + 'F']) || L[key], gender, vars)
  // pick a { en, ar } field from data (ar may itself be gendered)
  const pick = (obj) => resolve(obj?.[lang], gender)
  return { t, pick, lang, gender, L }
}

// Arabic-insensitive matching: strips diacritics and unifies letter forms.
export const normalize = (s) =>
  (s || '')
    .toLowerCase()
    .replace(/[ً-ْـ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .trim()

export const foodMatches = (food, q) => {
  const n = normalize(q)
  if (!n) return true
  return [food.name.ar, food.name.en, ...(food.aliases || [])].some((x) => normalize(x).includes(n))
}

// ---- unified drag (mouse = drag immediately, touch = long-press then drag) --
// Drop targets are any element with data-drop="<section>".
export function useDrag({ onDrop, onTap }) {
  const st = useRef(null)
  const [ghost, setGhost] = useState(null)
  const [over, setOver] = useState(null)
  const cb = useRef({ onDrop, onTap })
  cb.current = { onDrop, onTap }

  useEffect(() => {
    const targetAt = (x, y) => document.elementFromPoint(x, y)?.closest('[data-drop]')?.getAttribute('data-drop') || null
    const end = () => {
      if (st.current?.timer) clearTimeout(st.current.timer)
      st.current = null
      setGhost(null)
      setOver(null)
    }
    const move = (e) => {
      const s = st.current
      if (!s) return
      const dist = Math.hypot(e.clientX - s.x, e.clientY - s.y)
      if (!s.dragging) {
        if (s.type === 'mouse' && dist > 6) s.dragging = true
        else if (s.type !== 'mouse' && dist > 10) { s.cancelled = true; clearTimeout(s.timer) }
        if (!s.dragging) return
      }
      setGhost({ x: e.clientX, y: e.clientY, emoji: s.food.emoji })
      setOver(targetAt(e.clientX, e.clientY))
    }
    const up = (e) => {
      const s = st.current
      if (!s) return
      if (s.dragging) {
        const sec = targetAt(e.clientX, e.clientY)
        if (sec) cb.current.onDrop(s.food, sec)
      } else if (!s.cancelled) cb.current.onTap(s.food)
      end()
    }
    // Block page scroll only while a drag is active.
    const touchMove = (e) => { if (st.current?.dragging && e.cancelable) e.preventDefault() }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', end)
    window.addEventListener('touchmove', touchMove, { passive: false })
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', end)
      window.removeEventListener('touchmove', touchMove)
    }
  }, [])

  const bind = (food) => ({
    onPointerDown: (e) => {
      if (e.button > 0) return
      const s = { food, x: e.clientX, y: e.clientY, type: e.pointerType, dragging: false, cancelled: false }
      if (e.pointerType !== 'mouse') {
        s.timer = setTimeout(() => {
          if (st.current === s && !s.cancelled) {
            s.dragging = true
            navigator.vibrate?.(15)
            setGhost({ x: s.x, y: s.y, emoji: food.emoji })
          }
        }, 220)
      }
      st.current = s
    },
    onContextMenu: (e) => e.preventDefault(),
    onDragStart: (e) => e.preventDefault(),
  })

  const ghostEl = ghost && (
    <div
      className="fixed z-[60] pointer-events-none text-4xl p-2 bg-white/90 rounded-full shadow-2xl border-2 border-[var(--primary)] -translate-x-1/2 -translate-y-1/2"
      style={{ left: ghost.x, top: ghost.y }}
    >
      {ghost.emoji}
    </div>
  )
  return { bind, over, ghostEl }
}

// ---- Plate (MyPlate layout: veg+fruit = half, grain ¼, protein ¼, dairy cup) --
const SEC_STYLE = {
  veg: { bg: 'bg-green-50', on: 'bg-green-100', border: 'border-green-300', chip: 'text-green-700', badge: 'bg-green-600' },
  grain: { bg: 'bg-amber-50', on: 'bg-amber-100', border: 'border-amber-300', chip: 'text-amber-700', badge: 'bg-amber-600' },
  protein: { bg: 'bg-orange-50', on: 'bg-orange-100', border: 'border-orange-300', chip: 'text-orange-700', badge: 'bg-orange-600' },
  dairy: { bg: 'bg-blue-50', on: 'bg-blue-100', border: 'border-blue-300', chip: 'text-blue-700', badge: 'bg-blue-600' },
}

// Largest square tile size so that n tiles fit inside w×h (with gap).
function fitTile(w, h, n, gap) {
  if (!n || w <= 0 || h <= 0) return 0
  let best = 0
  for (let cols = 1; cols <= n; cols++) {
    const rows = Math.ceil(n / cols)
    const size = Math.min((w - gap * (cols - 1)) / cols, (h - gap * (rows - 1)) / rows)
    if (size > best) best = size
  }
  return Math.floor(Math.min(best, 64)) // cap so 1-2 items don't become huge
}

function useSize() {
  const ref = useRef(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, size]
}

function Section({ sec, label, items, over, onRemove, className = '' }) {
  const s = SEC_STYLE[sec]
  const [boxRef, { w, h }] = useSize()
  const gap = 6
  const tile = fitTile(w, h, items.length, gap)
  const emoji = Math.max(12, tile * 0.6)
  const xBtn = Math.max(12, Math.min(18, tile * 0.32))
  return (
    <div
      data-drop={onRemove ? sec : undefined}
      className={`relative p-1.5 flex flex-col items-center border-2 border-dashed transition-all min-w-0 min-h-0 ${s.border} ${items.length ? s.on : s.bg} ${over === sec ? 'drop-over scale-[1.02]' : ''} ${className}`}
    >
      <span className={`shrink-0 max-w-full truncate leading-4 font-black px-1.5 rounded-full bg-white shadow-sm pointer-events-none ${s.chip}`} style={{ fontSize: w ? Math.max(8, Math.min(11, w / 9)) : 10 }}>{label}</span>
      {/* tiles shrink/grow smoothly so every item always stays fully visible */}
      <div ref={boxRef} className="flex-1 w-full min-h-0 mt-1 flex flex-wrap justify-center content-center" style={{ gap }}>
        {items.map((it) => {
          const f = getFood(it.id)
          if (!f) return null
          return (
            <div
              key={it.id}
              className="relative bg-white rounded-[30%] shadow-sm border border-black/5 flex items-center justify-center anim-pop"
              style={{ width: tile, height: tile, transition: 'width .3s ease, height .3s ease' }}
            >
              <span className="leading-none" style={{ fontSize: emoji, transition: 'font-size .3s ease' }}>{f.emoji}</span>
              {it.count > 1 && <span className={`absolute -bottom-1 -end-1 text-[9px] font-black text-white px-1 rounded-full ${s.badge}`}>×{it.count}</span>}
              {onRemove && (
                <button
                  onClick={() => onRemove(sec, it.id)}
                  aria-label="remove"
                  className="absolute -top-1 -start-1 bg-red-500 text-white rounded-full font-bold shadow leading-none flex items-center justify-center"
                  style={{ width: xBtn, height: xBtn, fontSize: xBtn * 0.7 }}
                >
                  ×
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function Plate({ items, over, onRemove, small }) {
  const { t } = useT()
  return (
    <div className={`flex items-end gap-2 mx-auto w-full ${small ? 'max-w-[300px]' : 'max-w-[380px]'}`}>
      <div className="flex-1 aspect-square rounded-[40px] bg-white border-[6px] border-white shadow-xl p-2 grid grid-cols-2 grid-rows-2 gap-2">
        <Section sec="veg" label={t('vegFruits')} items={items.veg} over={over} onRemove={onRemove} className="row-span-2 rounded-[30px]" />
        <Section sec="grain" label={t('grains')} items={items.grain} over={over} onRemove={onRemove} className="rounded-[26px]" />
        <Section sec="protein" label={t('protein')} items={items.protein} over={over} onRemove={onRemove} className="rounded-[26px]" />
      </div>
      {/* dairy = cup beside the plate, like MyPlate */}
      <Section sec="dairy" label={t('dairy')} items={items.dairy} over={over} onRemove={onRemove} className="w-[26%] aspect-[3/4] rounded-b-[28px] rounded-t-xl shadow-lg" />
    </div>
  )
}

export const emptyPlate = () => ({ veg: [], grain: [], protein: [], dairy: [] })

// ---- Modal & misc -------------------------------------------------------------
export function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm flex flex-col items-center text-center gap-4 anim-pop shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

export const Card = ({ className = '', children, ...p }) => (
  <div className={`bg-white rounded-3xl border border-[var(--border)] shadow-sm p-4 ${className}`} {...p}>
    {children}
  </div>
)
