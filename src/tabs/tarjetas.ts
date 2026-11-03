// Tarjetas: flashcards (say it out loud, flip, "Lo sabía" / "Otra vez")
import type { Tense } from '../types'
import { CHIP_ORDER, PERSONS, SINGLE, TN, V, form, forms, shownForm } from '../grammar'
import { $, chipRow, esc, shuffle, store } from '../lib'
import { ordered } from '../state'

interface Card { v: string; t: Tense; p: number }

const fcTenses = new Set<Tense>(store.get<Tense[]>('fcTenses', ['pres', 'pret', 'imp']))
let deck: Card[] = [], idx = 0, flipped = false, known = 0, total = 0

export function buildDeck() {
  store.set('fcTenses', [...fcTenses])
  const cards: Card[] = []
  for (const v of ordered())
    for (const t of fcTenses) {
      if (SINGLE.has(t)) {
        if (V[v].f[t] !== '–') cards.push({ v, t, p: 1 })
      } else for (let p = 0; p < 5; p++) cards.push({ v, t, p })
    }
  deck = shuffle(cards)
  idx = 0; flipped = false; known = 0; total = deck.length
  renderCard()
}

function renderCard() {
  const st = $('#fc-stage')
  if (!total) {
    st.innerHTML = `<p class="empty">Elegí al menos un tiempo.</p>`
    return
  }
  if (idx >= deck.length) {
    st.innerHTML = `<p class="progress">${total} de ${total}</p><div class="card" style="cursor:default"><div class="inf">¡Listo!</div><p class="gl">Pasaste las ${total} tarjetas.</p></div><div class="btns"><button class="btn primary" id="fc-again">Barajar de nuevo</button></div>`
    $('#fc-again').onclick = buildDeck
    return
  }
  const c = deck[idx], d = V[c.v], ans = form(c.v, c.t, c.p)
  let back = ''
  if (flipped) {
    const mini = !SINGLE.has(c.t)
      ? `<div class="mini">${forms(c.v, c.t).map((f, i) => `<span>${PERSONS[i]}</span><span class="${i === c.p ? 'me' : ''}">${esc(f)}</span>`).join('')}</div>`
      : ''
    back = `<div class="ans">${esc(shownForm(c.t, ans))}</div>${mini}`
  }
  st.innerHTML = `<p class="progress">${known} de ${total} sabidas · quedan ${deck.length - idx}</p>
    <button class="card" id="fc-card" aria-label="Dar vuelta la tarjeta"><div class="inf">${c.v}</div><div class="gl">${esc(d.g)}</div>
      <div class="who"><span class="pill">${PERSONS[c.p]}</span><span class="pill t">${TN[c.t].n}</span></div>
      ${back}${flipped ? '' : `<div class="tap">Decilo en voz alta y tocá para ver</div>`}</button>
    <div class="btns">${flipped ? `<button class="btn bad" id="fc-no">Otra vez</button><button class="btn good" id="fc-yes">Lo sabía</button>` : `<button class="btn primary" id="fc-flip">Ver respuesta</button>`}</div>`
  $('#fc-card').onclick = () => {
    flipped = !flipped
    renderCard()
  }
  if (flipped) {
    $('#fc-yes').onclick = () => {
      known++; idx++; flipped = false
      renderCard()
    }
    $('#fc-no').onclick = () => {
      const card = deck[idx]
      deck.splice(Math.min(deck.length, idx + 4), 0, card) // comes back a few cards later
      idx++; flipped = false
      renderCard()
    }
  } else
    $('#fc-flip').onclick = () => {
      flipped = true
      renderCard()
    }
}

export function initTarjetas() {
  chipRow($('#fc-tenses'), CHIP_ORDER, fcTenses, buildDeck, (k) => TN[k].n)
}
