import type { Tense, Verb } from './types'
import { V_CORE, V_EXTRA, META } from './data/verbs'

export { META }

export const PERSONS = ['yo', 'vos', 'él/ella', 'nos.', 'ellos']

export const TENSES: { k: Tense; n: string; h: string }[] = [
  { k: 'pres', n: 'Presente', h: 'ahora, siempre' },
  { k: 'pret', n: 'Pasado simple', h: 'ayer, el año pasado' },
  { k: 'imp', n: 'Pasado imperfecto', h: 'antes, cuando era chica' },
  { k: 'fut', n: 'Futuro', h: 'mañana, el próximo mes' },
  { k: 'subj', n: 'Subjuntivo presente', h: 'quiero que…' },
  { k: 'subjimp', n: 'Subjuntivo imperfecto', h: 'condición' },
  { k: 'cond', n: 'Condicional', h: 'resultado' },
  { k: 'imper', n: 'Imperativo', h: 'solo vos' },
  { k: 'neg', n: 'Imperativo negativo', h: 'no + subjuntivo' },
]
export const TN = Object.fromEntries(TENSES.map((t) => [t.k, t])) as Record<Tense, (typeof TENSES)[number]>

/** Tablas shows each indicative tense next to its partner */
export const TENSE_PAIRS: [Tense, Tense][] = [['pres', 'subj'], ['pret', 'subjimp'], ['fut', 'cond']]
/** Order of the Tiempos chips (Tarjetas, Frases, Oreiro) */
export const CHIP_ORDER: Tense[] = ['pres', 'pret', 'fut', 'subj', 'subjimp', 'imp', 'cond', 'imper', 'neg']
/** Tenses with a single vos form */
export const SINGLE = new Set<Tense>(['imper', 'neg'])

const neg = (f: string) => 'no ' + f // shown before the negative imperative

// All verbs. Negative imperative (vos): no + subjuntivo presente, tú form (no comas, no vengas)
export const V: Record<string, Verb> = {}
for (const [k, d] of Object.entries({ ...V_CORE, ...V_EXTRA })) {
  V[k] = { ...d, f: { ...d.f, neg: d.f.imper === '–' ? '–' : d.f.subj.split(' ')[1] } }
}

export const plain = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '')
export const VERBS = Object.keys(V).sort((a, b) => plain(a).localeCompare(plain(b)))

// Regular pattern, to highlight forms that break it
const END: Record<string, Partial<Record<Tense, string>>> = {
  ar: { pres: 'o ás a amos an', pret: 'é aste ó amos aron', imp: 'aba abas aba ábamos aban', subj: 'e es e emos en', subjimp: 'ara aras ara áramos aran', imper: 'á', neg: 'es' },
  er: { pres: 'o és e emos en', pret: 'í iste ió imos ieron', imp: 'ía ías ía íamos ían', subj: 'a as a amos an', subjimp: 'iera ieras iera iéramos ieran', imper: 'é', neg: 'as' },
  ir: { pres: 'o ís e imos en', pret: 'í iste ió imos ieron', imp: 'ía ías ía íamos ían', subj: 'a as a amos an', subjimp: 'iera ieras iera iéramos ieran', imper: 'í', neg: 'as' },
}
export function regular(inf: string, t: Tense): string[] {
  const p = plain(inf), cls = p.slice(-2), stem = p.slice(0, -2)
  if (t === 'fut') return 'é ás á emos án'.split(' ').map((e) => inf + e)
  if (t === 'cond') return 'ía ías ía íamos ían'.split(' ').map((e) => inf + e)
  return (END[cls][t] ?? '').split(' ').map((e) => stem + e)
}
export const forms = (v: string, t: Tense) => V[v].f[t].split(' ')
export const form = (v: string, t: Tense, p: number) => (SINGLE.has(t) ? V[v].f[t] : forms(v, t)[p])
export const shownForm = (t: Tense, f: string) => (t === 'neg' && f !== '–' ? neg(f) : f)
/** Accepted answers: the form, plus alternative vos imperatives (ir: andá / ve) */
export const accept = (v: string, t: Tense, p: number) => {
  const a = [form(v, t, p)]
  if (t === 'imper' && V[v].alt?.imper) a.push(...V[v].alt!.imper!)
  return a
}

/* ---------- Más tiempos: participles and gerunds ---------- */
export const IRR_PART: Record<string, string> = { abrir: 'abierto', cubrir: 'cubierto', descubrir: 'descubierto', decir: 'dicho', escribir: 'escrito', describir: 'descrito', hacer: 'hecho', deshacer: 'deshecho', satisfacer: 'satisfecho', morir: 'muerto', poner: 'puesto', componer: 'compuesto', proponer: 'propuesto', suponer: 'supuesto', disponer: 'dispuesto', resolver: 'resuelto', volver: 'vuelto', devolver: 'devuelto', envolver: 'envuelto', romper: 'roto', ver: 'visto', prever: 'previsto', freír: 'frito', imprimir: 'impreso' }
const IRR_GER: Record<string, string> = { ir: 'yendo', decir: 'diciendo', poder: 'pudiendo', venir: 'viniendo' }
export function participle(v: string) {
  if (IRR_PART[v]) return IRR_PART[v]
  const p = plain(v), cls = p.slice(-2), st = p.slice(0, -2)
  return cls === 'ar' ? st + 'ado' : /[aeo]$/.test(st) ? st + 'ído' : st + 'ido'
}
export function gerund(v: string) {
  if (IRR_GER[v]) return IRR_GER[v]
  const p = plain(v), cls = p.slice(-2), st = p.slice(0, -2)
  if (cls === 'ar') return st + 'ando'
  if (cls === 'ir') {
    const p3 = V[v].f.pret.split(' ')[4]
    if (/ieron$/.test(p3)) return p3.replace(/ieron$/, 'iendo')
  }
  if (/[aeiou]$/.test(st) && !/(gu|qu)$/.test(st)) return st + 'yendo'
  return st + 'iendo'
}
