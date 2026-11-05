// Loads MediaPipe Pose once (singleton), fully offline.
// http(s): files are served from ./pose/ (and cached by the service worker).
// file:// (PC build): fetch() of local files is blocked, so we load
// pose-pack.js via <script> (allowed) and turn its base64 into blob: URLs.
let pending = null

function loadScript(src) {
  return new Promise((res, rej) => {
    const s = document.createElement('script')
    s.src = src
    s.onload = res
    s.onerror = () => rej(new Error('failed to load ' + src))
    document.head.appendChild(s)
  })
}

const MIME = { js: 'text/javascript', wasm: 'application/wasm' }

export function loadPose() {
  if (pending) return pending
  pending = (async () => {
    const base = new URL('pose/', document.baseURI).href
    let locate = (f) => base + f
    if (location.protocol === 'file:') {
      if (!window.__POSE_FILES) await loadScript(base + 'pose-pack.js')
      const map = {}
      for (const [name, b64] of Object.entries(window.__POSE_FILES)) {
        const type = MIME[name.split('.').pop()] || 'application/octet-stream'
        const blob = await (await fetch(`data:${type};base64,${b64}`)).blob()
        map[name] = URL.createObjectURL(new Blob([blob], { type }))
      }
      delete window.__POSE_FILES // free ~24MB of strings
      locate = (f) => map[f] || base + f
    }
    if (!window.Pose) await loadScript(base + 'pose.js')
    const pose = new window.Pose({ locateFile: locate })
    pose.setOptions({ modelComplexity: 0, smoothLandmarks: true, enableSegmentation: false, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5, selfieMode: true })
    await pose.initialize()
    return pose
  })()
  pending.catch(() => { pending = null })
  return pending
}
