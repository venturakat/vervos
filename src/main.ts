import './styles.css'
import { $, esc, store } from './lib'
import { ordered } from './state'
import { initAppBar, initLogo } from './header'
import { runSplash } from './splash'
import { initTablas, renderTbl } from './tabs/tablas'
import { buildDeck, initTarjetas } from './tabs/tarjetas'
import { initQuizzes } from './tabs/quiz'
import { commitVerbs, initVerbos, openVerbs } from './tabs/verbos'
import { initAjustes } from './tabs/ajustes'

const VIEWS = ['tablas', 'tarjetas', 'verbos', 'frases', 'oreiro'] as const
type View = (typeof VIEWS)[number] | 'ajustes'
const isView = (v: unknown): v is (typeof VIEWS)[number] => VIEWS.includes(v as never)

let current: View = store.get<View>('view', 'tablas')
if (!isView(current)) current = 'tablas'

initTablas()
initTarjetas()
const { frases, oreiro } = initQuizzes()
initVerbos()
initAjustes()
initAppBar()
initLogo()

function rebuildAll() {
  renderTbl()
  buildDeck()
  frases.build()
  oreiro.build()
  renderSummaries()
}

/** "Entrenando" box with the current verbs, on Tarjetas / Frases / Oreiro */
function renderSummaries() {
  const list = ordered().join(', ') || 'ningún verbo'
  document.querySelectorAll<HTMLElement>('.summary-slot').forEach((slot) => {
    const isOreiro = slot.closest('#view-oreiro')
    slot.innerHTML = `<div class="summary"><div class="txt"><div class="over">${isOreiro ? 'Entrenando con dolor' : 'Entrenando'}</div><div class="verbs">${esc(list)}</div></div><button class="link" data-open-settings>Cambiar</button></div>`
  })
}

function show(view: View) {
  if (current === 'verbos' && view !== 'verbos' && commitVerbs()) rebuildAll()
  if (view === 'verbos' && current !== 'verbos') openVerbs()
  if (view !== 'ajustes') {
    current = view
    store.set('view', view)
  }
  const settings = view === 'ajustes'
  $('#main-shell').hidden = settings
  $('#dock').hidden = settings
  document.querySelectorAll<HTMLElement>('.tab').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.view === view)))
  for (const v of [...VIEWS, 'ajustes']) $('#view-' + v).hidden = v !== view
  const isOreiro = view === 'oreiro'
  if (isOreiro) document.documentElement.setAttribute('data-skin', 'oreiro')
  else document.documentElement.removeAttribute('data-skin')
  $('#subtitle').textContent = isOreiro ? 'llorá tus verbos rioplatenses, mi amor' : 'practicá tus verbos rioplatenses'
  const pt = document.querySelector('#view-' + view + ' .page-title')
  $('#bar-title').textContent = pt ? pt.textContent : ''
  renderSummaries()
  window.scrollTo({ top: 0 })
}

$('#dock').onclick = (e) => {
  const t = (e.target as HTMLElement).closest<HTMLElement>('.tab')
  if (t) show(t.dataset.view as View)
}
document.addEventListener('click', (e) => {
  if ((e.target as HTMLElement).closest('[data-open-settings]')) show('verbos')
})
$('#close-settings').onclick = () => show(current)
$('#open-settings').onclick = () => show('ajustes')

/* ---------- boot ---------- */
runSplash()
rebuildAll()
const hash = location.hash.slice(1)
const start: View = isView(hash) ? hash : current
openVerbs()
show(start)
