import { whoCurve, whoZ, eer, servingTargets, normCdf, bmiCategory } from '../src/modules/growth/calc.js'
const v = (k, s, z, m) => whoCurve(k, s, z, m, m)[0][1].toFixed(1)
const checks = [
  // WHO 2007 published values (BMI-for-age, 10 y = 120 mo)
  ['boys 10y BMI median 16.4', v('bmi', 'm', 0, 120), '16.4'],
  ['boys 10y BMI +1SD 18.5', v('bmi', 'm', 1, 120), '18.5'],
  ['boys 10y BMI +2SD 21.4', v('bmi', 'm', 2, 120), '21.4'],
  ['girls 10y BMI +1SD 19.0', v('bmi', 'f', 1, 120), '19.0'],
  ['girls 10y BMI +2SD 22.6', v('bmi', 'f', 2, 120), '22.6'],
  ['boys 10y height median 137.8', v('hgt', 'm', 0, 120), '137.8'],
  ['girls 10y height median 138.6', v('hgt', 'f', 0, 120), '138.6'],
  ['boys 5y BMI median 15.2', v('bmi', 'm', 0, 60), '15.2'],
  ['normCdf(1)=84.13', (normCdf(1) * 100).toFixed(2), '84.13'],
  ['z of median = 0', whoZ('bmi', 'f', 96, +whoCurve('bmi', 'f', 0, 96, 96)[0][1]).z.toFixed(3), '0.000'],
  // NASEM 2023 hand-calculated: boy 8y 128cm 26kg active = -388.19+29.44+1620.48+531.96 = 1793.69 (+15 growth)
  ['EER boy 8y active', eer({ sex: 'm', age: 8, heightCm: 128, weightKg: 26, pal: 'active' }).eer, 1809],
  // girl 8y 127cm 26kg active = -189.55-178+1490.98+476.84 = 1600.27 (+15)
  ['EER girl 8y active', eer({ sex: 'f', age: 8, heightCm: 127, weightKg: 26, pal: 'active' }).eer, 1615],
  ['servings 1600 veg', servingTargets(1610).veg.lo, 2.5],
  ['cat 7y z=1.5 -> over', bmiCategory(1.5, 84), 'over'],
  ['cat 4y z=1.5 -> risk', bmiCategory(1.5, 48), 'risk'],
]
let ok = true
for (const [n, got, exp] of checks) { const pass = String(got) === String(exp); ok &&= pass; console.log(pass ? '✓' : '✗', n, '→', got) }
console.log(ok ? 'PASS' : 'FAIL'); process.exit(ok ? 0 : 1)
