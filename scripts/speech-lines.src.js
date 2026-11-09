// Collects every Arabic phrase the app speaks -> voice-lines.json
// { key: what the app passes to say(), text: what the voice reads }
import { FOODS, STR } from '../src/data'
import { EXERCISES } from '../src/modules/move/data'
import { STEPS, BRUSH_ZONES, NIGHT_STR } from '../src/modules/night/data'
import { resolve } from '../src/speechText'
import { writeFileSync } from 'node:fs'

const AR_NUM = ['', 'واحد', 'اثنين', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة',
  'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر', 'عشرون',
  'واحد وعشرون', 'اثنان وعشرون', 'ثلاثة وعشرون', 'أربعة وعشرون', 'خمسة وعشرون', 'ستة وعشرون', 'سبعة وعشرون', 'ثمانية وعشرون', 'تسعة وعشرون', 'ثلاثون',
  'واحد وثلاثون', 'اثنان وثلاثون', 'ثلاثة وثلاثون', 'أربعة وثلاثون', 'خمسة وثلاثون', 'ستة وثلاثون', 'سبعة وثلاثون', 'ثمانية وثلاثون', 'تسعة وثلاثون', 'أربعون']

const lines = new Map()
// kind: 'calm' (foods, numbers) or 'energy' (exercises, encouragement) -> voice style
const add = (key, text = key, kind = 'calm') => { key = resolve(key); if (key) lines.set(key, { text: resolve(text), kind }) }
const both = (v) => (v && typeof v === 'object' ? [v.m, v.f] : [v])

for (const f of FOODS) add(f.name.ar)
for (const e of Object.values(EXERCISES)) { add(e.name.ar, e.name.ar, 'energy'); both(e.how.ar).forEach((h) => add(h, h, 'energy')) }
for (const k of ['done', 'freeze', 'freezeF', 'half', 'go', 'camFrame', 'listening']) both(STR.ar[k]).forEach((v) => v && add(v, v, 'energy'))
// bedtime journey: step names + how-to (both genders), brushing zones, cues
for (const s of STEPS) { add(s.name.ar); both(s.how.ar).forEach((h) => add(h)) }
for (const z of BRUSH_ZONES) add(z.name.ar, z.name.ar, 'energy')
for (const k of ['brushDone', 'brushNow', 'brushNowF']) both(NIGHT_STR.ar[k]).forEach((v) => v && add(v))
for (let n = 1; n <= 40; n++) add(String(n), AR_NUM[n])

writeFileSync('voice-lines.json', JSON.stringify([...lines].map(([key, v]) => ({ key, ...v })), null, 1))
console.log('lines:', lines.size)
