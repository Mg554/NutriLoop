import { makeCounter, inFrame, smoother } from '../src/modules/move/poseCount.js'
// standing pose builder (y down). Person centred, shoulders 0.3, hips 0.55, knees 0.72, ankles 0.9
const base = () => { const a = Array.from({ length: 33 }, () => ({ x: .5, y: .5, visibility: .99 }))
  const set = (i, x, y) => (a[i] = { x, y, visibility: .99 })
  set(0, .5, .2); set(11, .44, .3); set(12, .56, .3); set(13, .42, .42); set(14, .58, .42); set(15, .42, .52); set(16, .58, .52)
  set(23, .46, .55); set(24, .54, .55); set(25, .46, .72); set(26, .54, .72); set(27, .46, .9); set(28, .54, .9); return a }
const squatDown = () => { const a = base(); for (const [h, k, an] of [[23, 25, 27], [24, 26, 28]]) { a[h].y = .7; a[k].y = .75; a[k].x += (h === 23 ? -.12 : .12); a[an].y = .9 } return a }
const jackOpen = () => { const a = base(); a[15] = { x: .38, y: .12, visibility: .99 }; a[16] = { x: .62, y: .12, visibility: .99 }; a[27].x = .34; a[28].x = .66; return a }
const kneeUp = (side) => { const a = base(); const k = side === 'l' ? 25 : 26; a[k].y = .52; return a }
const reachUp = () => { const a = base(); a[15].y = .1; a[16].y = .1; return a }
const noisy = (a) => a.map((p) => ({ ...p, x: p.x + (Math.random() - .5) * .01, y: p.y + (Math.random() - .5) * .01 }))

function run(type, seq, reps) {
  const c = makeCounter(type); const sm = smoother(.6); let t = 0; let r
  for (let i = 0; i < reps; i++) for (const f of seq) for (let k = 0; k < 8; k++) { t += 50; r = c.update(sm(noisy(f())), t) }
  for (let k = 0; k < 8; k++) { t += 50; r = c.update(sm(noisy(base())), t) }
  return r.reps
}
const res = {
  squat: run('squat', [base, squatDown], 10),
  jacks: run('jacks', [base, jackOpen], 10),
  knees: run('knees', [base, () => kneeUp('l'), base, () => kneeUp('r')], 5),
  reach: run('reach', [base, reachUp], 10),
  // standing still with noise must count 0
  idle: ['squat', 'jacks', 'knees', 'reach'].map((t) => run(t, [base], 30)),
  inFrameOk: inFrame('squat', base()),
  inFrameNo: inFrame('squat', base().map((p, i) => (i === 27 ? { ...p, visibility: .1 } : p))),
}
console.log(JSON.stringify(res))
const ok = res.squat === 10 && res.jacks === 10 && res.knees === 10 && res.reach === 10 && res.idle.every((x) => x === 0) && res.inFrameOk && !res.inFrameNo
console.log(ok ? 'PASS' : 'FAIL'); process.exit(ok ? 0 : 1)
