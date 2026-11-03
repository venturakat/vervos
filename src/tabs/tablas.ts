// Tablas: conjugation tables for one verb (paired tense cards + "Más tiempos")
import type { Tense } from '../types'
import { PERSONS, TN, TENSE_PAIRS, V, forms, regular, shownForm, participle, gerund, plain, IRR_PART } from '../grammar'
import { $, esc, store, CHEV_SVG } from '../lib'
import { isTraining, ordered } from '../state'

let tblVerb = store.get('tblVerb', 'tener')

export function renderTbl() {
  if (!isTraining(tblVerb)) tblVerb = ordered()[0]
  $('#tbl-verbs').innerHTML = ordered().map((v) => `<button class="chip" data-k="${v}" aria-pressed="${v === tblVerb}">${v}</button>`).join('')
  const d = V[tblVerb]
  let html = `<div class="verbhead"><div class="ttl"><h2>${tblVerb}</h2><span class="gloss">${esc(d.g)}</span></div>
    <p class="note">${esc(d.n)}</p><span class="legend"><i></i>breaks the regular pattern</span></div><div class="grid">`
  const cell = (k: Tense, f: string, i: number) => {
    const reg = regular(tblVerb, k)
    return `<dd class="${f !== reg[i] ? 'irr' : ''}">${esc(f)}</dd>`
  }
  for (const [a, b] of TENSE_PAIRS) {
    const fa = forms(tblVerb, a), fb = forms(tblVerb, b)
    const long = [...fa, ...fb].some((f) => f.length > 12)
    html += `<div class="tense pair${long ? ' long' : ''}"><div class="ph"><span></span><div><h3>${TN[a].n}</h3><p class="hint">${esc(TN[a].h)}</p></div><div><h3>${TN[b].n}</h3><p class="hint">${esc(TN[b].h)}</p></div></div><dl class="pf">`
    PERSONS.forEach((p, i) => {
      html += `<dt>${p}</dt>${cell(a, fa[i], i)}${cell(b, fb[i], i)}`
    })
    html += `</dl></div>`
  }
  {
    const t = TN.imp, reg = regular(tblVerb, 'imp')
    html += `<div class="tense"><h3>${t.n}</h3><p class="hint">${esc(t.h)}</p><dl>`
    forms(tblVerb, 'imp').forEach((f, i) => {
      html += `<dt>${PERSONS[i]}</dt><dd class="${f !== reg[i] ? 'irr' : ''}">${esc(f)}</dd>`
    })
    html += `</dl></div>`
  }
  // affirmative + negative imperative, one vos row
  {
    const cellS = (k: Tense) => {
      const f = d.f[k], na = f === '–', reg = regular(tblVerb, k)[0]
      const alt = k === 'imper' && d.alt?.imper ? ` <span class="na">/ ${d.alt.imper.join(', ')}</span>` : ''
      return `<dd class="${na ? 'na' : f !== reg ? 'irr' : ''}">${esc(shownForm(k, f))}${alt}</dd>`
    }
    html += `<div class="tense pair"><div class="ph"><span></span><div><h3>${TN.imper.n}</h3><p class="hint">${esc(TN.imper.h)}</p></div><div><h3>${TN.neg.n}</h3><p class="hint">${esc(TN.neg.h)}</p></div></div><dl class="pf"><dt>vos</dt>${cellS('imper')}${cellS('neg')}</dl></div>`
  }
  html += moreTenses(tblVerb)
  $('#tbl-out').innerHTML = html + `</div>`
}

export function initTablas() {
  $('#tbl-verbs').onclick = (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('.chip')
    if (!b) return
    tblVerb = b.dataset.k!
    store.set('tblVerb', tblVerb)
    renderTbl()
  }
}

/* ---------- Más tiempos (periphrastic + compound, closed by default) ---------- */
const MORE: { n: string; h: string; aux: string; main: (v: string) => string; irr: (v: string) => boolean }[] = [
  { n: 'Futuro con ir a', h: 'voy a + infinitivo · el más usado', aux: 'voy a|vas a|va a|vamos a|van a', main: (v) => v, irr: () => false },
  {
    n: 'Estar + gerundio', h: 'ahora mismo', aux: 'estoy|estás|está|estamos|están', main: gerund,
    irr: (v) => {
      const p = plain(v)
      return gerund(v) !== p.slice(0, -2) + (p.endsWith('ar') ? 'ando' : 'iendo')
    },
  },
  { n: 'Pluscuamperfecto', h: 'ya había…', aux: 'había|habías|había|habíamos|habían', main: participle, irr: (v) => !!IRR_PART[v] },
  { n: 'Subjuntivo pluscuamperfecto', h: 'si hubiera…', aux: 'hubiera|hubieras|hubiera|hubiéramos|hubieran', main: participle, irr: (v) => !!IRR_PART[v] },
  { n: 'Condicional compuesto', h: 'habría…', aux: 'habría|habrías|habría|habríamos|habrían', main: participle, irr: (v) => !!IRR_PART[v] },
]

function moreTenses(v: string) {
  const cards = MORE.map((t) => {
    const m = t.main(v), irr = t.irr(v)
    return `<div class="tense"><h3>${t.n}</h3><p class="hint">${esc(t.h)}</p><dl>${t.aux
      .split('|')
      .map((a, i) => `<dt>${PERSONS[i]}</dt><dd><span class="aux">${a}</span> <span class="${irr ? 'irr' : ''}">${esc(m)}</span></dd>`)
      .join('')}</dl></div>`
  }).join('')
  return `<details class="more"><summary><span class="ttl">Más tiempos</span><span class="what">ir a, estar + gerundio, compuestos</span>${CHEV_SVG}</summary><div class="more-body">${cards}</div></details>`
}
