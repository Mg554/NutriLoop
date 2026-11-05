// Parent area: PIN gate, children profiles, approvals, weekly summary, settings, backup.
import { useEffect, useRef, useState } from 'react'
import { AVATARS, QUEST_POOL, waterGoalForAge } from './data'
import { moveGoalForAge } from './modules/move/data'
import Kid, { PALETTES, kidProps } from './modules/move/Kid'
import GrowthView from './modules/growth/Growth'
import { hashPin, newRecoveryCode, normCode, todayStr } from './store'
import { isNative, shareBackup } from './native'
import { useBack } from './backStack'
import { Card, useT } from './ui'

export function PinGate({ hasPin, pinHash, onOk, onSet, onCancel, onForgot }) {
  const { t } = useT()
  useBack(onCancel, 2)
  const [pin, setPin] = useState('')
  const [first, setFirst] = useState(null)
  const [err, setErr] = useState('')
  const title = hasPin ? t('pinEnter') : first ? t('pinConfirm') : t('pinSet')

  const press = (d) => {
    setErr('')
    const next = (pin + d).slice(0, 4)
    setPin(next)
    if (next.length < 4) return
    setTimeout(() => {
      setPin('')
      if (hasPin) {
        if (hashPin(next) === pinHash) onOk()
        else setErr(t('pinWrong'))
      } else if (!first) setFirst(next)
      else if (first === next) { onSet(next); onOk() }
      else { setFirst(null); setErr(t('pinMismatch')) }
    }, 150)
  }

  return (
    <div className="h-full flex flex-col items-center justify-center gap-6 p-6 anim-pop">
      <div className="text-5xl">🔐</div>
      <h2 className="font-black text-lg text-center">{title}</h2>
      <div className="flex gap-3" dir="ltr">
        {[0, 1, 2, 3].map((i) => <div key={i} className={`w-4 h-4 rounded-full ${i < pin.length ? 'bg-[var(--primary)]' : 'bg-gray-300'}`} />)}
      </div>
      {err && <p className="text-red-500 font-bold text-sm">{err}</p>}
      <div className="grid grid-cols-3 gap-3" dir="ltr">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
          <button key={d} onClick={() => press(String(d))} className="w-18 h-18 w-[72px] h-[72px] rounded-2xl bg-white border border-[var(--border)] text-2xl font-black shadow-sm active:scale-90">{d}</button>
        ))}
        <button onClick={onCancel} className="w-[72px] h-[72px] rounded-2xl text-sm font-bold text-gray-500">{t('back')}</button>
        <button onClick={() => press('0')} className="w-[72px] h-[72px] rounded-2xl bg-white border border-[var(--border)] text-2xl font-black shadow-sm active:scale-90">0</button>
        <button onClick={() => setPin(pin.slice(0, -1))} className="w-[72px] h-[72px] rounded-2xl text-2xl">⌫</button>
      </div>
      {hasPin && onForgot && <button onClick={onForgot} className="text-sm font-bold text-[var(--primary)] underline underline-offset-4">{t('pinForgot')}</button>}
    </div>
  )
}

// Forgot PIN: type the recovery code. Old installs without a code get a
// grown-up maths check instead (3 multiplications), so nobody is locked out.
export function RecoverGate({ recoveryHash, onOk, onCancel }) {
  const { t } = useT()
  useBack(onCancel, 2)
  const [code, setCode] = useState('')
  const [err, setErr] = useState('')
  const [qs] = useState(() => Array.from({ length: 3 }, () => [12 + Math.floor(Math.random() * 37), 6 + Math.floor(Math.random() * 8)]))
  const [ans, setAns] = useState(['', '', ''])
  const check = () => {
    if (recoveryHash) {
      if (hashPin(normCode(code)) === recoveryHash) onOk()
      else setErr(t('recoverWrong'))
    } else if (qs.every(([a, b], i) => +ans[i] === a * b)) onOk()
    else setErr(t('recoverWrong'))
  }
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4 p-6 anim-pop max-w-sm mx-auto">
      <div className="text-5xl">🗝️</div>
      <h2 className="font-black text-lg text-center">{recoveryHash ? t('recoverTitle') : t('recoverMath')}</h2>
      {recoveryHash ? (
        <input id="recover-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="XXXX-XXXX" autoCapitalize="characters" dir="ltr"
          className="w-full text-center text-2xl font-black tracking-widest px-4 py-3 rounded-2xl border-2 border-[var(--border)] outline-none focus:border-[var(--primary)]" />
      ) : (
        <div className="space-y-2 w-full" dir="ltr">
          {qs.map(([a, b], i) => (
            <label key={i} className="flex items-center gap-3 justify-center font-black text-xl">
              {a} × {b} =
              <input id={`recover-q${i}`} inputMode="numeric" value={ans[i]} onChange={(e) => setAns(ans.map((x, j) => (j === i ? e.target.value : x)))}
                className="w-24 text-center px-2 py-2 rounded-xl border-2 border-[var(--border)] outline-none focus:border-[var(--primary)]" />
            </label>
          ))}
        </div>
      )}
      {err && <p className="text-red-500 font-bold text-sm">{err}</p>}
      <div className="flex gap-2 w-full">
        <button onClick={check} className="flex-1 py-3 rounded-2xl bg-[var(--primary)] text-white font-black">{t('recoverGo')}</button>
        <button onClick={onCancel} className="px-5 py-3 rounded-2xl border border-[var(--border)] font-bold">{t('back')}</button>
      </div>
    </div>
  )
}

function RecoveryCodeCard({ code, onDone }) {
  const { t } = useT()
  const [copied, setCopied] = useState(false)
  const copy = () => navigator.clipboard?.writeText(code).then(() => setCopied(true)).catch(() => {})
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 anim-pop">
        <div className="text-5xl">🗝️</div>
        <h2 className="font-black text-lg">{t('recoverShowTitle')}</h2>
        <p className="text-sm text-[var(--text-soft)]">{t('recoverShowSub')}</p>
        <div className="text-3xl font-black tracking-widest bg-[var(--surface-2)] rounded-2xl py-4 select-all" dir="ltr">{code}</div>
        <button onClick={copy} className="text-sm font-bold text-[var(--primary)]">{copied ? '✅' : '📋'} {t('copy')}</button>
        <button onClick={onDone} className="w-full py-3 rounded-2xl bg-gray-900 text-white font-black">{t('recoverSaved')}</button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
function ChildForm({ initial, onSave, onCancel, onDelete }) {
  const { t } = useT()
  const [c, setC] = useState(initial || { id: 'c' + Date.now(), name: '', gender: 'f', age: 6, avatar: AVATARS[0], waterGoal: null })
  const set = (k, v) => setC((x) => ({ ...x, [k]: v }))
  const goal = c.waterGoal || waterGoalForAge(c.age)
  const [sure, setSure] = useState(false)
  return (
    <Card className="space-y-4 anim-pop">
      <label className="block">
        <span className="text-xs font-bold text-[var(--text-soft)]">{t('name')}</span>
        <input value={c.name} onChange={(e) => set('name', e.target.value)} maxLength={20} className="mt-1 w-full px-4 py-2.5 rounded-xl border border-[var(--border)] outline-none focus:border-[var(--primary)]" />
      </label>
      <div className="flex gap-2">
        {[['m', '👦', t('boy')], ['f', '👧', t('girl')]].map(([g, e, l]) => (
          <button key={g} onClick={() => set('gender', g)} className={`flex-1 py-2.5 rounded-xl border-2 font-bold ${c.gender === g ? 'border-[var(--primary)] bg-[var(--primary-soft)]' : 'border-[var(--border)]'}`}>{e} {l}</button>
        ))}
      </div>
      {/* live avatar preview + outfit */}
      <div className="flex gap-3 items-center bg-[var(--bg-soft)] rounded-2xl p-2">
        <div className="shrink-0 bg-white rounded-2xl border border-[var(--border)]"><Kid ex="jacks" {...kidProps(c)} size={90} /></div>
        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex gap-1.5">
            {[['sport', '👕', t('outfitSport')], ['tracksuit', '🧥', t('outfitSuit')]].map(([v, e, l]) => {
              const cur = kidProps(c).outfit
              return <button key={v} onClick={() => set('outfit', v)} className={`flex-1 py-2 rounded-xl border-2 text-[11px] font-bold ${cur === v ? 'border-[var(--primary)] bg-[var(--primary-soft)]' : 'border-[var(--border)] bg-white'}`}>{e} {l}</button>
            })}
          </div>
          <div className="flex gap-2 justify-center">
            {Object.entries(PALETTES).map(([k, p]) => {
              const cur = c.color || (c.gender === 'f' ? 'pink' : 'blue')
              return <button key={k} aria-label={k} onClick={() => set('color', k)} className={`w-8 h-8 rounded-full border-4 ${cur === k ? 'border-gray-900 scale-110' : 'border-white'} shadow`} style={{ background: `linear-gradient(135deg, ${p.main} 50%, ${p.hijab} 50%)` }} />
            })}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        {[['short', '💇', t('lookShort')], ['ponytail', '🎀', t('lookPony')], ['hijab', '🧕', t('lookHijab')]].map(([v, e, l]) => {
          const cur = c.look || (c.gender === 'f' ? 'ponytail' : 'short')
          return <button key={v} onClick={() => { set('look', v); if (v === 'hijab') set('outfit', 'tracksuit') }} className={`flex-1 py-2 rounded-xl border-2 text-xs font-bold ${cur === v ? 'border-[var(--primary)] bg-[var(--primary-soft)]' : 'border-[var(--border)]'}`}>{e} {l}</button>
        })}
      </div>
      <label className="block">
        <span className="text-xs font-bold text-[var(--text-soft)]">{t('age')}: {c.age}</span>
        <input type="range" min={2} max={15} value={c.age} onChange={(e) => set('age', +e.target.value)} className="w-full accent-[var(--primary)]" />
      </label>
      <div>
        <span className="text-xs font-bold text-[var(--text-soft)]">{t('avatar')}</span>
        <div className="grid grid-cols-6 gap-2 mt-1">
          {AVATARS.map((a) => (
            <button key={a} onClick={() => set('avatar', a)} className={`text-2xl p-1.5 rounded-xl ${c.avatar === a ? 'bg-[var(--primary-soft)] ring-2 ring-[var(--primary)]' : 'bg-gray-50'}`}>{a}</button>
          ))}
        </div>
      </div>
      <label className="block">
        <span className="text-xs font-bold text-[var(--text-soft)]">{t('waterGoal')}</span>
        <input type="number" step={100} min={500} max={3000} value={goal} onChange={(e) => set('waterGoal', +e.target.value || null)} className="mt-1 w-full px-4 py-2.5 rounded-xl border border-[var(--border)]" dir="ltr" />
      </label>
      <label className="block">
        <span className="text-xs font-bold text-[var(--text-soft)]">{t('moveGoal')}</span>
        <input type="number" step={5} min={10} max={180} value={c.moveGoal || moveGoalForAge(c.age)} onChange={(e) => set('moveGoal', +e.target.value || null)} className="mt-1 w-full px-4 py-2.5 rounded-xl border border-[var(--border)]" dir="ltr" />
      </label>
      <div className="flex gap-2">
        <button disabled={!c.name.trim()} onClick={() => onSave({ ...c, name: c.name.trim() })} className="flex-1 py-3 rounded-xl bg-[var(--primary)] text-white font-black disabled:opacity-40">{t('save')}</button>
        <button onClick={onCancel} className="px-4 py-3 rounded-xl border border-[var(--border)] font-bold">{t('cancel')}</button>
        {onDelete && <button onClick={() => (sure ? onDelete(c.id) : setSure(true))} className={`px-4 py-3 rounded-xl font-bold ${sure ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600'}`}>{sure ? '⚠️ ' + t('del') + '?' : t('del')}</button>}
      </div>
      {sure && <p className="text-xs text-red-600 font-bold">{t('confirmDel')}</p>}
      <div className="hidden">
      </div>
    </Card>
  )
}

// ---------------------------------------------------------------------------
function lastDays(n) {
  const out = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    out.push(todayStr(d))
  }
  return out
}

function WeekSummary({ child, progress, onGrowth }) {
  const { t, L, lang } = useT()
  const days = lastDays(7)
  const rows = days.map((d) => progress?.history?.[d] || { plates: 0, quests: 0, water: 0, missing: {} })
  const sum = (k) => rows.reduce((a, r) => a + (r[k] || 0), 0)
  const missing = ['veg', 'grain', 'protein', 'dairy'].map((s) => [s, rows.reduce((a, r) => a + (r.missing?.[s] || 0), 0)]).filter(([, n]) => n > 0)
  const goal = child.waterGoal || waterGoalForAge(child.age)
  const max = Math.max(1, ...rows.map((r) => r.plates))
  const secName = { veg: 'vegFruits', grain: 'grains', protein: 'protein', dairy: 'dairy' }
  return (
    <Card className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-2xl">{child.avatar}</span>
        <span className="font-black">{child.name}</span>
        <span className="text-xs text-[var(--text-soft)] ms-auto">{t('week')}</span>
        <button onClick={onGrowth} className="px-2.5 py-1 rounded-full bg-[var(--primary)] text-white text-[11px] font-black">📏 {t('growth')}</button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
        <div className="bg-amber-50 rounded-xl p-2"><div className="font-black text-lg">{sum('plates')}</div><div className="text-[11px]">{t('plates')}</div></div>
        <div className="bg-green-50 rounded-xl p-2"><div className="font-black text-lg">{sum('quests')}</div><div className="text-[11px]">{t('questsDone')}</div></div>
        <div className="bg-blue-50 rounded-xl p-2"><div className="font-black text-lg" dir="ltr">{Math.round(sum('water') / 7)}</div><div className="text-[11px]">{t('waterAvg')} / {goal}</div></div>
        <div className="bg-orange-50 rounded-xl p-2"><div className="font-black text-lg" dir="ltr">{Math.round(sum('move') / 60 / 7)}</div><div className="text-[11px]">{t('moveAvg')} / {child.moveGoal || moveGoalForAge(child.age)}</div></div>
      </div>
      {/* plates per day mini bars */}
      <div className="flex items-end gap-1 h-14" dir="ltr">
        {rows.map((r, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
            <div className="w-full bg-[var(--primary)] rounded-t" style={{ height: `${(r.plates / max) * 40}px`, opacity: r.plates ? 1 : 0.15, minHeight: 3 }} />
            <span className="text-[9px] text-gray-400">{new Date(days[i]).toLocaleDateString(lang === 'ar' ? 'ar' : 'en', { weekday: 'narrow' })}</span>
          </div>
        ))}
      </div>
      {missing.length > 0 && (
        <div className="text-xs">
          <span className="font-bold">{t('sectionsMissing')}: </span>
          {missing.map(([s, n]) => `${L[secName[s]]} (${n})`).join(' • ')}
        </div>
      )}
    </Card>
  )
}

// ---------------------------------------------------------------------------
export function ParentDashboard({ state, actions, onClose, toast }) {
  const { t, pick } = useT()
  const [editing, setEditing] = useState(null) // child object | 'new' | null
  const [changingPin, setChangingPin] = useState(false)
  const [growthFor, setGrowthFor] = useState(null)
  const [showCode, setShowCode] = useState(null)
  const made = useRef(false)
  // Every parent area gets a recovery code once (also older installs).
  useEffect(() => {
    if (state.recovery || made.current) return
    made.current = true
    const code = newRecoveryCode()
    actions.setRecovery(hashPin(normCode(code)))
    setShowCode(code)
  }, [state.recovery, actions])
  useBack(onClose, 0)
  useBack(() => setGrowthFor(null), 2, !!growthFor)
  useBack(() => setEditing(null), 2, !!editing)
  useBack(() => setChangingPin(false), 2, changingPin)
  const codeCard = showCode && <RecoveryCodeCard code={showCode} onDone={() => setShowCode(null)} />
  const { children, progress, settings } = state
  const today = todayStr()

  const pending = children.flatMap((c) =>
    (progress[c.id]?.day?.date === today ? progress[c.id].day.quests : []).filter((q) => q.pending).map((q) => ({ child: c, q })),
  )

  const exportData = () => {
    if (isNative) {
      shareBackup(`nutriloop-backup-${today}.json`, JSON.stringify(state, null, 2)).catch(() => toast(t('importBad')))
      return
    }
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `nutriloop-backup-${today}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }
  const importData = (file) => {
    const r = new FileReader()
    r.onload = () => {
      try {
        const data = JSON.parse(r.result)
        if (data?.v !== 2 || !Array.isArray(data.children)) throw new Error()
        actions.replaceAll(data)
        toast(t('importOk'))
      } catch {
        toast(t('importBad'))
      }
    }
    r.readAsText(file)
  }

  const gChild = children.find((c) => c.id === growthFor)
  if (gChild)
    return (
      <div className="h-full overflow-y-auto no-scrollbar max-w-xl mx-auto p-4 pb-10">
        <GrowthView child={gChild} progress={progress[gChild.id] || {}} actions={actions} onBack={() => setGrowthFor(null)} />
      </div>
    )

  if (changingPin)
    return <PinGate hasPin={false} onSet={(p) => { actions.setPin(p); toast('✅') }} onOk={() => setChangingPin(false)} onCancel={() => setChangingPin(false)} />

  const Toggle = ({ k, label }) => (
    <label className="flex items-center justify-between py-2">
      <span className="text-sm font-bold">{label}</span>
      <button onClick={() => actions.setSetting(k, !settings[k])} className={`w-12 h-7 rounded-full relative transition ${settings[k] ? 'bg-[var(--primary)]' : 'bg-gray-300'}`} role="switch" aria-checked={settings[k]}>
        <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all ${settings[k] ? 'end-0.5' : 'start-0.5'}`} />
      </button>
    </label>
  )

  return (
    <div className="h-full overflow-y-auto no-scrollbar max-w-xl mx-auto p-4 space-y-4 pb-10">
      {codeCard}
      <div className="flex items-center justify-between">
        <h1 className="font-black text-xl">👨‍👩‍👧 {t('parentTitle')}</h1>
        <button onClick={onClose} className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-bold">{t('lock')} 🔒</button>
      </div>

      {/* children */}
      <section className="space-y-2">
        <h2 className="font-black">{t('children')}</h2>
        {editing ? (
          <ChildForm
            initial={editing === 'new' ? null : editing}
            onSave={(c) => { actions.saveChild(c); setEditing(null) }}
            onCancel={() => setEditing(null)}
            onDelete={editing !== 'new' ? (id) => { actions.deleteChild(id); setEditing(null) } : null}
          />
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {children.map((c) => (
              <button key={c.id} onClick={() => setEditing(c)} className="bg-white rounded-2xl border border-[var(--border)] p-3 flex items-center gap-2 text-start">
                <span className="text-3xl">{c.avatar}</span>
                <div><div className="font-black text-sm">{c.name}</div><div className="text-[11px] text-gray-500">{c.gender === 'f' ? t('girl') : t('boy')} • {c.age} • ✏️</div></div>
              </button>
            ))}
            <button onClick={() => setEditing('new')} className="rounded-2xl border-2 border-dashed border-[var(--primary)] text-[var(--primary)] font-black p-3">+ {t('addChild')}</button>
          </div>
        )}
      </section>

      {/* approvals */}
      {settings.approval && (
        <section className="space-y-2">
          <h2 className="font-black">{t('pendingList')}</h2>
          {pending.length === 0 ? (
            <p className="text-sm text-[var(--text-soft)]">{t('noPending')}</p>
          ) : (
            pending.map(({ child, q }) => {
              const def = QUEST_POOL.find((x) => x.id === q.id)
              return (
                <Card key={child.id + q.id} className="flex items-center gap-2 !p-3">
                  <span className="text-2xl">{child.avatar}</span>
                  <div className="flex-1 min-w-0"><div className="font-bold text-sm">{child.name}</div><div className="text-xs text-gray-500 truncate">{def.emoji} {pick(def.title)}</div></div>
                  <button onClick={() => actions.approveQuest(child.id, q.id, true)} className="px-3 py-2 rounded-xl bg-green-500 text-white text-xs font-black">{t('approve')}</button>
                  <button onClick={() => actions.approveQuest(child.id, q.id, false)} className="px-3 py-2 rounded-xl bg-gray-100 text-xs font-bold">{t('reject')}</button>
                </Card>
              )
            })
          )}
        </section>
      )}

      {/* weekly */}
      {children.map((c) => <WeekSummary key={c.id} child={c} progress={progress[c.id]} onGrowth={() => setGrowthFor(c.id)} />)}

      {/* settings */}
      <Card>
        <h2 className="font-black mb-1">{t('settings')}</h2>
        <Toggle k="approval" label={t('approval')} />
        <Toggle k="sound" label={t('sound')} />
        <Toggle k="speak" label={t('speak')} />
        <Toggle k="camera" label={'🎥 ' + t('camSetting')} />
        <div className="flex flex-wrap gap-2 pt-3">
          <button onClick={() => setChangingPin(true)} className="px-3 py-2 rounded-xl border border-[var(--border)] text-sm font-bold">🔑 {t('changePin')}</button>
          <button onClick={exportData} className="px-3 py-2 rounded-xl border border-[var(--border)] text-sm font-bold">💾 {t('exportData')}</button>
          <label className="px-3 py-2 rounded-xl border border-[var(--border)] text-sm font-bold cursor-pointer">
            📂 {t('importData')}
            <input type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files[0] && importData(e.target.files[0])} />
          </label>
        </div>
      </Card>
    </div>
  )
}
