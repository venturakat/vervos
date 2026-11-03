export type Tense = 'pres' | 'pret' | 'imp' | 'fut' | 'subj' | 'subjimp' | 'cond' | 'imper' | 'neg'

/** All forms of one tense as a space-separated string (5 forms), or a single vos form for imper/neg. */
export type Forms = Record<Tense, string>

/** Verb as written in data/verbs.ts: "neg" is derived at load. */
export interface RawVerb {
  g: string // English gloss
  n: string // note on the pattern
  f: Omit<Forms, 'neg'> & { neg?: string }
  alt?: { imper?: string[] }
}

export interface Verb extends RawVerb {
  f: Forms
}

/** [pattern label, group]: group is reg | stem | irr */
export type VerbMeta = [label: string, group: 'reg' | 'stem' | 'irr']

export interface Sentence {
  v: string
  t: Tense
  p: number
  s: string
  en: string
}

export interface OreiroSentence extends Sentence {
  song: string
  sf?: string
}

export interface Song {
  album?: string
  year?: number
  tags?: string
  tv?: string
  artist?: string
  tn?: number
}
