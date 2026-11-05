// NutriLoop brand icon. One SVG source -> PWA icons, favicon, and Android
// adaptive-icon layers (foreground on transparent + background).
import sharp from 'sharp'
import { mkdirSync, writeFileSync } from 'node:fs'

const C = 512
const ring = (r, a0, a1) => {
  const p = (a) => [C + r * Math.cos((a * Math.PI) / 180), C + r * Math.sin((a * Math.PI) / 180)]
  const [x0, y0] = p(a0), [x1, y1] = p(a1)
  return `M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`
}
const arrow = (r, a, size) => {
  // arrowhead at angle a pointing clockwise
  const rad = (a * Math.PI) / 180
  const tip = [C + r * Math.cos(rad + 0.16), C + r * Math.sin(rad + 0.16)]
  const o = [Math.cos(rad), Math.sin(rad)]
  const b1 = [C + (r + size) * o[0], C + (r + size) * o[1]]
  const b2 = [C + (r - size) * o[0], C + (r - size) * o[1]]
  return `M ${b1.map((v) => v.toFixed(1))} L ${tip.map((v) => v.toFixed(1))} L ${b2.map((v) => v.toFixed(1))} Z`
}

// scale: 1 = full icon; adaptive foreground is drawn smaller (safe zone)
const foreground = (s = 1) => `
<g transform="translate(${C} ${C}) scale(${s}) translate(${-C} ${-C})">
  <!-- the loop: a daily habit cycle -->
  <path d="${ring(318, -78, 212)}" fill="none" stroke="#FFFFFF" stroke-width="62" stroke-linecap="round"/>
  <path d="${arrow(318, 212, 62)}" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="18" stroke-linejoin="round"/>
  <path d="${ring(318, 232, 266)}" fill="none" stroke="#FFD86B" stroke-width="62" stroke-linecap="round"/>
  <!-- apple -->
  <path d="M512 430 C 455 385, 352 400, 350 505 C 348 615, 430 700, 512 678 C 594 700, 676 615, 674 505 C 672 400, 569 385, 512 430 Z" fill="#4CC38A"/>
  <path d="M512 430 C 569 385, 672 400, 674 505 C 676 615, 594 700, 512 678 Z" fill="#3AAE77"/>
  <ellipse cx="430" cy="490" rx="26" ry="44" fill="#FFFFFF" opacity=".35" transform="rotate(20 430 490)"/>
  <path d="M512 432 C 512 400, 520 372, 538 352" stroke="#7A4A2A" stroke-width="18" fill="none" stroke-linecap="round"/>
  <path d="M540 360 C 590 320, 650 340, 662 370 C 620 400, 566 398, 540 360 Z" fill="#2E9E66"/>
  <!-- friendly face -->
  <circle cx="468" cy="540" r="16" fill="#1F3D2E"/>
  <circle cx="556" cy="540" r="16" fill="#1F3D2E"/>
  <path d="M478 586 Q 512 616 546 586" stroke="#1F3D2E" stroke-width="14" fill="none" stroke-linecap="round"/>
  <circle cx="440" cy="582" r="15" fill="#FF8FA3" opacity=".7"/>
  <circle cx="584" cy="582" r="15" fill="#FF8FA3" opacity=".7"/>
</g>`
const bgDefs = `<defs><radialGradient id="bg" cx="35%" cy="30%" r="85%"><stop offset="0" stop-color="#FF9A5C"/><stop offset="1" stop-color="#F2533C"/></radialGradient></defs>`
const full = (rounded) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">${bgDefs}
  <rect width="1024" height="1024" rx="${rounded ? 224 : 0}" fill="url(#bg)"/>${foreground(1)}</svg>`
const fg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">${foreground(0.74)}</svg>`
const bg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">${bgDefs}<rect width="1024" height="1024" fill="url(#bg)"/></svg>`
// maskable PWA icon: full bleed, content in safe zone
const maskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">${bgDefs}<rect width="1024" height="1024" fill="url(#bg)"/>${foreground(0.78)}</svg>`

mkdirSync('brand/out', { recursive: true })
mkdirSync('assets', { recursive: true })
writeFileSync('brand/icon.svg', full(true))
const png = (svg, size, path) => sharp(Buffer.from(svg)).resize(size, size).png().toFile(path)
await Promise.all([
  png(full(true), 1024, 'brand/out/icon-1024.png'),
  png(full(true), 512, 'public/icon-512.png'),
  png(full(true), 192, 'public/icon-192.png'),
  png(full(false), 180, 'public/apple-touch-icon.png'),
  png(maskable, 512, 'public/icon-maskable-512.png'),
  // inputs for @capacitor/assets (Android adaptive icon + splash)
  png(full(false), 1024, 'assets/icon-only.png'),
  png(fg, 1024, 'assets/icon-foreground.png'),
  png(bg, 1024, 'assets/icon-background.png'),
])
// splash: icon centred on brand colour
const splash = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2732 2732" width="2732" height="2732">${bgDefs}<rect width="2732" height="2732" fill="url(#bg)"/>
  <g transform="translate(1366 1150) scale(1.5) translate(-512 -512)">${foreground(1)}</g>
  <text x="1366" y="1900" font-family="Cairo, Arial, sans-serif" font-size="190" font-weight="900" fill="#FFFFFF" text-anchor="middle">NutriLoop</text></svg>`
await png(splash, 2732, 'assets/splash.png')
await png(splash, 2732, 'assets/splash-dark.png')
console.log('icons ok')
