// ---------------------------------------------------------------------------
// Growth & energy calculations. PARENT-ONLY numbers: nothing here is shown in
// the child's screens except servings (portion counts, never calories).
//
// Sources:
//  - WHO Child Growth Standards (2006, <5 y) and WHO Growth Reference (2007,
//    5-19 y): LMS method, z = ((x/M)^L - 1) / (L*S), with WHO's restricted
//    adjustment beyond ±3 SD for BMI and weight.
//  - NASEM (2023) Dietary Reference Intakes for Energy, Table 5-5 (TEE
//    equations, 3-18 y) + energy cost of growth -> EER.
//  - Dietary Guidelines for Americans 2025-2030: daily servings by calorie level.
// ---------------------------------------------------------------------------
import { WHO, WHO_START_MONTH } from './whoData.js'

// ---- age -------------------------------------------------------------------
export function ageMonths(birth, at = new Date()) {
  const b = new Date(birth + 'T00:00:00')
  const d = typeof at === 'string' ? new Date(at + 'T00:00:00') : at
  return (d - b) / 86400000 / 30.4375
}
// Age in years: exact from birth date, else the profile's whole-year age + 0.5
export const ageYears = (child, at) => (child?.birth ? ageMonths(child.birth, at) / 12 : (child?.age ?? 6) + 0.5)

// ---- LMS ------------------------------------------------------------------
function lmsAt(table, months) {
  const i = months - WHO_START_MONTH
  if (!table || i < 0 || i > table.length - 1) return null
  const a = Math.floor(i), f = i - a
  const A = table[a], B = table[Math.min(a + 1, table.length - 1)]
  return [0, 1, 2].map((k) => A[k] + (B[k] - A[k]) * f)
}
const valueAtZ = ([L, M, S], z) => (L === 0 ? M * Math.exp(S * z) : M * Math.pow(1 + L * S * z, 1 / L))

function zFromLms(lms, x, restricted) {
  const [L, M, S] = lms
  let z = L === 0 ? Math.log(x / M) / S : (Math.pow(x / M, L) - 1) / (L * S)
  if (restricted && Math.abs(z) > 3) {
    // WHO restricted application of the LMS method beyond ±3 SD
    const sd3 = valueAtZ(lms, 3 * Math.sign(z))
    const sd2 = valueAtZ(lms, 2 * Math.sign(z))
    const sd23 = Math.abs(sd3 - sd2)
    z = Math.sign(z) * 3 + (x - sd3) / sd23
  }
  return z
}

// Standard normal CDF (Abramowitz-Stegun 7.1.26, error < 1.5e-7)
export function normCdf(z) {
  const t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2)
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-(z * z) / 2)
  return z >= 0 ? (1 + y) / 2 : (1 - y) / 2
}

export function whoZ(kind, sex, months, x) {
  const lms = lmsAt(WHO[`${kind}_${sex === 'f' ? 'f' : 'm'}`], months)
  if (!lms || !(x > 0)) return null
  const z = zFromLms(lms, x, kind !== 'hgt')
  return { z, pct: normCdf(z) * 100 }
}

// Reference curve for charts: value of `kind` at z for each month in range
export function whoCurve(kind, sex, z, m0, m1, step = 1) {
  const out = []
  for (let m = m0; m <= m1; m += step) {
    const lms = lmsAt(WHO[`${kind}_${sex === 'f' ? 'f' : 'm'}`], m)
    if (lms) out.push([m, valueAtZ(lms, z)])
  }
  return out
}
export const whoRange = (kind) => [WHO_START_MONTH, WHO_START_MONTH + WHO[`${kind}_m`].length - 1]

// WHO cut-offs. <5 y uses the Child Growth Standards, 5-19 y the 2007 reference.
export function bmiCategory(z, months) {
  if (z == null) return null
  if (months < 61) {
    if (z > 3) return 'obese'
    if (z > 2) return 'over'
    if (z > 1) return 'risk'
    if (z < -3) return 'severeThin'
    if (z < -2) return 'thin'
    return 'normal'
  }
  if (z > 2) return 'obese'
  if (z > 1) return 'over'
  if (z < -3) return 'severeThin'
  if (z < -2) return 'thin'
  return 'normal'
}
export const heightCategory = (z) => (z == null ? null : z < -3 ? 'severeShort' : z < -2 ? 'short' : z > 3 ? 'tall' : 'normal')

// ---- energy (NASEM 2023) ---------------------------------------------------
export const PAL_LEVELS = ['inactive', 'low', 'active', 'very']
const TEE = {
  m: { inactive: [-447.51, 3.68, 13.01, 13.15], low: [19.12, 3.68, 8.62, 20.28], active: [-388.19, 3.68, 12.66, 20.46], very: [-671.75, 3.68, 15.38, 23.25] },
  f: { inactive: [55.59, -22.25, 8.43, 17.07], low: [-297.54, -22.25, 12.77, 14.73], active: [-189.55, -22.25, 11.74, 18.34], very: [-709.59, -22.25, 18.22, 14.25] },
}
const TEE_UNDER3 = { m: [-716.45, -1.0, 17.82, 15.06], f: [-69.15, 80.0, 2.65, 54.15] }

// Energy deposited for growth (kcal/d), NASEM 2023 text p. 93
function growthKcal(sex, age) {
  if (age < 3) return 20
  if (age < 4) return sex === 'f' ? 15 : 20
  if (age < 9) return 15
  if (age < 14) return sex === 'f' ? 30 : 25
  return 20
}

// Estimated Energy Requirement, kcal/day
export function eer({ sex, age, heightCm, weightKg, pal = 'active' }) {
  if (!(heightCm > 0 && weightKg > 0 && age > 0)) return null
  const s = sex === 'f' ? 'f' : 'm'
  const [a, b, c, d] = age < 3 ? TEE_UNDER3[s] : TEE[s][pal] || TEE[s].active
  const tee = a + b * age + c * heightCm + d * weightKg
  return { tee: Math.round(tee), eer: Math.round(tee + growthKcal(s, age)) }
}

// Activity level estimated from the app's movement minutes (7-day average).
// Rough mapping to NASEM PAL categories; parents can override it.
export function palFromMinutes(avgMin) {
  if (avgMin >= 90) return 'very'
  if (avgMin >= 60) return 'active'
  if (avgMin >= 30) return 'low'
  return 'inactive'
}

// When height/weight are missing: typical calorie level by age & sex
// (moderately active), so the child still gets sensible portion targets.
export function fallbackKcal(sex, age) {
  if (age < 4) return 1000
  if (age < 9) return 1400
  if (age < 14) return sex === 'f' ? 1600 : 1800
  return sex === 'f' ? 2000 : 2400
}

// ---- servings (DGA 2025-2030) ---------------------------------------------
// [min, max] servings per day for each calorie level
const LEVELS = [1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400, 2600, 2800, 3000, 3200]
const DGA = {
  protein: [[1, 1.5], [1.5, 2], [2, 2.5], [2.5, 3.5], [2.5, 3.5], [3, 4], [3.5, 4.5], [3.5, 4.5], [3.5, 4.5], [4, 5], [4, 5], [4, 5]],
  dairy: [[2, 2], [2.5, 2.5], [2.5, 2.5], [3, 3], [3, 3], [3, 3], [3, 3], [3, 3], [3, 3], [3, 3], [3, 3], [3, 3]],
  veg: [[1.25, 1.25], [1.75, 1.75], [1.75, 1.75], [2.5, 2.5], [3, 3], [3, 3], [3.5, 3.5], [3.5, 3.5], [4.25, 4.25], [4.25, 4.25], [4.75, 4.75], [4.75, 4.75]],
  fruit: [[1, 1], [1, 1], [1.5, 1.5], [1.5, 1.5], [1.5, 1.5], [2, 2], [2, 2], [2, 2], [2, 2], [2.5, 2.5], [2.5, 2.5], [2.5, 2.5]],
  grain: [[1, 2], [1.5, 2.75], [1.75, 3.25], [1.75, 3.25], [2, 4], [2, 4], [2.25, 4.5], [2.75, 5.25], [3, 6], [3.25, 6.5], [3.25, 6.5], [3.25, 6.5]],
}
export const GROUPS = ['veg', 'fruit', 'grain', 'protein', 'dairy']

export const calorieLevel = (kcal) => LEVELS.reduce((best, l) => (Math.abs(l - kcal) < Math.abs(best - kcal) ? l : best), LEVELS[0])

export function servingTargets(kcal) {
  const i = LEVELS.indexOf(calorieLevel(kcal))
  const out = {}
  for (const g of GROUPS) {
    const [lo, hi] = DGA[g][i]
    // Kid target = whole servings at the middle of the range (min 1)
    out[g] = { lo, hi, target: Math.max(1, Math.round((lo + hi) / 2)) }
  }
  return out
}

// ---- everything about one child at once -------------------------------------
export function latestMeasure(child) {
  const m = [...(child?.measures || [])].sort((a, b) => a.d.localeCompare(b.d))
  return m[m.length - 1] || null
}

export function assess(child, { avgMoveMin = 0, at = new Date() } = {}) {
  const sex = child.gender === 'f' ? 'f' : 'm'
  const age = ageYears(child, at)
  const months = age * 12
  const m = latestMeasure(child)
  const pal = child.pal && child.pal !== 'auto' ? child.pal : palFromMinutes(avgMoveMin)
  let bmi = null, bmiZ = null, hZ = null, wZ = null, energy = null
  if (m?.h && m?.w) {
    const mMonths = child.birth ? ageMonths(child.birth, m.d) : months
    bmi = m.w / Math.pow(m.h / 100, 2)
    bmiZ = whoZ('bmi', sex, mMonths, bmi)
    hZ = whoZ('hgt', sex, mMonths, m.h)
    wZ = mMonths <= 120 ? whoZ('wgt', sex, mMonths, m.w) : null
    energy = eer({ sex, age, heightCm: m.h, weightKg: m.w, pal })
  }
  const kcal = energy?.eer ?? fallbackKcal(sex, age)
  return {
    sex, age, months, measure: m, pal, palAuto: !child.pal || child.pal === 'auto',
    bmi, bmiZ, bmiCat: bmiZ ? bmiCategory(bmiZ.z, months) : null,
    hZ, hCat: hZ ? heightCategory(hZ.z) : null, wZ,
    energy, kcal, estimated: !energy, level: calorieLevel(kcal), targets: servingTargets(kcal),
  }
}

// Average daily movement minutes over the last `days` days (from app history)
export function avgMoveMinutes(progress, days = 7) {
  let total = 0
  for (let i = 0; i < days; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    total += progress?.history?.[k]?.move || 0
  }
  return total / 60 / days
}
