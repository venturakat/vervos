/** querySelector that expects the element to exist */
export const $ = <T extends HTMLElement = HTMLElement>(s: string, root: ParentNode = document) => root.querySelector(s) as T

export const esc = (s: unknown) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)

/** lowercase, no accents: for search and "close" answers */
export const strip = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

export const shuffle = <T>(a: T[]): T[] => {
  a = a.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** localStorage under "vervos:<key>"; never throws */
export const store = {
  get<T>(k: string, d: T): T {
    try {
      const v = localStorage.getItem('vervos:' + k)
      return v ? (JSON.parse(v) as T) : d
    } catch {
      return d
    }
  },
  set(k: string, v: unknown) {
    try {
      localStorage.setItem('vervos:' + k, JSON.stringify(v))
    } catch {
      /* private mode etc. */
    }
  },
}

/** Toggle chips (Tiempos): selected is mutated in place, onChange runs after every tap */
export function chipRow<K extends string>(el: HTMLElement, items: K[], selected: Set<K>, onChange: () => void, label: (k: K) => string) {
  el.innerHTML = items.map((it) => `<button class="chip" data-k="${it}" aria-pressed="${selected.has(it)}">${label(it)}</button>`).join('')
  el.onclick = (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('.chip')
    if (!b) return
    const k = b.dataset.k as K
    if (selected.has(k)) selected.delete(k)
    else selected.add(k)
    b.setAttribute('aria-pressed', String(selected.has(k)))
    onChange()
  }
}

export const CHEV_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>'
export const CHECK_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>'

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
