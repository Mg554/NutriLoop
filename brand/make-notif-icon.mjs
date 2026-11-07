// White silhouette for the Android notification bar (loop + apple).
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96">
  <path d="M 48 10 A 38 38 0 1 1 15.1 67 " fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/>
  <path d="M 6 60 L 15 75 L 25 60 Z" fill="#fff"/>
  <path d="M48 36 C 41 30, 28 32, 28 45 C 28 59, 38 69, 48 66 C 58 69, 68 59, 68 45 C 68 32, 55 30, 48 36 Z" fill="#fff"/>
  <path d="M49 35 C 50 30, 52 27, 56 24" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round"/>
</svg>`
const sizes = { mdpi: 24, hdpi: 36, xhdpi: 48, xxhdpi: 72, xxxhdpi: 96 }
for (const [d, px] of Object.entries(sizes)) {
  const dir = `android/app/src/main/res/drawable-${d}`
  mkdirSync(dir, { recursive: true })
  await sharp(Buffer.from(svg)).resize(px, px).png().toFile(`${dir}/ic_stat_nutriloop.png`)
}
console.log('notification icons ok')
