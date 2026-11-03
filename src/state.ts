import { V, VERBS } from './grammar'
import { store } from './lib'

/** Max verbs in training at once */
export const MAX = 10
export const DEFAULT_TRAIN = ['ser', 'estar', 'ir', 'tener', 'hacer', 'poder', 'poner', 'decir']

let train: string[] = store.get<string[]>('train', DEFAULT_TRAIN).filter((v) => V[v]).slice(0, MAX)
if (!train.length) train = DEFAULT_TRAIN.slice()

/** Verbs being trained, in the stored order */
export const getTrain = () => train
export const isTraining = (v: string) => train.includes(v)
export function setTrain(list: string[]) {
  train = VERBS.filter((v) => list.includes(v))
  store.set('train', train)
}
/** Training verbs in alphabetical order */
export const ordered = () => VERBS.filter((v) => train.includes(v))
