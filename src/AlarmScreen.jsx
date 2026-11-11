// Full-screen ringing alarm: big clock, looping tone, snooze and "I'm up!".
import { useEffect, useRef, useState } from 'react'
import { useBack } from './backStack'
import { toneUrl } from './alarms'

export default function AlarmScreen({ alarm, child, tone = 'birds', lang, onStop, onSnooze }) {
  const ar = lang === 'ar'
  const audio = useRef(null)
  const [now, setNow] = useState(new Date())
  useBack(() => onStop(), 5)
  useEffect(() => {
    const a = new Audio(toneUrl(tone))
    a.loop = true
    a.volume = 1
    a.play().catch(() => {})
    audio.current = a
    navigator.vibrate?.([600, 300, 600, 300, 600])
    const id = setInterval(() => { setNow(new Date()); navigator.vibrate?.([500, 400]) }, 2000)
    // stop ringing by itself after 5 minutes
    const stop = setTimeout(() => a.pause(), 5 * 60000)
    return () => { a.pause(); clearInterval(id); clearTimeout(stop); navigator.vibrate?.(0) }
  }, [tone])
  const hm = now.toLocaleTimeString(ar ? 'ar-EG' : 'en', { hour: '2-digit', minute: '2-digit' })
  const title = alarm.kind === 'wake'
    ? (ar ? `صباح الخير${child ? ' يا ' + child.name : ''}!` : `Good morning${child ? ' ' + child.name : ''}!`)
    : alarm.label || (ar ? 'منبه' : 'Alarm')
  return (
    <div className="fixed inset-0 z-[90] flex flex-col items-center justify-between p-8 text-white text-center" role="alertdialog" aria-label="alarm"
      style={{ background: alarm.kind === 'wake' ? 'linear-gradient(180deg,#fb923c 0%,#f472b6 55%,#7c3aed 100%)' : 'linear-gradient(180deg,#0ea5e9,#6366f1)' }}>
      <div className="pt-[max(16px,env(safe-area-inset-top))]" />
      <div className="flex flex-col items-center gap-3">
        <div className="text-[110px] leading-none anim-bounce">{alarm.kind === 'wake' ? '🌅' : alarm.emoji || '⏰'}</div>
        <div className="text-6xl font-black tabular-nums drop-shadow" dir="ltr">{hm}</div>
        <h1 className="text-2xl font-black">{title}</h1>
        {child && <p className="text-lg font-bold opacity-90">{child.avatar} {child.name}</p>}
      </div>
      <div className="w-full max-w-sm space-y-3 pb-[max(16px,env(safe-area-inset-bottom))]">
        <button onClick={onStop} className="w-full py-5 rounded-3xl bg-white text-[#F2533C] font-black text-2xl shadow-xl active:scale-95">
          {alarm.kind === 'wake' ? (ar ? '☀️ صحيت!' : "☀️ I'm up!") : (ar ? '✅ تمام' : '✅ Done')}
        </button>
        <button onClick={onSnooze} className="w-full py-3.5 rounded-3xl bg-white/20 border-2 border-white/60 font-black text-lg active:scale-95">
          😴 {ar ? 'غفوة ٥ دقايق' : 'Snooze 5 min'}
        </button>
      </div>
    </div>
  )
}
