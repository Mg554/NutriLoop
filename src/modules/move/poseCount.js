// ---------------------------------------------------------------------------
// Rep counting from MediaPipe Pose landmarks (33 points, x/y normalised 0..1,
// y grows DOWNWARD). Pure functions: no DOM, so they can be unit tested.
// Each counter is a small state machine with hysteresis (two thresholds) so
// jitter around one value can't produce double counts.
// ---------------------------------------------------------------------------
export const LM = { nose: 0, lSh: 11, rSh: 12, lEl: 13, rEl: 14, lWr: 15, rWr: 16, lHip: 23, rHip: 24, lKn: 25, rKn: 26, lAn: 27, rAn: 28 }

const vis = (p) => (p?.visibility ?? 1) > 0.5
const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })

// Angle at b (degrees) for points a-b-c
export function angle(a, b, c) {
  const ab = Math.atan2(a.y - b.y, a.x - b.x)
  const cb = Math.atan2(c.y - b.y, c.x - b.x)
  let d = Math.abs(((ab - cb) * 180) / Math.PI)
  if (d > 180) d = 360 - d
  return d
}

// Which landmarks must be visible for each exercise.
const NEEDS = {
  squat: ['lHip', 'rHip', 'lKn', 'rKn', 'lAn', 'rAn'],
  jacks: ['lSh', 'rSh', 'lWr', 'rWr', 'lAn', 'rAn'],
  knees: ['lSh', 'rSh', 'lHip', 'rHip', 'lKn', 'rKn'],
  reach: ['nose', 'lSh', 'rSh', 'lWr', 'rWr'],
}

export function inFrame(type, lm) {
  if (!lm) return false
  return NEEDS[type].every((k) => vis(lm[LM[k]]))
}

// Exponential smoothing of landmarks to calm the jitter.
export function smoother(alpha = 0.5) {
  let prev = null
  return (lm) => {
    if (!lm) return (prev = null)
    prev = prev ? lm.map((p, i) => ({ x: prev[i].x + alpha * (p.x - prev[i].x), y: prev[i].y + alpha * (p.y - prev[i].y), visibility: p.visibility })) : lm.map((p) => ({ ...p }))
    return prev
  }
}

// Returns { update(lm, tMs) -> { reps, phase, justCounted } }
export function makeCounter(type) {
  let reps = 0
  let phase = 'start'
  let lastRep = 0
  const minGap = type === 'knees' ? 250 : 450 // ms between reps
  const knee = { l: 'down', r: 'down' }

  const bump = (t) => {
    if (t - lastRep < minGap) return false
    lastRep = t
    reps++
    return true
  }

  function update(lm, t) {
    let counted = false
    const P = (k) => lm[LM[k]]

    if (type === 'squat') {
      const a = (angle(P('lHip'), P('lKn'), P('lAn')) + angle(P('rHip'), P('rKn'), P('rAn'))) / 2
      if (a < 110 && phase !== 'down') phase = 'down'
      else if (a > 155 && phase === 'down') { phase = 'up'; counted = bump(t) }
      else if (a > 155) phase = 'up'
    }

    if (type === 'jacks') {
      const shW = Math.abs(P('lSh').x - P('rSh').x) || 0.1
      const shY = Math.min(P('lSh').y, P('rSh').y)
      const armsUp = P('lWr').y < shY && P('rWr').y < shY
      const armsDown = P('lWr').y > shY + shW * 0.3 && P('rWr').y > shY + shW * 0.3
      const feet = Math.abs(P('lAn').x - P('rAn').x)
      if (armsUp && feet > shW * 1.3) phase = 'open'
      else if (armsDown && feet < shW * 1.1 && phase === 'open') { phase = 'closed'; counted = bump(t) }
    }

    if (type === 'knees') {
      const torso = Math.abs(mid(P('lHip'), P('rHip')).y - mid(P('lSh'), P('rSh')).y) || 0.2
      for (const [s, kn, hp] of [['l', 'lKn', 'lHip'], ['r', 'rKn', 'rHip']]) {
        const lift = P(hp).y - P(kn).y // >0 when knee above hip
        if (lift > -torso * 0.15 && knee[s] === 'down') { knee[s] = 'up'; if (bump(t)) counted = true }
        else if (lift < -torso * 0.4) knee[s] = 'down'
      }
      phase = knee.l === 'up' || knee.r === 'up' ? 'up' : 'down'
    }

    if (type === 'reach') {
      const up = P('lWr').y < P('nose').y && P('rWr').y < P('nose').y
      const down = P('lWr').y > P('lSh').y && P('rWr').y > P('rSh').y
      if (up && phase !== 'up') phase = 'up'
      else if (down && phase === 'up') { phase = 'down'; counted = bump(t) }
    }

    return { reps, phase, justCounted: counted }
  }

  return { update, get reps() { return reps } }
}

// Pairs of landmarks to draw as the skeleton.
export const BONES = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24], [23, 25], [25, 27], [24, 26], [26, 28],
]
