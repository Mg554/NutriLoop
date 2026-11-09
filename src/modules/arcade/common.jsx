// Shared bits for the mini games: hearts, the "learn" card that explains a
// mistake with a fact from the fact bank, section labels, helpers.
import { useEffect } from 'react'
import { say, sfx } from '../../sfx'
import { useT } from '../../ui'

export const SEC = {
  veg: { emoji: '🥦', ar: 'خضار وفواكه', en: 'Veggies & fruit', cls: 'bg-green-100 border-green-300' },
  grain: { emoji: '🍞', ar: 'نشويات', en: 'Grains', cls: 'bg-amber-100 border-amber-300' },
  protein: { emoji: '🍗', ar: 'بروتين', en: 'Protein', cls: 'bg-orange-100 border-orange-300' },
  dairy: { emoji: '🥛', ar: 'ألبان', en: 'Dairy', cls: 'bg-blue-100 border-blue-300' },
}

export const shuffle = (a) => {
  const x = [...a]
  for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]] }
  return x
}
export const pick = (a) => a[Math.floor(Math.random() * a.length)]

export function Hearts({ n, max = 3 }) {
  return (
    <span className="font-black text-sm bg-rose-50 px-2.5 py-1 rounded-full tracking-tight" aria-label={`hearts ${n}`}>
      {Array.from({ length: Math.max(max, n) }, (_, i) => (i < n ? '❤️' : '🤍')).join('')}
    </span>
  )
}

export const Pill = ({ className = '', children }) => <span className={`font-black px-3 py-1 rounded-full text-sm ${className}`}>{children}</span>

// Full-screen-ish card shown after a mistake: what was right + a fact.
export function LearnCard({ title, fact, onNext, tone = 'oops' }) {
  const { lang, t } = useT()
  useEffect(() => { if (fact) say(fact[lang], lang) }, [fact, lang])
  return (
    <div className="fixed inset-0 z-[60] bg-black/40 flex items-end sm:items-center justify-center p-3 anim-pop" role="dialog">
      <div className="w-full max-w-md bg-white rounded-3xl p-5 space-y-3 shadow-2xl">
        <p className={`font-black text-lg ${tone === 'ok' ? 'text-green-700' : 'text-rose-600'}`}>{title}</p>
        {fact && (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3 flex gap-3 items-start">
            <span className="text-4xl">{fact.emoji}</span>
            <div>
              <p className="text-[11px] font-black text-amber-700">💡 {t('gaDidYouKnow')}</p>
              <p className="font-bold leading-relaxed">{fact[lang]}</p>
            </div>
          </div>
        )}
        <button onClick={() => { sfx.pop(); onNext() }} className="w-full py-3 rounded-2xl bg-[var(--primary)] text-white font-black">{t('gaGotIt')}</button>
      </div>
    </div>
  )
}
