// ---------------------------------------------------------------------------
// Android back button: components register what "back" means for them.
// The handler with the highest level wins (ties: the latest one), so a modal
// closes before an exercise screen, which closes before a tab change.
//   levels: 0 screen root · 1 tab · 2 sub-view · 3 full-screen overlay · 4 modal
// ---------------------------------------------------------------------------
import { useEffect, useRef } from 'react'

let seq = 0
const stack = []

export function handleBack() {
  if (!stack.length) return false
  const top = stack.reduce((a, b) => (b.level > a.level || (b.level === a.level && b.seq > a.seq) ? b : a))
  top.fn()
  return true
}

export function useBack(fn, level, active = true) {
  const ref = useRef(fn)
  ref.current = fn
  useEffect(() => {
    if (!active) return
    const item = { fn: () => ref.current(), level, seq: ++seq }
    stack.push(item)
    return () => {
      const i = stack.indexOf(item)
      if (i >= 0) stack.splice(i, 1)
    }
  }, [active, level])
}
