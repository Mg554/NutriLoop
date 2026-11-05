// "Smart coach": counts reps from the camera. Video never leaves the device.
import { useEffect, useRef, useState } from 'react'
import { EXERCISES } from './data'
import { BONES, inFrame, makeCounter, smoother } from './poseCount'
import { loadPose } from './poseLoader'
import { confetti, say, sfx, stopSpeech } from '../../sfx'
import { useT } from '../../ui'
import Kid, { kidProps } from './Kid'
import { useBack } from '../../backStack'

export const CAM_EXERCISES = [
  { id: 'squat', ex: 'squats', mult: 1 },
  { id: 'jacks', ex: 'jacks', mult: 1 },
  { id: 'knees', ex: 'knees', mult: 2 }, // each knee counts
  { id: 'reach', ex: 'reach', mult: 1 },
]
export const camTarget = (c, age) => (age <= 5 ? 8 : age <= 9 ? 12 : 15) * c.mult

export function CameraCoach({ cam, age, child, onClose, onFinish }) {
  const { t, pick, lang } = useT()
  const ex = EXERCISES[cam.ex]
  const target = camTarget(cam, age)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [phase, setPhase] = useState('loading') // loading | error | frame | count | go | done
  const [err, setErr] = useState('')
  const [reps, setReps] = useState(0)
  const [visible, setVisible] = useState(false)
  const [countLeft, setCountLeft] = useState(3)
  const phaseRef = useRef(phase)
  phaseRef.current = phase
  const startedAt = useRef(0)
  const finished = useRef(false)
  const closeRef = useRef(() => {})
  useBack(() => closeRef.current(), 3)

  const finish = (complete) => {
    if (finished.current) return
    finished.current = true
    const secs = startedAt.current ? Math.round((Date.now() - startedAt.current) / 1000) : 0
    if (complete) { sfx.fanfare(); confetti(); say(t('done'), lang) }
    if (complete || secs >= 30) onFinish(secs, complete)
  }

  useEffect(() => {
    let stopped = false
    let stream = null
    let raf = 0
    let busy = false
    let inFrameSince = 0
    const counter = makeCounter(cam.id)
    const smooth = smoother(0.6)
    let pose = null

    const onResults = (res) => {
      if (stopped) return
      const cv = canvasRef.current
      if (!cv) return
      const ctx = cv.getContext('2d')
      const img = res.image
      if (cv.width !== img.width) { cv.width = img.width; cv.height = img.height }
      ctx.drawImage(img, 0, 0, cv.width, cv.height)
      const lm = smooth(res.poseLandmarks || null)
      const ok = inFrame(cam.id, lm)
      setVisible(ok)
      if (lm) {
        ctx.lineWidth = Math.max(4, cv.width / 120)
        ctx.strokeStyle = ok ? '#22c55e' : '#f59e0b'
        ctx.lineCap = 'round'
        for (const [a, b] of BONES) {
          if ((lm[a].visibility ?? 1) < 0.5 || (lm[b].visibility ?? 1) < 0.5) continue
          ctx.beginPath(); ctx.moveTo(lm[a].x * cv.width, lm[a].y * cv.height); ctx.lineTo(lm[b].x * cv.width, lm[b].y * cv.height); ctx.stroke()
        }
        ctx.fillStyle = '#ffffff'
        for (const i of [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28]) {
          if ((lm[i].visibility ?? 1) < 0.5) continue
          ctx.beginPath(); ctx.arc(lm[i].x * cv.width, lm[i].y * cv.height, ctx.lineWidth, 0, Math.PI * 2); ctx.fill()
        }
      }
      const ph = phaseRef.current
      if (ph === 'frame') {
        if (ok) { inFrameSince ||= Date.now(); if (Date.now() - inFrameSince > 1200) setPhase('count') } else inFrameSince = 0
      }
      if (ph === 'go' && ok) {
        const r = counter.update(lm, Date.now())
        if (r.justCounted) {
          setReps(r.reps)
          sfx.pop()
          say(String(r.reps), lang)
          if (r.reps >= target) { setPhase('done'); finish(true) }
        }
      }
    }

    ;(async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw Object.assign(new Error('nocam'), { name: 'NoCam' })
        const [s, p] = await Promise.all([
          navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false }),
          loadPose(),
        ])
        if (stopped) { s.getTracks().forEach((tr) => tr.stop()); return }
        stream = s
        pose = p
        pose.onResults(onResults)
        const v = videoRef.current
        v.srcObject = stream
        await v.play()
        setPhase('frame')
        say(t('camFrame'), lang)
        let last = 0
        const tick = async (now) => {
          if (stopped) return
          if (!busy && v.readyState >= 2 && now - last > 45) {
            busy = true
            last = now
            try { await pose.send({ image: v }) } catch { /* frame dropped */ }
            busy = false
          }
          raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
      } catch (e) {
        if (stopped) return
        const framed = window.self !== window.top
        setErr(framed && e?.name !== 'NoCam' ? t('camPreview') : e?.name === 'NotAllowedError' ? t('camDenied') : e?.name === 'NoCam' || e?.name === 'NotFoundError' ? t('camNone') : t('camFail'))
        setPhase('error')
      }
    })()

    return () => {
      stopped = true
      cancelAnimationFrame(raf)
      stream?.getTracks().forEach((tr) => tr.stop())
      pose?.onResults(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 3-2-1 countdown, then start counting
  useEffect(() => {
    if (phase !== 'count') return
    let n = 3
    setCountLeft(3); sfx.pop(); say('3', lang)
    const id = setInterval(() => {
      n--
      setCountLeft(n)
      if (n > 0) { sfx.pop(); say(String(n), lang) } else {
        clearInterval(id)
        sfx.sparkle(); say(`${t('go')} ${ex.name[lang]}`, lang)
        startedAt.current = Date.now()
        setPhase('go')
      }
    }, 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const close = (closeRef.current = () => {
    try { if (phase !== 'done') finish(false) } catch { /* ignore */ }
    stopSpeech()
    onClose()
  })

  const pct = Math.min(100, (reps / target) * 100)

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col">
      <video ref={videoRef} playsInline muted className="hidden" />
      <div className="flex items-center justify-between p-3 pt-[max(12px,env(safe-area-inset-top))] bg-black/60 z-10">
        <button onClick={close} className="px-3 py-1.5 rounded-xl bg-white/15 text-sm font-bold">✕ {t('quit')}</button>
        <span className="font-black text-sm">{ex.emoji} {ex.name[lang]}</span>
        <span className="text-[10px] font-bold opacity-80 max-w-[30%] text-end leading-tight">🔒 {t('camPrivacy')}</span>
      </div>

      <div className="relative flex-1 min-h-0 flex items-center justify-center overflow-hidden">
        <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" />

        {phase === 'loading' && <Center><div className="text-6xl anim-bounce">🤖</div><p className="font-black text-lg">{t('camLoading')}</p></Center>}
        {phase === 'error' && (
          <Center>
            <div className="text-6xl">📷</div>
            <p className="font-black text-lg max-w-xs">{err}</p>
            <button onClick={onClose} className="px-8 py-3 rounded-full bg-white text-black font-black">{t('back')}</button>
          </Center>
        )}
        {['frame', 'count', 'go'].includes(phase) && (
          <div className="absolute top-3 start-3 bg-white/90 rounded-2xl p-1 shadow-lg">
            <Kid ex={cam.ex} {...kidProps(child)} size={phase === 'go' ? 74 : 96} playing />
          </div>
        )}
        {phase === 'frame' && (
          <div className="absolute inset-x-0 bottom-6 flex justify-center px-4">
            <div className={`px-5 py-3 rounded-2xl font-black text-center ${visible ? 'bg-green-500' : 'bg-amber-500'} text-black`}>
              {visible ? '✅ ' + t('camHold') : '👣 ' + t('camFrame')}
            </div>
          </div>
        )}
        {phase === 'count' && <Center><div key={countLeft} className="text-[140px] font-black anim-pop drop-shadow-lg leading-none">{countLeft}</div></Center>}
        {phase === 'go' && (
          <>
            <div className="absolute top-4 inset-x-0 flex justify-center">
              <div className="bg-black/60 rounded-3xl px-6 py-2 text-center">
                <div key={reps} className="text-6xl font-black anim-pop" dir="ltr">{reps}<span className="text-2xl opacity-70">/{target}</span></div>
              </div>
            </div>
            <div className="absolute bottom-6 inset-x-6">
              {!visible && <p className="text-center font-black bg-amber-500 text-black rounded-xl py-2 mb-2">👣 {t('camFrame')}</p>}
              <p className="text-center font-bold text-sm bg-black/50 rounded-xl py-1.5 mb-2">{pick(ex.how)}</p>
              <div className="h-4 bg-white/25 rounded-full overflow-hidden"><div className="h-full bg-green-400 transition-all duration-300" style={{ width: `${pct}%` }} /></div>
            </div>
          </>
        )}
        {phase === 'done' && (
          <Center>
            <div className="text-8xl anim-bounce">🏆</div>
            <p className="font-black text-2xl">{t('done')}</p>
            <p className="font-black text-green-400 text-xl" dir="ltr">{reps} / {target}</p>
            <button onClick={onClose} className="px-10 py-3 rounded-full bg-[var(--primary)] font-black text-lg">{t('ok')}</button>
          </Center>
        )}
      </div>
    </div>
  )
}

const Center = ({ children }) => <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center gap-4 text-center p-6">{children}</div>
