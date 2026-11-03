// Verbos: pick up to 10 verbs to train (search + Regulares / Cambio de raíz / Irregulares filters)
import { META, V, VERBS } from '../grammar'
import { $, CHECK_SVG, esc, strip } from '../lib'
import { MAX, getTrain, setTrain } from '../state'

type Filter = 'all' | 'reg' | 'stem' | 'irr'
const FILTERS: [Exclude<Filter, 'all'>, string][] = [['reg', 'Regulares'], ['stem', 'Cambio de raíz'], ['irr', 'Irregulares']] // none active = all verbs

let draft: string[] = []
let dirty = false
let filter: Filter = 'all'
let query = ''

/** Called when the Verbos tab opens: start from the current training set */
export function openVerbs() {
  draft = getTrain().slice()
  filter = 'all'
  query = ''
  $<HTMLInputElement>('#verb-search').value = ''
  dirty = false
  renderSettings()
}

// Picks save as you go; decks are rebuilt when you leave the tab.
// With 0 verbs picked, the last non-empty set stays active.
function saveVerbs() {
  dirty = true
  if (draft.length) setTrain(draft)
}

/** Called when leaving the Verbos tab: true if the decks need rebuilding */
export function commitVerbs() {
  const changed = dirty && draft.length > 0
  dirty = false
  return changed
}

function renderSettings() {
  const full = draft.length >= MAX
  $('#count').textContent = `${draft.length} / ${MAX}`
  const limit = $('#limit-msg')
  limit.hidden = !full && draft.length > 0
  limit.textContent = draft.length === 0 ? 'Elegí al menos un verbo para entrenar.' : 'Llegaste a 10. Sacá uno para elegir otro.'
  $('#clear-all').hidden = draft.length === 0
  $('#sel-chips').innerHTML = VERBS.filter((v) => draft.includes(v))
    .map((v) => `<button class="chip" aria-pressed="true" data-remove="${v}" aria-label="Sacar ${v}">${v}<span class="x" aria-hidden="true">×</span></button>`)
    .join('')
  $('#verb-filter').innerHTML = FILTERS.map(([k, l]) => `<button class="chip" data-f="${k}" aria-pressed="${filter === k}">${l}</button>`).join('')
  renderList()
}

function renderList() {
  const full = draft.length >= MAX, q = strip(query)
  const items = VERBS.filter((v) => (filter === 'all' || META[v][1] === filter) && (!q || strip(v).includes(q) || V[v].g.toLowerCase().includes(q)))
  $('#settings-groups').innerHTML = items.length
    ? `<div class="list">${items
        .map((v) => {
          const on = draft.includes(v), dis = !on && full
          return `<label class="opt${dis ? ' dis' : ''}"><input type="checkbox" id="opt-${v}" data-v="${v}" ${on ? 'checked' : ''} ${dis ? 'disabled' : ''}><span class="box">${CHECK_SVG}</span><span class="txt"><span class="vb">${v}</span><span class="gl2">${esc(V[v].g)}</span></span><span class="pt">${META[v][0]}</span></label>`
        })
        .join('')}</div>`
    : `<p class="empty">No encontré ese verbo.</p>`
}

export function initVerbos() {
  $('#clear-all').onclick = () => {
    draft = []
    saveVerbs()
    renderSettings()
  }
  $('#settings-groups').addEventListener('change', (e) => {
    const c = (e.target as HTMLElement).closest<HTMLInputElement>('input[data-v]')
    if (!c) return
    const v = c.dataset.v!
    if (c.checked) {
      if (draft.length < MAX && !draft.includes(v)) draft.push(v)
    } else draft = draft.filter((x) => x !== v)
    saveVerbs()
    renderSettings()
    document.getElementById('opt-' + v)?.focus({ preventScroll: true })
  })
  $('#sel-chips').onclick = (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-remove]')
    if (!b) return
    draft = draft.filter((x) => x !== b.dataset.remove)
    saveVerbs()
    renderSettings()
  }
  $('#verb-filter').onclick = (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-f]')
    if (!b) return
    const f = b.dataset.f as Filter
    filter = filter === f ? 'all' : f
    renderSettings()
  }
  $<HTMLInputElement>('#verb-search').addEventListener('input', (e) => {
    query = (e.target as HTMLInputElement).value
    renderList()
  })
}
