// Ajustes: Apariencia (Sistema / Claro / Oscuro) and translation language (English now; uk/ru planned)
import { $, store } from '../lib'

type Theme = 'system' | 'light' | 'dark'
type Lang = 'en' | 'uk' | 'ru'

export function initAjustes() {
  const root = document.documentElement
  const apply = (t: Theme) => {
    if (t === 'light' || t === 'dark') root.setAttribute('data-theme', t)
    else root.removeAttribute('data-theme')
    document.querySelectorAll<HTMLElement>('[data-theme-opt]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.themeOpt === t)))
  }
  let theme = store.get<Theme>('theme', 'system')
  if (!['system', 'light', 'dark'].includes(theme)) theme = 'system'
  apply(theme)
  $('#theme-seg').onclick = (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-theme-opt]')
    if (!b) return
    theme = b.dataset.themeOpt as Theme
    store.set('theme', theme)
    apply(theme)
  }

  let lang = store.get<Lang>('lang', 'en')
  if (!['en', 'uk', 'ru'].includes(lang)) lang = 'en'
  const mark = () => document.querySelectorAll<HTMLElement>('[data-lang-opt]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.langOpt === lang)))
  mark()
  $('#lang-seg').onclick = (e) => {
    const b = (e.target as HTMLButtonElement).closest<HTMLButtonElement>('[data-lang-opt]')
    if (!b || b.disabled) return
    lang = b.dataset.langOpt as Lang
    store.set('lang', lang)
    mark()
  }
}
