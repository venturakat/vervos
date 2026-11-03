// Sideways swipe between the dock tabs (Tablas ↔ Tarjetas ↔ Verbos ↔ Frases ↔ Oreiro).
// The page follows your finger, slides away, and the next tab slides in.
// At the first/last tab it only stretches a little and springs back. Header and dock stay put.

/** Is the finger on something that scrolls sideways by itself? Then leave it alone. */
const inSideScroll = (el: HTMLElement | null) => {
  for (let n = el; n && n !== document.body; n = n.parentElement) {
    if (n.scrollWidth > n.clientWidth + 1) {
      const ox = getComputedStyle(n).overflowX
      if (ox === 'auto' || ox === 'scroll') return true
    }
  }
  return false
}

const set = (el: HTMLElement | null, x: number, o: number, tr = 'none') => {
  if (!el) return
  el.style.transition = tr
  el.style.transform = x ? `translateX(${x}px)` : ''
  el.style.opacity = o === 1 ? '' : String(o)
}

interface SwipeHooks {
  /** the visible tab's section, or null when swiping isn't possible (Ajustes, loading screen) */
  page: () => HTMLElement | null
  /** is there a tab in that direction? 1 = next (swipe left), -1 = previous (swipe right) */
  can: (dir: 1 | -1) => boolean
  /** switch to the tab in that direction */
  go: (dir: 1 | -1) => void
}

export function startSwipe(h: SwipeHooks) {
  let s: { x: number; y: number; t: number; lock?: 'h' | 'v'; el: HTMLElement; dx: number } | null = null

  document.addEventListener('touchstart', (e) => {
    s = null
    const t = e.target as HTMLElement
    const el = h.page()
    if (!el || e.touches.length > 1 || !el.contains(t) || inSideScroll(t)) return
    // a field you're typing in keeps its own touches (moving the cursor, selecting)
    const field = t.closest('input, textarea, select')
    if (field && field === document.activeElement) return
    s = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now(), el, dx: 0 }
  }, { passive: true })

  document.addEventListener('touchmove', (e) => {
    if (!s) return
    const dx = e.touches[0].clientX - s.x, dy = e.touches[0].clientY - s.y
    if (!s.lock) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
      s.lock = Math.abs(dx) > Math.abs(dy) * 1.2 ? 'h' : 'v'
    }
    if (s.lock !== 'h') return
    e.preventDefault() // no page scrolling while swiping sideways
    s.dx = dx
    const can = h.can(dx < 0 ? 1 : -1)
    set(s.el, can ? dx : dx * 0.22, can ? 1 - Math.min(0.4, Math.abs(dx) / 800) : 1)
  }, { passive: false })

  const end = () => {
    const g = s
    s = null
    if (!g || g.lock !== 'h') return
    const dir: 1 | -1 = g.dx < 0 ? 1 : -1
    const w = window.innerWidth
    const speed = Math.abs(g.dx) / Math.max(1, Date.now() - g.t)
    if (!h.can(dir) || !(Math.abs(g.dx) > w * 0.2 || (speed > 0.35 && Math.abs(g.dx) > 30))) {
      set(g.el, 0, 1, 'transform .22s cubic-bezier(.2,.9,.3,1.2), opacity .16s') // spring back
      return
    }
    set(g.el, -dir * w, 0, 'transform .11s ease-in, opacity .11s ease-in')
    setTimeout(() => {
      set(g.el, 0, 1)
      h.go(dir)
      const next = h.page()
      set(next, dir * w * 0.35, 0)
      requestAnimationFrame(() => requestAnimationFrame(() => set(next, 0, 1, 'transform .22s cubic-bezier(.2,.8,.2,1), opacity .18s ease-out')))
      setTimeout(() => set(next, 0, 1, ''), 270)
    }, 100)
  }
  document.addEventListener('touchend', end)
  document.addEventListener('touchcancel', end)
}
