// Loading screen: the letters rise in one by one, then the logo's own intro plays (the O spins in,
// hops and turns into the speech bubble, the S wiggles), the tagline fades in, and the screen fades away.
// It's in index.html so it shows while the app loads. Plays once per app start; tap to skip.
import { createLogoAnim, LOGO_INTRO, LOGO_REST } from './header'
import { reducedMotion } from './lib'

const clamp = (x: number) => Math.min(1, Math.max(0, x))
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
const back = (t: number) => {
  const c1 = 1.6, c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

// seconds
const LETTER_GAP = 0.09, LETTER = 0.5 // v e r v rise in
const LOGO_AT = 0.3 // the O and S fade in here and their intro starts
const TAG_AT = 2.5, TAG = 0.5 // tagline
const LOGO_END = LOGO_AT + (LOGO_INTRO[1] - LOGO_INTRO[0])
const HOLD = 0.35 // a short look at the finished logo
const FADE_MS = 350

export function runSplash() {
  const el = document.getElementById('splash')
  if (!el) return
  const letters = [...el.querySelectorAll<SVGPathElement>('.sp-l')]
  const o = el.querySelector<SVGElement>('#wm-hop-sp')!, s = el.querySelector<SVGElement>('#wm-s-sp')!
  const tag = el.querySelector<HTMLElement>('.sp-tag')!
  const logo = createLogoAnim('-sp')
  let done = false, raf = 0

  const finish = () => {
    if (done) return
    done = true
    cancelAnimationFrame(raf)
    el.classList.add('out')
    setTimeout(() => el.remove(), FADE_MS)
  }
  el.addEventListener('click', finish)

  if (reducedMotion()) {
    // no motion: show the finished logo, then fade
    logo.render(LOGO_REST)
    for (const x of [...letters, o, s, tag]) x.style.opacity = '1'
    setTimeout(finish, 700)
    return
  }

  let t0 = 0
  const frame = (now: number) => {
    if (!t0) t0 = now
    const t = (now - t0) / 1000
    letters.forEach((l, i) => {
      const k = clamp((t - i * LETTER_GAP) / LETTER)
      l.setAttribute('transform', `translate(0 ${(1 - back(k)) * 60})`)
      l.style.opacity = String(clamp(k * 2.5))
    })
    const ok = easeOut(clamp((t - LOGO_AT + 0.15) / 0.3))
    o.style.opacity = s.style.opacity = String(ok)
    logo.render(t < LOGO_AT ? LOGO_INTRO[0] : Math.min(LOGO_REST, LOGO_INTRO[0] + (t - LOGO_AT)))
    tag.style.opacity = String(easeOut(clamp((t - TAG_AT) / TAG)))
    if (t >= LOGO_END + HOLD) finish()
    else raf = requestAnimationFrame(frame)
  }
  raf = requestAnimationFrame(frame)
}
