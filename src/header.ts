// App bar: compact on scroll, and the wordmark animation (intro once, replay on tap)
import { $, reducedMotion } from './lib'

export function initAppBar() {
  const bar = $('#appbar')
  let compact = false, ticking = false
  const update = () => {
    ticking = false
    const y = window.scrollY
    const next = compact ? y > 12 : y > 28
    if (next !== compact) {
      compact = next
      bar.classList.toggle('is-compact', compact)
      $('#mini-btn').tabIndex = compact ? 0 : -1
      $('#wm-btn').tabIndex = compact ? -1 : 0
    }
  }
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true
      requestAnimationFrame(update)
    }
  }, { passive: true })
  update()
  $('#mini-btn').addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' }))
}

type Track = [time: number, value: number][]

// Keyframe tracks in seconds. Intro plays 0.35→3.2 once; tap plays 4.8→5.76 (bubble tucks in, O spins back) then 0.5→3.2.
const TRACKS: Record<string, Track> = {
  spin: [[0, -90], [0.6, -90], [0.8, -102], [1.15, 12], [1.35, -5], [1.5, 2], [1.62, 0], [5.0, 0], [5.12, 6], [5.42, -98], [5.55, -87], [5.66, -91], [5.76, -90]],
  hopY: [[0, 0], [0.8, 0], [0.98, -30], [1.15, 0], [2.45, 0], [2.62, -18], [2.78, 0], [5.12, 0], [5.3, -30], [5.45, 0]],
  hopSx: [[0, 1], [0.6, 1], [0.8, 1.07], [0.98, 0.95], [1.15, 1.08], [1.3, 0.97], [1.42, 1], [2.3, 1], [2.45, 1.07], [2.62, 0.97], [2.78, 1.04], [2.9, 1], [5.0, 1], [5.12, 1.07], [5.3, 0.95], [5.45, 1.08], [5.6, 0.98], [5.7, 1]],
  hopSy: [[0, 1], [0.6, 1], [0.8, 0.9], [0.98, 1.06], [1.15, 0.92], [1.3, 1.03], [1.42, 1], [2.3, 1], [2.45, 0.9], [2.62, 1.04], [2.78, 0.96], [2.9, 1], [5.0, 1], [5.12, 0.9], [5.3, 1.06], [5.45, 0.92], [5.6, 1.02], [5.7, 1]],
  sX: [[0, 0], [1.0, 0], [1.12, 16], [1.3, 2], [1.42, 7], [1.52, 5.257], [5.3, 5.257], [5.42, -6], [5.55, 1.5], [5.65, 0]],
  sRot: [[0, 0], [1.0, 0], [1.12, 9], [1.28, -4], [1.4, 1.5], [1.5, 0], [2.55, 0], [2.68, -4], [2.82, 2.5], [2.95, 0], [5.3, 0], [5.42, -8], [5.55, 3], [5.65, 0]],
  sSx: [[0, 1], [1.0, 1], [1.06, 0.9], [1.2, 1.03], [1.3, 1]],
  sSy: [[0, 1], [1.0, 1], [1.06, 1.07], [1.2, 0.98], [1.3, 1]],
  cS: [[0, 1], [2.3, 1], [2.45, 0.85], [2.65, 1.1], [2.8, 0.97], [2.92, 1], [4.8, 1], [4.9, 1.06], [5.05, 1]],
  tailS: [[0, 0], [2.55, 0], [2.75, 1.35], [2.9, 0.85], [3.02, 1.08], [3.12, 1], [4.8, 1], [4.9, 1.15], [5.05, 0]],
  tailR: [[0, -25], [2.55, -25], [2.75, -8], [2.9, 6], [3.02, -2], [3.12, 0], [4.8, 0], [5.05, -20]],
}
const ease = (q: number) => -(Math.cos(Math.PI * q) - 1) / 2
const val = (k: string, t: number) => {
  const a = TRACKS[k]
  if (t <= a[0][0]) return a[0][1]
  for (let i = 1; i < a.length; i++)
    if (t <= a[i][0]) {
      const [t0, v0] = a[i - 1], [t1, v1] = a[i]
      return v0 + (v1 - v0) * ease((t - t0) / (t1 - t0))
    }
  return a[a.length - 1][1]
}

export function initLogo() {
  const hop = $('#wm-hop'), spin = $('#wm-spin'), pop = $('#wm-pop'), tail = $('#wm-tail'), s = $('#wm-s')
  const OX = 748.97, OY = 89.28, OB = 176, SX = 926, SB = 178.56, REST = 3.2
  function render(t: number) {
    hop.setAttribute('transform', `translate(${OX} ${OB + val('hopY', t)}) scale(${val('hopSx', t)} ${val('hopSy', t)}) translate(${-OX} ${-OB})`)
    spin.setAttribute('transform', `rotate(${val('spin', t)} ${OX} ${OY})`)
    pop.setAttribute('transform', `translate(750 89.4) scale(${val('cS', t)}) translate(-750 -89.4)`)
    tail.setAttribute('transform', `translate(722 118) rotate(${val('tailR', t)}) scale(${Math.max(0.0001, val('tailS', t))}) translate(-722 -118)`)
    s.setAttribute('transform', `translate(${val('sX', t) + SX} ${SB}) rotate(${val('sRot', t)}) scale(${val('sSx', t)} ${val('sSy', t)}) translate(${-SX} ${-SB})`)
  }
  const reduce = reducedMotion()
  let busy = false
  function play(segs: [number, number][]) {
    if (busy || reduce) return
    busy = true
    let i = 0, t0: number | null = null
    const step = (now: number) => {
      const [a, b] = segs[i]
      if (t0 === null) t0 = now
      const t = a + (now - t0) / 1000
      if (t >= b) {
        render(b)
        i++
        t0 = null
        if (i >= segs.length) {
          busy = false
          return
        }
      } else render(t)
      requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }
  render(REST)
  $('#wm-btn').addEventListener('click', () => play([[4.8, 5.76], [0.5, REST]]))
  return {
    intro() {
      if (reduce) return
      render(0)
      setTimeout(() => play([[0.35, REST]]), 250)
    },
  }
}
