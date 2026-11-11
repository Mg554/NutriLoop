// Root: profile picker -> child app, or PIN -> parent dashboard. Handles events.
import { useEffect, useRef, useState } from 'react'
import ChildApp from './ChildApp'
import { ParentDashboard, PinGate, RecoverGate } from './Parent'
import { handleBack } from './backStack'
import { initNative } from './native'
import { onReminderTap, scheduleReminders } from './reminders'
import { alarmOccurrences, onAlarm, scheduleAlarms, snoozeAlarm, stopAlarmBurst } from './alarms'
import AlarmScreen from './AlarmScreen'
import { autoUpdate, markAppReady } from './updater'
import { BADGES, STR } from './data'
import { useStore } from './store'
import { audio, confetti, sfx, stopSpeech } from './sfx'
import { LangCtx, Modal, resolve } from './ui'
import logo from './assets/logo.svg'

export default function App() {
  const { state, actions, onEvent } = useStore()
  const { settings, children } = state
  const lang = settings.lang
  const [screen, setScreen] = useState('pick') // pick | child | pin | parent
  const [childId, setChildId] = useState(null)
  const [deepTab, setDeepTab] = useState(null) // { tab, n } from a tapped reminder
  const [reportFor, setReportFor] = useState(null) // weekly-report reminder: open it after the PIN
  const [toastMsg, setToastMsg] = useState('')
  const [modals, setModals] = useState([])
  const modal = modals[0]
  const setModal = (m) => (m ? setModals((q) => [...q, m]) : setModals((q) => q.slice(1)))
  const toastTimer = useRef()

  const child = children.find((c) => c.id === childId)
  const gender = child?.gender || 'm'
  const tr = (key, vars) => resolve((gender === 'f' && STR[lang][key + 'F']) || STR[lang][key], gender, vars)

  const toast = (m) => {
    setToastMsg(m)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(''), 2600)
  }

  useEffect(() => {
    // quick mute (child header / parent dashboard) silences sounds AND speech
    audio.muted = !settings.sound || !!settings.mute
    audio.speak = settings.speak && !settings.mute
    if (settings.mute) stopSpeech()
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  }, [settings.sound, settings.speak, settings.mute, lang])

  // Updates: confirm this version started fine, then look for a newer one
  // (web updates download silently and apply on the next launch)
  const [apkUpdate, setApkUpdate] = useState(false)
  useEffect(() => {
    markAppReady()
    const id = setTimeout(() => autoUpdate().then((r) => setApkUpdate(r?.type === 'apk' || r?.type === 'ipa')), 4000)
    return () => clearTimeout(id)
  }, [])

  // Android: hardware back button + status bar
  useEffect(() => initNative(handleBack), [])
  // test hook: lets automated tests press "back" in a browser
  useEffect(() => { window.__nlBack = handleBack }, [])

  // Reminders: re-plan the next 3 days whenever progress or settings change
  // (debounced), so today's reminder disappears once the task is done.
  useEffect(() => {
    const id = setTimeout(() => { scheduleReminders(state).catch(() => {}); scheduleAlarms(state).catch(() => {}) }, 1500)
    return () => clearTimeout(id)
  }, [state])

  // ⏰ ringing alarm: from a notification (phone) or the in-app clock (any device)
  const [ringing, setRinging] = useState(null)
  const handled = useRef(new Set())
  const ring = (a) => { if (!a?.key || handled.current.has(a.key)) return; handled.current.add(a.key); setRinging(a) }
  useEffect(() => onAlarm(ring), [])
  const stRef = useRef(state); stRef.current = state
  useEffect(() => {
    let last = new Date()
    const id = setInterval(() => {
      const now = new Date()
      const due = alarmOccurrences(stRef.current, last, 1).filter((o) => o.at <= now)
      last = now
      if (due.length) ring(due[0])
    }, 15000)
    return () => clearInterval(id)
  }, [])
  const stopAlarm = () => {
    const a = ringing
    setRinging(null)
    stopAlarmBurst(a.key)
    // waking up opens the child's morning routine
    if (a.kind === 'wake' && a.child) { setChildId(a.child); setScreen('child'); setDeepTab({ tab: 'move', n: Date.now() }) }
  }
  const snooze = () => {
    const a = ringing
    setRinging(null)
    const again = { ...a, key: a.key + '+z' + Date.now() }
    stopAlarmBurst(a.key).then(() => snoozeAlarm(again, stRef.current))
    setTimeout(() => ring(again), 5 * 60000)
  }

  // Tapping a reminder opens that child (or the picker) on the right tab
  useEffect(
    () =>
      onReminderTap(({ tab, child }) => {
        const c = child && state.children.find((x) => x.id === child)
        if (tab === 'report') {
          setReportFor((c || state.children[0])?.id || null)
          setChildId(null)
          setScreen('pin')
        } else if (c) {
          setChildId(c.id)
          setScreen('child')
          setDeepTab({ tab, n: Date.now() })
        } else setScreen('pick')
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.children.length],
  )

  // Roll the day over (quests/water reset) on open, every minute, and on refocus.
  useEffect(() => {
    if (!childId) return
    actions.touchDay(childId)
    const id = setInterval(() => actions.touchDay(childId), 60000)
    const vis = () => document.visibilityState === 'visible' && actions.touchDay(childId)
    document.addEventListener('visibilitychange', vis)
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', vis) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId])

  // Side effects for game events (run after state commit, never inside setState).
  onEvent((events) => {
    // Several rewards can land on one action: show ONE popup for them, not five.
    const badges = events.filter((e) => e.type === 'badge').map((e) => BADGES.find((b) => b.id === e.id))
    const level = events.filter((e) => e.type === 'levelUp').pop()
    const tree = events.some((e) => e.type === 'treeGrown')
    for (const e of events) {
      switch (e.type) {
        case 'questDone': sfx.sparkle(); confetti(); break
        case 'questPending': sfx.pop(); toast('⏳ ' + tr('pending')); break
        case 'allQuests': setTimeout(() => { sfx.fanfare(); confetti() }, 400); break
        case 'water': sfx.sparkle(); break
        case 'waterGoal': confetti(); toast((e.move ? '⚡' : '💧') + '🎉 +30 XP'); break
        case 'undo': sfx.whoosh(); break
        case 'plateSaved': sfx.fanfare(); confetti(); toast(tr('saved') + (e.xp ? ` +${e.xp} XP` : '')); break
        case 'gameOver': break // the game arena shows its own result screen
        case 'eid': setTimeout(() => { sfx.fanfare(); confetti(); setTimeout(confetti, 700); setModal({ emoji: '🎉🌙', title: tr('eid'), body: resolve(STR[lang].eidSub, gender, { name: child?.name || '' }), sub: '+50 XP' }) }, 800); break
        case 'toast': if (e.key === 'streakUp') toast(`🔥 ${e.n} ${tr('streak')}`); break
      }
    }
    if (badges.length || level || tree) {
      setTimeout(() => {
        sfx.levelUp(); confetti()
        setModal({
          emoji: badges.length ? badges.map((b) => b.emoji).join(' ') : tree ? '🌳' : '🚀',
          title: badges.length ? tr('newBadge') : tree ? STR[lang].stages[4] : tr('levelUp'),
          body: badges.map((b) => b.title[lang]).join(' • '),
          sub: [badges.length && `+${badges.length * 50} XP`, level && `🚀 Lv ${level.level}`, tree && badges.length && '🌳'].filter(Boolean).join('  '),
        })
      }, 1100)
    }
  })

  const toggleMute = () => actions.setSetting('mute', !settings.mute)
  const toggleLang = () => actions.setSetting('lang', lang === 'ar' ? 'en' : 'ar')

  let body
  if (screen === 'child' && child) {
    body = (
      <ChildApp
        deepTab={deepTab}
        siblings={children.filter((c) => c.id !== child.id)}
        child={child}
        progress={state.progress[child.id] || {}}
        settings={settings}
        actions={actions}
        toast={toast}
        onLang={toggleLang}
        onMute={toggleMute}
        onSwitch={() => { setScreen('pick'); setChildId(null) }}
      />
    )
  } else if (screen === 'pin') {
    body = <PinGate hasPin={!!state.pin} pinHash={state.pin} onSet={actions.setPin} onOk={() => setScreen('parent')} onCancel={() => { setReportFor(null); setScreen('pick') }} onForgot={() => setScreen('recover')} />
  } else if (screen === 'recover') {
    body = <RecoverGate recoveryHash={state.recovery} onOk={() => setScreen('newpin')} onCancel={() => setScreen('pin')} />
  } else if (screen === 'newpin') {
    body = <PinGate hasPin={false} onSet={actions.setPin} onOk={() => setScreen('parent')} onCancel={() => setScreen('pick')} />
  } else if (screen === 'parent') {
    body = <ParentDashboard state={state} actions={actions} toast={toast} initialReport={reportFor} onClose={() => { setReportFor(null); setScreen('pick') }} />
  } else {
    body = (
      <div className="h-full flex flex-col items-center justify-center gap-6 p-6 anim-pop max-w-xl mx-auto">
        <img src={logo} alt="NutriLoop" className="w-28 h-28 anim-bounce drop-shadow-lg" />
        <h1 className="font-black text-2xl text-center">NutriLoop<br /><span className="text-base text-[var(--text-soft)]">{lang === 'ar' ? 'رحلة الأكل الصحي' : 'Healthy food adventure'}</span></h1>
        {children.length > 0 && <h2 className="font-bold">{STR[lang].whoPlays}</h2>}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
          {children.map((c) => (
            <button key={c.id} onClick={() => { sfx.pop(); setChildId(c.id); setScreen('child') }} className="bg-white rounded-3xl border-2 border-[var(--border)] p-4 flex flex-col items-center gap-1 shadow-sm active:scale-95 hover:border-[var(--primary)]">
              <span className="text-5xl">{c.avatar}</span>
              <span className="font-black">{c.name}</span>
            </button>
          ))}
        </div>
        {children.length === 0 && (
          <p className="text-center text-sm text-[var(--text-soft)]">
            {lang === 'ar' ? 'أول مرة؟ الأهل يعملوا رمز سري ويضيفوا الأولاد' : 'First time? Parents: set a PIN and add your kids'}
          </p>
        )}
        <div className="flex gap-2">
          <button onClick={() => setScreen('pin')} className="px-5 py-2.5 rounded-full bg-gray-900 text-white text-sm font-bold">👨‍👩‍👧 {STR[lang].parent}{apkUpdate && <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 ms-1.5 align-middle" aria-label="update" />}</button>
          <button onClick={toggleLang} className="px-4 py-2.5 rounded-full bg-white border border-[var(--border)] text-sm font-bold">{lang === 'ar' ? 'English' : 'عربي'}</button>
        </div>
      </div>
    )
  }

  return (
    <LangCtx.Provider value={{ lang, gender }}>
      <div className="h-full">{body}</div>
      {ringing && <AlarmScreen alarm={ringing} child={children.find((c) => c.id === ringing.child)} tone={settings.alarms?.tone} lang={lang} onStop={stopAlarm} onSnooze={snooze} />}
      {toastMsg && <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[70] bg-black/85 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg anim-pop max-w-[90vw] text-center">{toastMsg}</div>}
      {modal && (
        <Modal onClose={() => setModal(null)}>
          <span className="text-7xl anim-bounce">{modal.emoji}</span>
          <h2 className="text-xl font-black text-[var(--primary)]">{modal.title}</h2>
          <p className="font-bold">{modal.body}</p>
          {modal.sub && <p dir="ltr" className="text-xs font-bold text-[var(--primary)] bg-[var(--primary-soft)] px-3 py-1 rounded-full">{modal.sub}</p>}
          <button onClick={() => setModal(null)} className="w-full py-3 bg-[var(--primary)] text-white font-black rounded-2xl">{STR[lang].ok}</button>
        </Modal>
      )}
    </LangCtx.Provider>
  )
}
