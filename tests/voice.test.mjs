import { findFoods } from '../src/voiceMatch.js'
import { readFileSync } from 'node:fs'
// load FOODS without the module's other imports
const src = readFileSync(new URL('../src/data.js', import.meta.url), 'utf8')
const FOODS = eval(src.slice(src.indexOf('export const FOODS = ') + 'export const FOODS = '.length, src.indexOf('\n]\n', src.indexOf('export const FOODS')) + 2))
const cases = [
  [['بدي بيض وخبز وحليب'], ['egg', 'bread', 'milk']],
  [['بطاطا حلوة'], ['sweetpotato']],
  [['لبنة'], ['labneh']],
  [['لبن'], ['yogurt']],
  [['التفاحة'], ['apple']],
  [['والموز'], ['banana']],
  [['ورق عنب'], ['warak']],
  [['بندوره وخيار'], ['tomato', 'cucumber']],
  [['طماطم'], ['tomato']],
  [['مقلوبة بالجاج'], ['maqluba', 'chicken']],
  [['كعك القدس'], ['kaak']],
  [['جبنة نابلسية'], ['nabulsi']],
  [['جبنه'], ['cheese']],
  [['تفاح اخضر'], ['greenapple']],
  [['apples and bananas'], ['apple', 'banana']],
  [['ما بدي اشي'], []],
  [['شو هاد', 'فلافل'], ['falafel']], // second alternative used
  [['بركة'], []], // must not match "برغل"/"بروكلي"
]
let ok = true
for (const [alts, exp] of cases) {
  const got = findFoods(alts, FOODS)
  const pass = JSON.stringify(got.sort()) === JSON.stringify([...exp].sort())
  ok &&= pass
  console.log(pass ? '✓' : '✗', alts.join(' | '), '→', got.join(','))
}
console.log(ok ? 'PASS' : 'FAIL'); process.exit(ok ? 0 : 1)
