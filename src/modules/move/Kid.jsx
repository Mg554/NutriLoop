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
import { useEffect, useMemo, useState } from 'react'

const LEN = { torso: 48, neck: 6, head: 16, upper: 26, fore: 24, thigh: 35, shin: 34 }
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
  march: { anchor: 'pelvis', p: 1000, side: true, f: [{ ahip: 62, akn: -85, bhip: -5, ash: 28, ael: 40, bsh: -28, bel: 40 }, { ash: 5, bsh: -5, ael: 30, bel: 30 }, { bhip: 62, bkn: -85, ahip: -5, ash: -28, ael: 40, bsh: 28, bel: 40 }, { ash: -5, bsh: 5, ael: 30, bel: 30 }] },
  shake: { anchor: 'pelvis', p: 320, f: [{ ash: -32, bsh: 30, ael: 35, bel: -30, ahip: -12 }, { ash: -8, bsh: 10, ael: -25, bel: 20, bhip: 12 }] },
  hops: { p: 520, f: [{ ahip: 10, akn: -22, bhip: -10, bkn: 22 }, { lift: 18, ash: -22, bsh: 22 }] },
  jacks: { p: 1000, f: [{ ash: -8, bsh: 8, ahip: -3, bhip: 3 }, { lift: 14, ash: -90, bsh: 90, ahip: -14, bhip: 14 }, { ash: -162, bsh: 162, ahip: -26, bhip: 26 }, { lift: 14, ash: -90, bsh: 90, ahip: -14, bhip: 14 }] },
  squats: { p: 1900, side: true, f: [arm(-4, 4), { lean: 22, ahip: 78, akn: -112, bhip: 74, bkn: -108, ash: 92, bsh: 98, ael: -4, dx: -6 }] },
  knees: { anchor: 'pelvis', p: 620, side: true, f: [{ ahip: 82, akn: -95, bhip: -4, ash: 35, ael: 70, bsh: -35, bel: 70, lift: 4 }, { bhip: 82, bkn: -95, ahip: -4, ash: -35, ael: 70, bsh: 35, bel: 70, lift: 4 }] },
  plank: { p: 2200, side: true, f: [{ lean: 70, ahip: -58, bhip: -56, ash: -5, bsh: 5, hands: 1 }, { lean: 68, ahip: -60, bhip: -58, ash: -4, bsh: 6, hands: 1 }] },
  skip: { p: 460, f: [{ ash: -38, ael: 55, bsh: 38, bel: -55 }, { lift: 16, ash: -30, ael: 40, bsh: 30, bel: -40 }] },
  // strength
  wallsit: { p: 2400, side: true, prop: 'wall', anchor: 'pelvis', f: [{ ahip: 86, akn: -88, bhip: 88, bkn: -90, ash: 88, bsh: 92 }, { ahip: 86, akn: -88, bhip: 88, bkn: -90, ash: 84, bsh: 96, shrug: 1 }] },
  kneepush: { p: 2000, side: true, anchor: 'pelvis', f: [{ lean: 62, ahip: -62, akn: -28, bhip: -60, bkn: -30, ash: -6, bsh: -2, hands: 1 }, { lean: 80, ahip: -80, akn: -10, bhip: -78, bkn: -12, ash: 32, ael: -78, bsh: 36, bel: -80, hands: 1 }] },
  lunges: { p: 2200, side: true, anchor: 'pelvis', f: [{ ahip: -4, bhip: 4, ash: 0, bsh: 4 }, { ahip: -30, akn: -62, bhip: 72, bkn: -76, ash: -6, bsh: 8, lean: -3 }, { ahip: -4, bhip: 4, ash: 0, bsh: 4 }, { bhip: -30, bkn: -62, ahip: 72, akn: -76, ash: 8, bsh: -6, lean: -3 }] },
  calves: { p: 1600, f: [{ ash: -10, bsh: 10 }, { lift: 7, ash: -16, bsh: 16 }] },
  // cardio
  climber: { p: 700, side: true, anchor: 'pelvis', f: [{ lean: 68, ahip: -60, bhip: 40, bkn: -95, ash: -4, bsh: 2, hands: 1 }, { lean: 68, bhip: -60, ahip: 40, akn: -95, ash: 2, bsh: -4, hands: 1 }] },
  kicks: { p: 900, side: true, anchor: 'pelvis', f: [{ ahip: -14, akn: -128, bhip: 4, ash: 30, ael: 70, bsh: -30, bel: 70 }, { ahip: -2, bhip: 2, ash: 0, ael: 70, bsh: 0, bel: 70, lift: 3 }, { bhip: -14, bkn: -128, ahip: 4, ash: -30, ael: 70, bsh: 30, bel: 70 }, { ahip: 2, bhip: -2, ash: 0, ael: 70, bsh: 0, bel: 70, lift: 3 }] },
  skater: { p: 1300, anchor: 'pelvis', f: [{ dx: -16, lean: -10, ahip: -4, bhip: 32, bkn: -50, ash: 60, bsh: 30 }, { lift: 10, ash: 10, bsh: -10 }, { dx: 16, lean: 10, bhip: 4, ahip: -32, akn: 50, ash: -30, bsh: -60 }, { lift: 10, ash: 10, bsh: -10 }] },
  // balance
  tree: { p: 3000, anchor: 'pelvis', f: [{ ash: -168, ael: -12, bsh: 168, bel: 12, ahip: -1, bhip: 58, bkn: -148 }, { ash: -172, ael: -8, bsh: 172, bel: 8, ahip: -1, bhip: 60, bkn: -150, lean: 2 }] },
  airplane: { p: 3000, side: true, anchor: 'pelvis', f: [{ lean: 72, ahip: 0, bhip: -88, ash: -95, bsh: -80 }, { lean: 76, ahip: 0, bhip: -92, ash: -100, bsh: -84 }] },
  // quiet
  touch: { p: 1800, f: [{ ash: -35, ael: 150, bsh: 35, bel: -150 }, { ash: -172, bsh: 172 }] },
  punch: { p: 1400, side: true, anchor: 'pelvis', f: [{ ash: 90, ael: 0, bsh: 30, bel: 110, ahip: -6, bhip: 8 }, { bsh: 90, bel: 0, ash: 30, ael: 110, ahip: -6, bhip: 8 }] },
  // animals (the kid imitates them; the animal emoji shows as a badge)
  frog: { p: 1500, f: [{ ahip: -72, akn: 122, bhip: 72, bkn: -122, ash: -4, bsh: 4, hands: 1 }, { ahip: -72, akn: 122, bhip: 72, bkn: -122, ash: -6, bsh: 6, hands: 1 }, { lift: 40, ash: -160, bsh: 160, ahip: -18, bhip: 18 }] },
  bear: { p: 1000, side: true, f: [{ lean: 112, ash: -8, bsh: 14, ahip: -16, bhip: 6, hands: 1 }, { lean: 112, ash: 14, bsh: -8, ahip: 6, bhip: -16, hands: 1 }] },
  crab: { p: 900, side: true, f: [{ lean: -52, ash: -12, bsh: -24, ahip: 75, akn: -95, bhip: 70, bkn: -92, hands: 1 }, { lean: -50, ash: -24, bsh: -12, ahip: 70, akn: -92, bhip: 75, bkn: -95, hands: 1, dx: 8 }] },
  penguin: { anchor: 'pelvis', p: 700, f: [{ lean: -10, ash: -20, bsh: 20, ahip: -3, bhip: 4, tilt: -6 }, { lean: 10, ash: -20, bsh: 20, ahip: -4, bhip: 3, tilt: 6 }] },
  kangaroo: { p: 900, side: true, f: [{ lean: 22, ahip: 52, akn: -72, bhip: 48, bkn: -70, ash: 60, ael: 75, bsh: 62, bel: 75 }, { lift: 38, lean: 10, ahip: 30, akn: -60, bhip: 28, bkn: -58, ash: 60, ael: 85, bsh: 62, bel: 85 }] },
  flamingo: { anchor: 'pelvis', p: 2000, f: [{ ash: -95, bsh: 95, ahip: -2, bhip: 40, bkn: -120 }, { lean: 4, ash: -85, bsh: 105, ahip: -2, bhip: 42, bkn: -122 }] },
  elephant: { anchor: 'pelvis', p: 1400, side: true, f: [{ lean: 12, bsh: 20, bel: 30, ash: -5, ahip: 32, akn: -32 }, { lean: 12, bsh: 115, bel: 45, ash: 5, bhip: 32, bkn: -32 }] },
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
const shade = (hex, k = 0.85) => '#' + [1, 3, 5].map((i) => Math.min(255, Math.round(parseInt(hex.slice(i, i + 2), 16) * k)).toString(16).padStart(2, '0')).join('')

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

// Solve joint positions for one pose, pelvis at (0,0) (before placing it).
function skeletonRaw(q, side) {
  const w = side ? 0.45 : 1
  const up = { x: Math.sin(rad(q.lean)), y: -Math.cos(rad(q.lean)) }
  const across = { x: Math.cos(rad(q.lean)), y: Math.sin(rad(q.lean)) }
  const P = { x: 0, y: 0 }
  const S = add(P, up, LEN.torso)
  const sh = add(S, up, q.shrug - 5)
  const headDir = { x: Math.sin(rad(q.lean + q.tilt)), y: -Math.cos(rad(q.lean + q.tilt)) }
  const H = add(S, headDir, LEN.neck + LEN.head)
  const limb = (o, a1, a2, l1, l2) => { const j = add(o, dir(a1), l1); return [o, j, add(j, dir(a1 + a2), l2)] }
  // shoulders sit at the outer edge of the torso, hips inside the pelvis
  const sa = add(sh, across, -14 * w), sb = add(sh, across, 14 * w)
  const ha = add(P, across, -7 * w), hb = add(P, across, 7 * w)
  return {
    P, S, H, up, across, w, tiltDeg: q.lean + q.tilt, lift: q.lift, hands: q.hands,
    armA: limb(sa, q.ash, q.ael, LEN.upper, LEN.fore),
    armB: limb(sb, q.bsh, q.bel, LEN.upper, LEN.fore),
    legA: limb(ha, q.ahip, q.akn, LEN.thigh, LEN.shin),
    legB: limb(hb, q.bhip, q.bkn, LEN.thigh, LEN.shin),
  }
}

// Horizontal anchor: feet stay planted (squats, jumps...), or the pelvis for
// moves that lift one foot at a time (marching), so the body never slides.
const anchorOf = (r, mode) => (mode === 'pelvis' ? r.P.x : (r.legA[2].x + r.legB[2].x) / 2)
const bboxCenter = (r) => {
  const xs = [r.S, r.H, ...r.armA, ...r.armB, ...r.legA, ...r.legB].map((p) => p.x)
  return (Math.min(...xs) + Math.max(...xs)) / 2
}

// Ground the lowest contact point and apply the fixed horizontal anchor.
function place(r, q, anchorMode, shift) {
  const contact = [r.legA[2], r.legB[2], ...(r.hands > 0.5 ? [r.armA[2], r.armB[2]] : [])]
  const lowest = Math.max(...contact.map((p) => p.y))
  const off = { x: 100 + q.dx - anchorOf(r, anchorMode) - shift, y: GROUND - 6 - lowest - q.lift }
  const mv = (p) => ({ x: p.x + off.x, y: p.y + off.y })
  return {
    ...r, P: mv(r.P), S: mv(r.S), H: mv(r.H),
    armA: r.armA.map(mv), armB: r.armB.map(mv), legA: r.legA.map(mv), legB: r.legB.map(mv),
  }
}

const seg = (a, b, k) => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k })
const OUT = '#3a2a22' // soft outline colour (cartoon-studio style)
const SKIN = { base: '#e9b48c', back: '#d69f78', light: '#f6cfae', line: '#a8704c' }

// a limb drawn as one stroked path: outline -> colour -> highlight on top
function Limb({ pts, color, width, light, back }) {
  const d = `M ${pts.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L ')}`
  return (
    <g>
      <path d={d} fill="none" stroke={OUT} strokeOpacity={back ? 0.55 : 0.75} strokeWidth={width + 2.6} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
      {light && !back && <path d={d} fill="none" stroke={light} strokeOpacity=".55" strokeWidth={width * 0.28} strokeLinecap="round" strokeLinejoin="round" transform={`translate(${-width * 0.22} ${-width * 0.12})`} />}
    </g>
  )
}

// sneaker pointing along the shin direction (side) or forward (front)
function Shoe({ f, kn, side, color, sole }) {
  const dx = f.x - kn.x, dy = f.y - kn.y
  const ang = side ? (Math.atan2(dy, dx) * 180) / Math.PI - 90 : 0
  return (
    <g transform={`translate(${f.x} ${f.y}) rotate(${ang})`}>
      <path d={side ? 'M -6 -4 C -6 -9, 4 -8, 8 -3 C 13 -2, 15 1, 14 4 L -7 4 Z' : 'M -8 -4 C -8 -9, 8 -9, 8 -4 L 9 4 L -9 4 Z'} fill={color} stroke={OUT} strokeWidth="1.3" strokeLinejoin="round" />
      <path d={side ? 'M -7 4 L 14 4 L 14 6 Q 4 8 -7 6 Z' : 'M -9 4 L 9 4 L 9 6.5 L -9 6.5 Z'} fill={sole} stroke={OUT} strokeWidth="1" />
      <path d={side ? 'M -1 -6 L 4 -4 M 1 -7 L 6 -5' : 'M -3 -6 L 3 -6 M -3 -3.5 L 3 -3.5'} stroke={sole} strokeWidth="1.1" strokeLinecap="round" />
    </g>
  )
}

function Figure({ k, look, gender, outfit, color, prop }) {
  const pal = PALETTES[color] || PALETTES[gender === 'f' ? 'pink' : 'blue']
  const suit = outfit === 'tracksuit'
  const top = pal.main, topB = shade(pal.main), topL = shade(pal.main, 1.25)
  const bottom = suit ? pal.dark : '#1e3a8a', bottomB = shade(bottom, 0.8), bottomL = shade(bottom, 1.5)
  const shoe = suit ? '#f8fafc' : '#f1f5f9', sole = suit ? pal.dark : '#ef4444'
  const side = k.w < 1

  const leg = ([h, kn, f], back) => (
    <g>
      {suit ? (
        <>
          <Limb pts={[h, kn, f]} color={back ? bottomB : bottom} width={13} light={bottomL} back={back} />
          {!back && <Limb pts={[seg(h, kn, 0.15), kn, seg(kn, f, 0.78)]} color={pal.trim} width={1.8} />}
        </>
      ) : (
        <>
          <Limb pts={[h, kn, f]} color={back ? SKIN.back : SKIN.base} width={10} light={SKIN.light} back={back} />
          {/* shorts + white socks */}
          <Limb pts={[h, seg(h, kn, 0.55)]} color={back ? bottomB : bottom} width={15} light={bottomL} back={back} />
          <Limb pts={[seg(kn, f, 0.72), f]} color="#ffffff" width={10} />
        </>
      )}
      <Shoe f={f} kn={kn} side={side} color={back ? shade(shoe, 0.9) : shoe} sole={sole} />
    </g>
  )
  const armEl = ([sh, e, h], back) => {
    const c = back ? topB : top
    return (
      <g>
        {suit ? (
          <>
            <Limb pts={[sh, e, h]} color={c} width={11.5} light={topL} back={back} />
            {!back && <Limb pts={[seg(sh, e, 0.2), e, seg(e, h, 0.72)]} color={pal.trim} width={1.8} />}
            <Limb pts={[seg(e, h, 0.82), seg(e, h, 0.86)]} color={pal.trim} width={11.5} />
          </>
        ) : (
          <>
            <Limb pts={[sh, e, h]} color={back ? SKIN.back : SKIN.base} width={8.5} light={SKIN.light} back={back} />
            {/* t-shirt sleeve with a hem */}
            <Limb pts={[sh, seg(sh, e, 0.5)]} color={c} width={13} light={topL} back={back} />
            <Limb pts={[seg(sh, e, 0.46), seg(sh, e, 0.5)]} color={shade(c, 0.8)} width={13} />
          </>
        )}
        <circle cx={sh.x} cy={sh.y} r={7.2} fill={c} />
        {/* mitten hand */}
        <ellipse cx={h.x} cy={h.y} rx={5.2} ry={4.6} fill={back ? SKIN.back : SKIN.base} stroke={OUT} strokeOpacity=".7" strokeWidth="1.2" />
      </g>
    )
  }
  const H = k.H
  const shadowW = Math.max(14, 36 - k.lift * 0.5)
  const { P, S, up, across, w } = k
  // torso: shoulders -> waist with soft curves (bezier through the corners)
  const sL = add(S, across, -15 * w), sR = add(S, across, 15 * w), wL = add(P, across, -11.5 * w), wR = add(P, across, 11.5 * w)
  const mid = (a, b) => seg(a, b, 0.5)
  const torsoD = `M ${sL.x} ${sL.y} Q ${mid(sL, sR).x + up.x * 3} ${mid(sL, sR).y + up.y * 3} ${sR.x} ${sR.y} Q ${mid(sR, wR).x + across.x * 2 * w} ${mid(sR, wR).y + across.y * 2 * w} ${wR.x} ${wR.y} L ${wL.x} ${wL.y} Q ${mid(sL, wL).x - across.x * 2 * w} ${mid(sL, wL).y - across.y * 2 * w} ${sL.x} ${sL.y} Z`
  const hips = [add(P, across, -12 * w), add(P, across, 12 * w), add(add(P, across, 11 * w), up, -11), add(add(P, across, -11 * w), up, -11)]
  const shape = (pts, color) => <path d={`M ${pts.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L ')} Z`} fill={color} stroke={OUT} strokeOpacity=".7" strokeWidth={2} strokeLinejoin="round" />
  const hijab = look === 'hijab'
  const gid = `g${color || gender}${outfit}`
  const r = 15.5 // head radius (less "chibi", closer to real proportions)

  return (
    <g>
      <defs>
        <linearGradient id={`${gid}t`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={topL} /><stop offset=".55" stopColor={top} /><stop offset="1" stopColor={topB} /></linearGradient>
        <radialGradient id={`${gid}f`} cx=".38" cy=".35" r=".75"><stop offset="0" stopColor={SKIN.light} /><stop offset=".7" stopColor={SKIN.base} /><stop offset="1" stopColor={SKIN.back} /></radialGradient>
        <radialGradient id={`${gid}h`} cx=".35" cy=".25" r=".8"><stop offset="0" stopColor="#6b4428" /><stop offset=".6" stopColor={HAIR} /><stop offset="1" stopColor="#24150b" /></radialGradient>
      </defs>
      {/* exercise mat + soft shadow */}
      <rect x={34} y={GROUND - 2} width={132} height={7} rx={3.5} fill="#86efac" opacity=".55" />
      <ellipse cx={100} cy={GROUND} rx={shadowW} ry={4.5} fill="rgba(0,0,0,.16)" />
      {prop === 'wall' && <rect x={P.x - 24} y={GROUND - 150} width={9} height={150} rx={2} fill="#cbd5e1" stroke="#94a3b8" />}
      {armEl(k.armA, true)}
      {leg(k.legA, true)}
      {leg(k.legB, false)}
      {shape(hips, bottom)}
      <Limb pts={[S, add(S, up, 8)]} color={SKIN.base} width={9} />
      <path d={torsoD} fill={`url(#${gid}t)`} stroke={OUT} strokeOpacity=".7" strokeWidth={2} strokeLinejoin="round" />
      {/* collar / zip */}
      {!side && (suit
        ? <Limb pts={[add(P, up, 3), add(S, up, -2)]} color={pal.trim} width={2} />
        : <path d={`M ${add(S, across, -5).x} ${add(S, across, -5).y} Q ${add(add(S, up, -5), across, 0).x} ${add(add(S, up, -5), across, 0).y} ${add(S, across, 5).x} ${add(S, across, 5).y}`} stroke={shade(top, 0.75)} strokeWidth="2" fill="none" />)}
      {suit && <Limb pts={[add(P, across, -11 * w), add(P, across, 11 * w)]} color={pal.trim} width={3.5} />}
      {hijab && armEl(k.armB, false)}
      {/* head */}
      <g transform={`rotate(${k.tiltDeg} ${H.x} ${H.y})`}>
        {hijab ? (
          <>
            <path d={`M ${H.x - 21} ${H.y - 2} C ${H.x - 23} ${H.y - 29}, ${H.x + 23} ${H.y - 29}, ${H.x + 21} ${H.y - 2} C ${H.x + 23} ${H.y + 14}, ${H.x + 26} ${H.y + 24}, ${H.x + 23} ${H.y + 33} Q ${H.x} ${H.y + 45} ${H.x - 23} ${H.y + 33} C ${H.x - 26} ${H.y + 24}, ${H.x - 23} ${H.y + 14}, ${H.x - 21} ${H.y - 2} Z`} fill={pal.hijab} stroke={OUT} strokeOpacity=".6" strokeWidth="1.6" />
            <path d={`M ${H.x - 13} ${H.y + 21} Q ${H.x} ${H.y + 29} ${H.x + 13} ${H.y + 21}`} stroke={shade(pal.hijab, 0.8)} strokeWidth="2" fill="none" />
            <path d={`M ${H.x - 16} ${H.y - 12} Q ${H.x - 4} ${H.y - 24} ${H.x + 10} ${H.y - 20}`} stroke="#ffffff" strokeOpacity=".45" strokeWidth="3" fill="none" strokeLinecap="round" />
            <ellipse cx={H.x} cy={H.y + 1.5} rx={r - 0.5} ry={r + 0.5} fill={shade(pal.hijab, 0.88)} />
            <ellipse cx={H.x} cy={H.y + 2.5} rx={r - 2.2} ry={r - 1.2} fill={`url(#${gid}f)`} />
          </>
        ) : (
          <>
            {look === 'ponytail' && (
              <>
                <path d={`M ${H.x - 13} ${H.y - 10} C ${H.x - 30} ${H.y - 14}, ${H.x - 32} ${H.y + 6}, ${H.x - 24} ${H.y + 16} C ${H.x - 22} ${H.y + 6}, ${H.x - 20} ${H.y - 2}, ${H.x - 11} ${H.y - 4} Z`} fill={`url(#${gid}h)`} stroke={OUT} strokeOpacity=".6" strokeWidth="1.3" />
                <circle cx={H.x - 14} cy={H.y - 9} r={3.4} fill={pal.main} stroke={OUT} strokeOpacity=".5" />
              </>
            )}
            {/* ears */}
            <ellipse cx={H.x - r + 0.5} cy={H.y + 3} rx={3.3} ry={4.3} fill={SKIN.base} stroke={OUT} strokeOpacity=".55" strokeWidth="1.2" />
            <ellipse cx={H.x + r - 0.5} cy={H.y + 3} rx={3.3} ry={4.3} fill={SKIN.base} stroke={OUT} strokeOpacity=".55" strokeWidth="1.2" />
            <ellipse cx={H.x} cy={H.y + 2} rx={r} ry={r + 1} fill={`url(#${gid}f)`} stroke={OUT} strokeOpacity=".7" strokeWidth="1.6" />
            {/* hair cap with a fringe and a shine */}
            <path d={`M ${H.x - r - 0.8} ${H.y + 1} C ${H.x - r - 3} ${H.y - r - 6}, ${H.x + r + 3} ${H.y - r - 6}, ${H.x + r + 0.8} ${H.y + 1} C ${H.x + r - 2} ${H.y - 7}, ${H.x + 6} ${H.y - 9}, ${H.x + 2} ${H.y - 6} C ${H.x - 2} ${H.y - 11}, ${H.x - 9} ${H.y - 6}, ${H.x - r - 0.8} ${H.y + 1} Z`} fill={`url(#${gid}h)`} stroke={OUT} strokeOpacity=".7" strokeWidth="1.4" />
            <path d={`M ${H.x - 9} ${H.y - 13} Q ${H.x - 1} ${H.y - 18} ${H.x + 7} ${H.y - 14}`} stroke="#ffffff" strokeOpacity=".35" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          </>
        )}
        {/* face: brows, eyes with highlights, nose, cheeks, smile */}
        <path d={`M ${H.x - 8.5} ${H.y - 3.2} q 3 -2 6 0 M ${H.x + 2.5} ${H.y - 3.2} q 3 -2 6 0`} stroke="#4a2e1d" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {[-5.5, 5.5].map((dx) => (
          <g key={dx}>
            <ellipse cx={H.x + dx} cy={H.y + 2} rx={2.6} ry={3} fill="#ffffff" />
            <circle cx={H.x + dx + (side ? 0.8 : 0)} cy={H.y + 2.4} r={1.9} fill="#3b2416" />
            <circle cx={H.x + dx + 0.6 + (side ? 0.8 : 0)} cy={H.y + 1.6} r={0.7} fill="#ffffff" />
          </g>
        ))}
        <path d={`M ${H.x} ${H.y + 4.5} q 1.5 2.5 -0.8 3.3`} stroke={SKIN.line} strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <ellipse cx={H.x - 9} cy={H.y + 8.5} rx={2.8} ry={1.8} fill="#f08f8f" opacity=".45" />
        <ellipse cx={H.x + 9} cy={H.y + 8.5} rx={2.8} ry={1.8} fill="#f08f8f" opacity=".45" />
        <path d={`M ${H.x - 4} ${H.y + 10} Q ${H.x} ${H.y + 13.5} ${H.x + 4} ${H.y + 10}`} stroke="#7a3b2e" strokeWidth="1.7" fill="#fff5f5" strokeLinecap="round" />
      </g>
      {!hijab && armEl(k.armB, false)}
    </g>
  )
}

// <Kid ex="squats" look="ponytail" gender="f" size={160} playing />
export default function Kid({ ex, look = 'short', gender = 'm', outfit, color, size = 120, playing = true, phase = null, className = '' }) {
  const mv = MOVES[ex] || MOVES.reach
  const [t, setT] = useState(0.5 / mv.f.length) // still frame = middle of 1st transition
  useEffect(() => {
    if (!playing) { setT(phase ?? 1 / mv.f.length); return }
    let raf = 0, last = 0
    const start = performance.now()
    const loop = (now) => {
      if (now - last > 33) { last = now; setT(((now - start) % mv.p) / mv.p) }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [ex, playing, mv, phase])
  const anchor = mv.anchor || 'feet'
  const shift = useMemo(() => {
    const rest = skeletonRaw({ ...BASE, ...mv.f[0] }, mv.side)
    return bboxCenter(rest) - anchorOf(rest, anchor)
  }, [mv, anchor])
  const q = lerpPose(mv.f, playing ? t : (phase ?? t))
  const k = place(skeletonRaw(q, mv.side), q, anchor, shift)
  return (
    <svg viewBox="0 0 200 240" width={size} height={size * 1.2} className={className} role="img" aria-label={ex}>
      <Figure k={k} look={look} gender={gender} outfit={outfit || (look === 'hijab' ? 'tracksuit' : 'sport')} color={color} prop={mv.prop} />
    </svg>
  )
}

export const lookOf = (child) => child?.look || (child?.gender === 'f' ? 'ponytail' : 'short')
// Everything the avatar needs from a child profile, as props: <Kid {...kidProps(child)} />
export const kidProps = (child) => {
  const look = lookOf(child)
  return { look, gender: child?.gender, outfit: child?.outfit || (look === 'hijab' ? 'tracksuit' : 'sport'), color: child?.color }
}
