// Packs the pose model files into one JS file of base64 strings.
// Used when the app runs from file:// (PC offline build), where fetch() of
// local files is blocked but <script src> still works.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
const dir = 'public/pose'
const files = readdirSync(dir).filter((f) => f !== 'pose.js' && f !== 'pose-pack.js')
let out = 'window.__POSE_FILES={'
for (const f of files) out += JSON.stringify(f) + ':"' + readFileSync(`${dir}/${f}`).toString('base64') + '",'
writeFileSync(`${dir}/pose-pack.js`, out + '};')
console.log('packed', files.length, 'files')
