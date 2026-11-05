// ---------------------------------------------------------------------------
// Animated kid avatar that performs each exercise.
// A tiny 2-D skeleton (torso, head, 2 arms, 2 legs with elbows/knees) is posed
// by keyframes of joint angles, interpolated with easing, then drawn as SVG.
//
// Angles are in degrees, measured from "pointing straight down", positive
// rotates toward screen-right. Elbow/knee values are RELATIVE to the upper limb.
// `a` = back limb (drawn behind, slightly darker), `b` = front limb.
// The body is auto-grounded: the lowest foot (and hands when `hands:1`)
// always touches the floor, and the figure is centred horizontally.
// ---------------------------------------------------------------------------
import { useEffect, useState } from 'react'

const LEN = { torso: 48, neck: 5, head: 19, upper: 26, fore: 24, thigh: 33, shin: 33 }
const GROUND = 226
const BASE = { lean: 0, tilt: 0, ash: -12, ael: 0, bsh: 12, bel: 0, ahip: -5, akn: 0, bhip: 5, bkn: 0, lift: 0, shrug: 0, dx: 0, w: 1, hands: 0 }

const arm = (a, b) => ({ ash: a, bsh: b })
// Keyframes per exercise id. `p` = period of one full loop (ms). `side` = side view.
export const MOVES = {
  reach: { p: 2400, f: [arm(-15, 15), { ash: -172, bsh: 172, lift: 3 }] },
  toes: { p: 2600, side: true, f: [{}, { lean: 105, ash: 4, bsh: 10, ahip: -12, bhip: -8 }] },
  circles: { p: 1400, f: [{ ash: -90, bsh: 90, ael: -25, bel: 25 }, { ash: -125, bsh: 125 }, { ash: -90, bsh: 90, ael: 25, bel: -25 }, { ash: -55, bsh: 55 }] },
  side: { p: 2600, f: [{ lean: -22, ash: 190, bsh: 214 }, { lean: 22, ash: 146, bsh: 170 }] },
  breath: { p: 8000, f: [arm(-12, 12), { ash: -105, bsh: 105, lift: 2 }] },
  neck: { p: 3000, f: [{ tilt: -26 }, { tilt: 26 }] },
  shoulders: { p: 1200, f: [{}, { shrug: 9 }] },
  march: { p: 1000, side: true, f: [{ ahip: 62, akn: -85, bhip: -5, ash: 28, ael: 40, bsh: -28, bel: 40 }, { ash: 5, bsh: -5, ael: 30, bel: 30 }, { bhip: 62, bkn: -85, ahip: -5, ash: -28, ael: 40, bsh: 28, bel: 40 }, { ash: -5, bsh: 5, ael: 30, bel: 30 }] },
  shake: { p: 320, f: [{ ash: -32, bsh: 30, ael: 35, bel: -30, ahip: -12 }, { ash: -8, bsh: 10, ael: -25, bel: 20, bhip: 12 }] },
  hops: { p: 520, f: [{ ahip: 10, akn: -22, bhip: -10, bkn: 22 }, { lift: 18, ash: -22, bsh: 22 }] },
  jacks: { p: 1000, f: [{ ash: -8, bsh: 8, ahip: -3, bhip: 3 }, { lift: 14, ash: -90, bsh: 90, ahip: -14, bhip: 14 }, { ash: -162, bsh: 162, ahip: -26, bhip: 26 }, { lift: 14, ash: -90, bsh: 90, ahip: -14, bhip: 14 }] },
  squats: { p: 1900, side: true, f: [arm(-4, 4), { lean: 22, ahip: 78, akn: -112, bhip: 74, bkn: -108, ash: 92, bsh: 98, ael: -4, dx: -6 }] },
  knees: { p: 620, side: true, f: [{ ahip: 82, akn: -95, bhip: -4, ash: 35, ael: 70, bsh: -35, bel: 70, lift: 4 }, { bhip: 82, bkn: -95, ahip: -4, ash: -35, ael: 70, bsh: 35, bel: 70, lift: 4 }] },
  plank: { p: 2200, side: true, f: [{ lean: 70, ahip: -58, bhip: -56, ash: -5, bsh: 5, hands: 1 }, { lean: 68, ahip: -60, bhip: -58, ash: -4, bsh: 6, hands: 1 }] },
  skip: { p: 460, f: [{ ash: -38, ael: 55, bsh: 38, bel: -55 }, { lift: 16, ash: -30, ael: 40, bsh: 30, bel: -40 }] },
  // animals (the kid imitates them; the animal emoji shows as a badge)
  frog: { p: 1500, f: [{ ahip: -72, akn: 122, bhip: 72, bkn: -122, ash: -4, bsh: 4, hands: 1 }, { ahip: -72, akn: 122, bhip: 72, bkn: -122, ash: -6, bsh: 6, hands: 1 }, { lift: 40, ash: -160, bsh: 160, ahip: -18, bhip: 18 }] },
  bear: { p: 1000, side: true, f: [{ lean: 112, ash: -8, bsh: 14, ahip: -16, bhip: 6, hands: 1 }, { lean: 112, ash: 14, bsh: -8, ahip: 6, bhip: -16, hands: 1 }] },
  crab: { p: 900, side: true, f: [{ lean: -52, ash: -12, bsh: -24, ahip: 75, akn: -95, bhip: 70, bkn: -92, hands: 1 }, { lean: -50, ash: -24, bsh: -12, ahip: 70, akn: -92, bhip: 75, bkn: -95, hands: 1, dx: 8 }] },
  penguin: { p: 700, f: [{ lean: -10, ash: -20, bsh: 20, ahip: -3, bhip: 4, tilt: -6 }, { lean: 10, ash: -20, bsh: 20, ahip: -4, bhip: 3, tilt: 6 }] },
  kangaroo: { p: 900, side: true, f: [{ lean: 22, ahip: 52, akn: -72, bhip: 48, bkn: -70, ash: 60, ael: 75, bsh: 62, bel: 75 }, { lift: 38, lean: 10, ahip: 30, akn: -60, bhip: 28, bkn: -58, ash: 60, ael: 85, bsh: 62, bel: 85 }] },
  flamingo: { p: 2000, f: [{ ash: -95, bsh: 95, ahip: -2, bhip: 40, bkn: -120 }, { lean: 4, ash: -85, bsh: 105, ahip: -2, bhip: 42, bkn: -122 }] },
  elephant: { p: 1400, side: true, f: [{ lean: 12, bsh: 20, bel: 30, ash: -5, ahip: 32, akn: -32 }, { lean: 12, bsh: 115, bel: 45, ash: 5, bhip: 32, bkn: -32 }] },
  rabbit: { p: 460, f: [{ ash: -165, ael: -38, bsh: 165, bel: 38, akn: -10, bkn: 10 }, { lift: 13, ash: -165, ael: -38, bsh: 165, bel: 38 }] },
}

// Coordinated outfit palettes: main = top, dark = bottoms, trim = stripes, hijab = scarf.
export const PALETTES = {
  pink: { main: '#ec4899', dark: '#9d174d', trim: '#fbcfe8', hijab: '#f9a8d4' },
  purple: { main: '#7c3aed', dark: '#4c1d95', trim: '#ddd6fe', hijab: '#c4b5fd' },
  blue: { main: '#3b82f6', dark: '#1e3a8a', trim: '#bfdbfe', hijab: '#93c5fd' },
  green: { main: '#10b981', dark: '#065f46', trim: '#a7f3d0', hijab: '#6ee7b7' },
  navy: { main: '#334155', dark: '#0f172a', trim: '#f472b6', hijab: '#f9a8d4' },
}
const HAIR = '#3b2414'
const shade = (hex, k = 0.85) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * k).toString(16).padStart(2, '0')).join('')

const rad = (d) => (d * Math.PI) / 180
const dir = (deg) => ({ x: Math.sin(rad(deg)), y: Math.cos(rad(deg)) })
const add = (p, v, k = 1) => ({ x: p.x + v.x * k, y: p.y + v.y * k })
const ease = (f) => (1 - Math.cos(Math.PI * f)) / 2

function lerpPose(frames, t) {
  const n = frames.length
  const x = t * n
  const i = Math.floor(x) % n
  const f = ease(x - Math.floor(x))
  const A = { ...BASE, ...frames[i] }
  const B = { ...BASE, ...frames[(i + 1) % n] }
  const out = {}
  for (const k in BASE) out[k] = A[k] + (B[k] - A[k]) * f
  return out
}

// Solve joint positions for one pose.
function skeleton(q, side) {
  const w = side ? 0.4 : 1
  const up = { x: Math.sin(rad(q.lean)), y: -Math.cos(rad(q.lean)) }
  const across = { x: Math.cos(rad(q.lean)), y: Math.sin(rad(q.lean)) }
  const P = { x: 0, y: 0 }
  const S = add(P, up, LEN.torso)
  const sh = add(S, up, q.shrug - 4)
  const headDir = { x: Math.sin(rad(q.lean + q.tilt)), y: -Math.cos(rad(q.lean + q.tilt)) }
  const H = add(S, headDir, LEN.neck + LEN.head)
  const limb = (o, a1, a2, l1, l2) => { const j = add(o, dir(a1), l1); return [o, j, add(j, dir(a1 + a2), l2)] }
  const sa = add(sh, across, -12 * w), sb = add(sh, across, 12 * w)
  const ha = add(P, across, -6 * w), hb = add(P, across, 6 * w)
  const sk = {
    P, S, H, up,
    armA: limb(sa, q.ash, q.ael, LEN.upper, LEN.fore),
    armB: limb(sb, q.bsh, q.bel, LEN.upper, LEN.fore),
    legA: limb(ha, q.ahip, q.akn, LEN.thigh, LEN.shin),
    legB: limb(hb, q.bhip, q.bkn, LEN.thigh, LEN.shin),
  }
  // grounding + centring
  const contact = [sk.legA[2], sk.legB[2], ...(q.hands > 0.5 ? [sk.armA[2], sk.armB[2]] : [])]
  const lowest = Math.max(...contact.map((p) => p.y))
  const all = [S, H, ...sk.armA, ...sk.armB, ...sk.legA, ...sk.legB]
  const minX = Math.min(...all.map((p) => p.x)), maxX = Math.max(...all.map((p) => p.x))
  const off = { x: 100 + q.dx - (minX + maxX) / 2, y: GROUND - 6 - lowest - q.lift }
  const mv = (p) => ({ x: p.x + off.x, y: p.y + off.y })
  return {
    P: mv(P), S: mv(S), H: mv(H), up, tiltDeg: q.lean + q.tilt, lift: q.lift,
    armA: sk.armA.map(mv), armB: sk.armB.map(mv), legA: sk.legA.map(mv), legB: sk.legB.map(mv),
  }
}

const seg = (a, b, k) => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k })
const L = (a, b, color, width) => <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color} strokeWidth={width} strokeLinecap="round" />

function Figure({ k, look, gender, outfit, color }) {
  const pal = PALETTES[color] || PALETTES[gender === 'f' ? 'pink' : 'blue']
  const suit = outfit === 'tracksuit'
  const skin = '#e8b48a', skinB = '#d39d74'
  const top = pal.main, topB = shade(pal.main)
  const bottom = suit ? pal.dark : '#1e3a8a', bottomB = shade(bottom, 0.8)
  const shoe = suit ? '#f8fafc' : '#334155', sole = suit ? pal.dark : '#1f2937'

  const leg = ([h, kn, f], back) => (
    <g>
      {suit ? (
        <>
          {L(h, kn, back ? bottomB : bottom, 13)}
          {L(kn, f, back ? bottomB : bottom, 12)}
          {!back && L(seg(h, kn, 0.1), seg(kn, f, 0.85), pal.trim, 2)}
        </>
      ) : (
        <>
          {L(h, kn, back ? skinB : skin, 10)}
          {L(kn, f, back ? skinB : skin, 9)}
          {L(h, seg(h, kn, 0.55), back ? bottomB : bottom, 14)}
          {L(seg(kn, f, 0.78), f, '#ffffff', 9)}
        </>
      )}
      <ellipse cx={f.x} cy={f.y + 1} rx={7.5} ry={5} fill={shoe} stroke={sole} strokeWidth={1.5} />
    </g>
  )
  const armEl = ([sh, e, h], back) => (
    <g>
      {suit ? (
        <>
          {L(sh, e, back ? topB : top, 12)}
          {L(e, h, back ? topB : top, 11)}
          {!back && L(seg(sh, e, 0.15), seg(e, h, 0.8), pal.trim, 2)}
          {L(seg(e, h, 0.86), seg(e, h, 0.9), pal.trim, 11)}
        </>
      ) : (
        <>
          {L(sh, e, back ? skinB : skin, 9)}
          {L(e, h, back ? skinB : skin, 8)}
          {L(sh, seg(sh, e, 0.5), back ? topB : top, 12)}
        </>
      )}
      <circle cx={h.x} cy={h.y} r={5} fill={back ? skinB : skin} />
    </g>
  )
  const H = k.H
  const shadowW = Math.max(14, 34 - k.lift * 0.5)
  const zipA = seg(k.P, k.S, 0.05), zipB = seg(k.P, k.S, 0.88)

  return (
    <g>
      <ellipse cx={100} cy={GROUND} rx={shadowW} ry={5} fill="rgba(0,0,0,.12)" />
      {armEl(k.armA, true)}
      {leg(k.legA, true)}
      {leg(k.legB, false)}
      {/* torso */}
      {suit ? (
        <>
          <line x1={seg(k.P, k.S, 0.02).x} y1={seg(k.P, k.S, 0.02).y} x2={seg(k.P, k.S, 0.7).x} y2={seg(k.P, k.S, 0.7).y} stroke={top} strokeWidth={26} strokeLinecap="butt" />
          {L(seg(k.P, k.S, 0.6), seg(k.P, k.S, 0.92), top, 26)}
        </>
      ) : L(seg(k.P, k.S, -0.05), seg(k.P, k.S, 0.92), top, 26)}
      {suit && L(zipA, zipB, pal.trim, 2)}
      {suit && <line x1={seg(k.P, k.S, 0.02).x} y1={seg(k.P, k.S, 0.02).y} x2={seg(k.P, k.S, 0.1).x} y2={seg(k.P, k.S, 0.1).y} stroke={pal.trim} strokeWidth={24} strokeLinecap="butt" />}
      {/* head */}
      <g transform={`rotate(${k.tiltDeg} ${H.x} ${H.y})`}>
        {look === 'hijab' ? (
          <>
            {/* scarf drapes over shoulders and chest, rounded hem */}
            <path d={`M ${H.x - 22} ${H.y - 2} C ${H.x - 24} ${H.y - 30}, ${H.x + 24} ${H.y - 30}, ${H.x + 22} ${H.y - 2} C ${H.x + 24} ${H.y + 14}, ${H.x + 27} ${H.y + 24}, ${H.x + 24} ${H.y + 34} Q ${H.x} ${H.y + 46} ${H.x - 24} ${H.y + 34} C ${H.x - 27} ${H.y + 24}, ${H.x - 24} ${H.y + 14}, ${H.x - 22} ${H.y - 2} Z`} fill={pal.hijab} />
            <path d={`M ${H.x - 14} ${H.y + 22} Q ${H.x} ${H.y + 30} ${H.x + 14} ${H.y + 22}`} stroke={shade(pal.hijab, 0.85)} strokeWidth="2" fill="none" />
            <ellipse cx={H.x} cy={H.y + 1} rx={16.5} ry={17.5} fill={shade(pal.hijab, 0.9)} />
            <ellipse cx={H.x} cy={H.y + 2} rx={14.5} ry={15.5} fill={skin} />
          </>
        ) : (
          <>
            {look === 'ponytail' && (
              <>
                <ellipse cx={H.x - 20} cy={H.y - 2} rx={8} ry={12} fill={HAIR} transform={`rotate(-25 ${H.x - 20} ${H.y - 2})`} />
                <circle cx={H.x - 15} cy={H.y - 9} r={3.5} fill={pal.main} />
              </>
            )}
            <circle cx={H.x} cy={H.y - 3} r={20} fill={HAIR} />
            <circle cx={H.x} cy={H.y + 2} r={17.5} fill={skin} />
            <path d={`M ${H.x - 17} ${H.y - 4} Q ${H.x - 6} ${H.y - 16} ${H.x + 4} ${H.y - 8} Q ${H.x + 12} ${H.y - 15} ${H.x + 17} ${H.y - 4} L ${H.x + 18} ${H.y - 12} Q ${H.x} ${H.y - 26} ${H.x - 18} ${H.y - 12} Z`} fill={HAIR} />
          </>
        )}
        {/* face */}
        <circle cx={H.x - 5.5} cy={H.y + 2} r={2.2} fill="#2b1d16" />
        <circle cx={H.x + 5.5} cy={H.y + 2} r={2.2} fill="#2b1d16" />
        <circle cx={H.x - 9} cy={H.y + 8} r={2.8} fill="#f9a8a8" opacity=".7" />
        <circle cx={H.x + 9} cy={H.y + 8} r={2.8} fill="#f9a8a8" opacity=".7" />
        <path d={`M ${H.x - 4.5} ${H.y + 9} Q ${H.x} ${H.y + 13.5} ${H.x + 4.5} ${H.y + 9}`} stroke="#2b1d16" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
      {armEl(k.armB, false)}
    </g>
  )
}

// <Kid ex="squats" look="ponytail" gender="f" size={160} playing />
export default function Kid({ ex, look = 'short', gender = 'm', outfit, color, size = 120, playing = true, className = '' }) {
  const mv = MOVES[ex] || MOVES.reach
  const [t, setT] = useState(0.5 / mv.f.length) // still frame = middle of 1st transition
  useEffect(() => {
    if (!playing) { setT(1 / mv.f.length); return }
    let raf = 0, last = 0
    const start = performance.now()
    const loop = (now) => {
      if (now - last > 33) { last = now; setT(((now - start) % mv.p) / mv.p) }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [ex, playing, mv])
  const k = skeleton(lerpPose(mv.f, t), mv.side)
  return (
    <svg viewBox="0 0 200 240" width={size} height={size * 1.2} className={className} role="img" aria-label={ex}>
      <Figure k={k} look={look} gender={gender} outfit={outfit || (look === 'hijab' ? 'tracksuit' : 'sport')} color={color} />
    </svg>
  )
}

export const lookOf = (child) => child?.look || (child?.gender === 'f' ? 'ponytail' : 'short')
// Everything the avatar needs from a child profile, as props: <Kid {...kidProps(child)} />
export const kidProps = (child) => {
  const look = lookOf(child)
  return { look, gender: child?.gender, outfit: child?.outfit || (look === 'hijab' ? 'tracksuit' : 'sport'), color: child?.color }
}
