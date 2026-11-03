// Sentence quiz, shared by Frases and Oreiro (Modo telenovela)
import type { OreiroSentence, Sentence, Song, Tense } from '../types'
import { CHIP_ORDER, PERSONS, SINGLE, TENSES, TN, V, accept, forms, regular, shownForm } from '../grammar'
import { $, cap, chipRow, CHEV_SVG, esc, shuffle, store, strip } from '../lib'
import { isTraining } from '../state'
import { S } from '../data/frases'
import { OS } from '../data/oreiro'
import { SONGS } from '../data/songs'
import { TELE } from '../data/tele'
import { COVERS } from '../data/covers'

/* ---------- one soundtrack pool: Natalia's songs are treated like every other artist ---------- */
for (const s of Object.values(SONGS)) if (!s.artist) s.artist = 'Natalia Oreiro'
/** "verb|tense|person" -> [[song, form as sung]]: every song in the pool that sings that form */
const SONGFORMS: Record<string, [string, string][]> = {}
const addSongForm = (k: string, song: string, sf: string) => {
  const l = SONGFORMS[k] || (SONGFORMS[k] = [])
  if (!l.some((e) => e[0] === song)) l.push([song, sf])
}
for (const x of OS) if (x.sf) addSongForm(x.v + '|' + x.t + '|' + x.p, x.song, x.sf)
for (const [k, l] of Object.entries(TELE)) for (const [song, sf] of l) addSongForm(k, song, sf)
const coverFor = (name: string, song?: Song) => COVERS['song:' + name] || (song?.album && COVERS[song.album]) || ''

const NOTE_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>'
const LINKS: [string, string][] = [
  ['Spotify', 'https://open.spotify.com/search/'],
  ['Apple Music', 'https://music.apple.com/search?term='],
  ['YouTube', 'https://www.youtube.com/results?search_query='],
]

/* ---------- tense hint ---------- */
function hintHTML(v: string, t: Tense, label: string) {
  const reg = regular(v, t)
  const rows = SINGLE.has(t)
    ? `<dt>vos</dt><dd class="${V[v].f[t] !== reg[0] ? 'irr' : ''}">${esc(shownForm(t, V[v].f[t]))}</dd>`
    : forms(v, t).map((f, i) => `<dt>${PERSONS[i]}</dt><dd class="${f !== reg[i] ? 'irr' : ''}">${esc(f)}</dd>`).join('')
  return `<details class="hint"><summary>${label} <span class="what">${v} · ${TN[t].n}</span>${CHEV_SVG}</summary><div class="body"><dl>${rows}</dl></div></details>`
}

interface Score { pool: unknown[]; i: number; right: number; tried: number }
interface QuizConfig {
  key: string
  bank: (Sentence | OreiroSentence)[]
  songs?: boolean
  stage: string
  chips: string
  hintLabel: string
  placeholder: string
  check: string
  empty: string
  done: string
  score: (q: Score) => string
  ok: (m: string) => string
  close: (m: string) => string
  no: (m: string, v: string) => string
}

function makeQuiz(cfg: QuizConfig) {
  const tenses = new Set<Tense>(store.get<Tense[]>(cfg.key, TENSES.map((t) => t.k)))
  const q = { pool: [] as (Sentence | OreiroSentence)[], i: 0, right: 0, tried: 0 }

  function build() {
    store.set(cfg.key, [...tenses])
    q.pool = shuffle(cfg.bank.filter((x) => isTraining(x.v) && tenses.has(x.t)))
    q.i = 0; q.right = 0; q.tried = 0
    render()
  }

  function render(focus?: boolean) {
    const st = $(cfg.stage)
    if (!q.pool.length) {
      st.innerHTML = `<p class="empty">${cfg.empty}</p>`
      return
    }
    if (q.i >= q.pool.length) {
      st.innerHTML = `<p class="progress">${cfg.score(q)}</p><div class="sentence"><p class="es">${cfg.done}</p></div><div class="btns"><button class="btn primary" data-again>Empezar de nuevo</button></div>`
      $('[data-again]', st).onclick = build
      return
    }
    const x = q.pool[q.i]
    let answered = false
    const startsWithGap = /^[¿¡]?___/.test(x.s)
    const main = accept(x.v, x.t, x.p)[0]
    const shown = startsWithGap ? cap(main) : main
    // Only Oreiro shows a song: any soundtrack song that sings this exact form, picked at random
    const pickFrom = cfg.songs ? SONGFORMS[x.v + '|' + x.t + '|' + x.p] || [] : []
    const [songName, sf]: [string | null, string | null] = pickFrom.length
      ? pickFrom[Math.floor(Math.random() * pickFrom.length)]
      : [cfg.songs ? (x as OreiroSentence).song : null, null]
    const song = songName ? SONGS[songName] : undefined
    const cover = songName && song ? coverFor(songName, song) : ''

    st.innerHTML = `<p class="progress">${cfg.score(q)}</p>
     <div class="sentence" role="group" aria-label="Ejercicio">
       <div class="meta"><span class="pill">${PERSONS[x.p]}</span><span class="pill v">${x.v}</span><span class="pill t">${TN[x.t].n}</span></div>
       <p class="es">${esc(x.s).replace('___', '<span class="gap" data-gap>______</span>')}</p>
       <p class="en">${esc(x.en)}</p>
       <div class="answer-row"><input data-input type="text" name="verbo-${cfg.key}" aria-label="Tu respuesta" placeholder="${cfg.placeholder}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="go" data-form-type="other" data-lpignore="true" data-1p-ignore data-bwignore><button class="btn primary" data-check type="button">${cfg.check}</button></div>
       <div class="accents">${'á é í ó ú ñ'.split(' ').map((c) => `<button type="button" data-c="${c}">${c}</button>`).join('')}</div>
       <div data-fb></div>
     </div>
     ${hintHTML(x.v, x.t, cfg.hintLabel)}
     ${
       song && songName
         ? `<div class="song"><div class="row"><div class="cover" aria-hidden="true">${cover ? `<img src="${cover}" alt="" loading="lazy">` : NOTE_SVG}</div>
       <div><div class="over">Escuchala y llorá</div><h4>${esc(songName)}</h4><div class="alb">${song.artist ? esc(song.artist) : `${esc(song.album)} · ${song.year}`}</div></div></div>
       <p class="tags" data-sf>${sf ? 'Esta forma del verbo está en la canción. Respondé y te digo cuál buscar.' : song.tags ? `En la canción: ${esc(song.tags)}` : 'Tiempos en la canción: por descubrir. Escuchala y anotalos.'}</p>
       ${song.tv ? `<div class="tuvos">En la canción: ${esc(song.tv)}</div>` : ''}
       <div class="links">${LINKS.map(([n, u]) => `<a class="btn" target="_blank" rel="noopener" href="${u}${encodeURIComponent((song.artist || 'Natalia Oreiro') + ' ' + songName)}">${n}</a>`).join('')}</div></div>`
         : ''
     }`

    const inp = $<HTMLInputElement>('[data-input]', st)
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        submit()
      }
    })
    $('[data-check]', st).onclick = () => submit()
    if (focus) inp.focus({ preventScroll: true })
    $('.accents', st).onclick = (e) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>('button')
      if (!b || answered) return
      const s = inp.selectionStart ?? inp.value.length, en = inp.selectionEnd ?? s
      inp.value = inp.value.slice(0, s) + b.dataset.c + inp.value.slice(en)
      inp.focus()
      inp.setSelectionRange(s + 1, s + 1)
    }
    const submit = () => {
      if (answered) {
        q.i++
        render(true)
        return
      }
      const val = inp.value.trim().toLowerCase()
      if (!val) return
      const acc = accept(x.v, x.t, x.p)
      answered = true
      q.tried++
      let cls: string, msg: string
      if (acc.includes(val)) { q.right++; cls = 'ok'; msg = cfg.ok(main) }
      else if (acc.some((a) => strip(a) === strip(val))) { q.right++; cls = 'close'; msg = cfg.close(main) }
      else { cls = 'no'; msg = cfg.no(main, val) }
      $('[data-gap]', st).textContent = shown
      inp.disabled = true
      $('[data-fb]', st).innerHTML = `<div class="feedback ${cls}">${msg}</div>`
      if (sf && song) $('[data-sf]', st).innerHTML = `Buscá esta forma en la canción: <b class="sf">${esc(sf)}</b>`
      const btn = $('[data-check]', st)
      btn.textContent = 'Siguiente'
      btn.focus({ preventScroll: true })
      $('.progress', st).textContent = cfg.score(q)
    }
  }

  chipRow($(cfg.chips), CHIP_ORDER, tenses, build, (k) => TN[k].n)
  return { build }
}

export function initQuizzes() {
  const frases = makeQuiz({
    key: 'frTenses', bank: S, stage: '#fr-stage', chips: '#fr-tenses', hintLabel: 'Ver la tabla',
    placeholder: 'escribí el verbo', check: 'Comprobar',
    empty: 'No hay frases para estos verbos y tiempos. Probá con otros tiempos o cambiá tus verbos.',
    done: '¡Terminaste todas las frases!',
    score: (q) => `${q.right} de ${q.tried} bien · frase ${Math.min(q.i + 1, q.pool.length)} de ${q.pool.length}`,
    ok: (m) => `¡Bien! <b>${esc(m)}</b>`,
    close: (m) => `Casi: ojo con el acento, es <b>${esc(m)}</b>`,
    no: (m, v) => `Era <b>${esc(m)}</b>. Escribiste <b>${esc(v)}</b>.`,
  })
  const oreiro = makeQuiz({
    key: 'orTenses', bank: OS, songs: true, stage: '#or-stage', chips: '#or-tenses', hintLabel: '¿Una ayudita?',
    placeholder: 'con el corazón…', check: 'Confesar',
    empty: 'No hay drama para estos tiempos. Elegí otros.',
    done: 'Se terminó el drama... por hoy.',
    score: (q) => {
      const r = q.tried - q.right
      return `${r} ${r === 1 ? 'corazón roto' : 'corazones rotos'} de ${q.tried} · frase ${Math.min(q.i + 1, q.pool.length)} de ${q.pool.length}`
    },
    ok: (m) => `¡Te amo! <b>${esc(m)}</b>`,
    close: (m) => `El acento te traicionó: es <b>${esc(m)}</b>`,
    no: (m, v) => `Me rompiste el corazón. Era <b>${esc(m)}</b>, no <b>${esc(v)}</b>.`,
  })
  return { frases, oreiro }
}
