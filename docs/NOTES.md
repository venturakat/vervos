# VERVOS — design and code notes

- **App source:** a Vite + TypeScript project (since Nov 2026; before that it was one self-contained HTML file). `index.html` is the page shell; code in `src/` (`main.ts` tab switching, `tabs/*.ts` one file per screen, `grammar.ts` tenses and patterns, `header.ts` app bar + logo animation, `styles.css`); content in `src/data/`. Every push to `main` builds and deploys to GitHub Pages (`.github/workflows/deploy.yml`).
- **Earlier live version (Claude artifact):** https://claude.ai/artifact/27RUPbd9geUFrsqbDduTkT. From Nov 2026 the GitHub repo is the source of truth.
- **Generator helpers:**
  - `tools/conj.py` is the Python voseo conjugation engine, used to auto-check each sentence's answer.
  - `tools/verbs.py` holds the verb list and metadata.

## Logo
- New lowercase "vervos" wordmark with a speech bubble inside the O. The bubble version is the default everywhere.
- Code: `.wordmark` SVG in the header, 197 px wide; letters use `.wm-fg` / `.wm-acc` (text/primary and accent/text). Favicon is the bubble mark.

## App redesign (done Oct 2026)
1. New logo — done.
2. Done — sticky header: full wordmark + subtitle + settings; shrinks on scroll to bubble logo + settings.
3. Done — bottom dock with icon + title tabs: Tablas, Tarjetas, Verbos (centre), Frases, Oreiro.
4. Done — header logo animation: on tap the bubble tucks in, the O spins back to plain, then plays forward to the bubble again. Respects reduced motion.
5. Done (Nov 2026) — animated loading screen instead of the logo animating on start: Oreiro Dark background, "ver" + "v" rise in one by one, then the logo intro (plain O → bubble, S wiggles), the tagline fades in, and it fades away (~3.5 s, tap to skip). Markup + critical CSS in `index.html` (shows while the app loads), animation in `src/splash.ts`.

## Data format (src/data)
- `verbs.ts` → `V_CORE` / `V_EXTRA`: the verbs (merged into `V` in `grammar.ts`). Each tense has 5 forms (yo, vos, él, nosotros, ellos); imperativo has the vos form only.
- `verbs.ts` → `META[v]`: the pattern tag (reg/stem/irr) and group.
- `frases.ts` → `S`: Frases sentences, as `[verb, tense, person, "sentence with ___", "English", "answer"]`. New batches are appended with `S.push(...)`.
- `oreiro.ts` → `OS`: Oreiro sentences, the same plus a `song` field (and `sf` = the form as sung, when the song really uses it).
- `songs.ts` → `SONGS`: album, year, tense tags, and tú/vos notes for Oreiro songs; telenovela soundtrack songs are `{artist, tn:1}`. There are no lyrics anywhere, only original "inspired by" sentences.
- `tele.ts` → `TELE`: "verb|tense|person" → [[song, form as sung]] for the telenovela soundtracks.
- One soundtrack pool (Oct 27, 2026): the app is telenovela-focused, not Oreiro-focused. Natalia's songs get `artist:"Natalia Oreiro"` at load, and `SONGFORMS` (in `tabs/quiz.ts`) merges every `OS` sentence's own song form (`sf`) with `TELE`. Each Oreiro-tab question picks a song at random from `SONGFORMS["verb|tense|person"]`, Natalia and other artists equally; sentences with no match keep their own song. 360 of 1666 sentences have at least one song that sings their form (94 songs in the pool).

## Status
- Sentence batches 1–39 are done (1556 Frases, 1666 Oreiro sentences; batch 39 = one Oreiro sentence per Oreiro-song form that had none).
- 150 verbs are complete: every tense they have — now including the imperativo negativo — is covered in both Frases and Oreiro (poder, doler and costar have no imperativo forms; quejar has no affirmative imperativo sentence because in practice it is always "quejate", but it does have "no te quejes"). The other 52 verbs have 1 Frases + 1 Oreiro sentence each.
- A full set per verb is now 9 tenses (8 + imperativo negativo): 8 new Frases + 8 new Oreiro sentences for a verb that has 1 + 1.
- Batch 30 (Oct 27, 2026): nacer, parecer, mantener, tocar, permitir. Batch 31: mandar, servir, vender, visitar, regresar. Batch 32: oír, oler, mover, sentar, tratar. Batch 33: partir, repetir, vestir, volar, valer. Batch 34: recoger, resolver, sugerir, quejar, rezar. Batch 35: levantar, llenar, prestar, quitar, secar. Batch 36: abandonar, aceptar, descubrir, destruir, devolver. Batch 37: conseguir, construir, corregir, defender, despertar. Batch 38: costar, crear, cubrir, decidir, dirigir (costar's imperativo set to "–", like poder).
- Suggested next batch (all still at 1 Frases + 1 Oreiro): comenzar, compartir, comprender, conducir, divertir.
- Possible "guided by the lyrics" batch for the telenovela songs: 117 sung forms without an Oreiro sentence (list kept in the Claude project, `code/telenovela-uncovered.md`).

## Header behaviour (code notes)
- `.appbar` is fixed; `.appbar-space` keeps the page clear. Compact state (`.is-compact`) kicks in after ~30 px of scroll; tapping the compact bubble scrolls to the top.
- Logo animation lives in `src/header.ts` (keyframe tracks in seconds, `createLogoAnim(sfx)` drives either copy of the wordmark: header or loading screen `-sp`): the intro 0.35→3.2 s plays on the loading screen; tap on the header wordmark plays 4.8→5.76 (bubble tucks in, O spins back) then 0.5→3.2. Skipped with reduced motion.
- Dock: `nav.dock` fixed at the bottom; buttons are `.tab[data-view]`, hidden on the settings view. Centre tab `.tab-center` = Verbos (open-book icon) in a raised accent circle.

## Tablas layout
- Tense cards are paired: Presente + Subjuntivo presente, Pasado simple + Subjuntivo imperfecto, Futuro + Condicional (`TENSE_PAIRS`), one card with a shared person column. Pasado imperfecto and Imperativo stay single.
- Pronouns are short everywhere: yo, vos, él/ella, nos., ellos (`PERSONS`); person column is 48 px.
- Tiempos chip order (`CHIP_ORDER`): Presente, Pasado simple, Futuro, Subjuntivo presente, Subjuntivo imperfecto, Pasado imperfecto, Condicional, Imperativo.
- Tense hints (`TENSES[].h`): ahora, siempre · ayer, el año pasado · antes, cuando era chica · mañana, el próximo mes · quiero que… · condición · resultado · solo vos.

## Appearance
- Settings has an "Apariencia" switch: Sistema / Claro / Oscuro. Saved per device in localStorage (`vervos:theme`) and applied before first paint via `data-theme` on `<html>` (small inline script in `index.html`); Sistema follows the phone. Works with the Oreiro skin too.

## Verbos tab and Ajustes
- Verb picking moved from settings to its own centre tab, **Verbos** (`#view-verbos`). Picks save as you go (`saveVerbs`); decks rebuild when you leave the tab (`commitVerbs`). With 0 verbs picked, the last non-empty set stays active and a hint asks for at least one. "Cambiar" in the training summary opens the Verbos tab.
- The gear opens **Ajustes** (`#view-ajustes`): back button + borderless sections (overline label, segmented control, help text): **Apariencia** (Sistema/Claro/Oscuro) and **Idioma de las traducciones** (English active; Українська and Русский shown disabled until translations exist; choice stored as `vervos:lang`). Meant for technical settings from now on.

## Tab layout (Oct 27, 2026)
- Every tab starts with a page title (`h2.page-title`): Tablas "Conjugaciones", Tarjetas "¿Te acordás?", Verbos "Tus verbos", Frases "Completá la frase", Oreiro "Modo telenovela". When the header turns compact, the title shows next to the bubble mark (`#bar-title`).
- Tarjetas / Frases / Oreiro: main block first (stage, 8 px extra space below), then the "Entrenando" summary, then Tiempos chips.
- Sentence pills order: pronoun · verb · tense.
- Verbos filters: Regulares · Cambio de raíz · Irregulares (no "Todos"); tap the active filter again to show all verbs.

## Imperativo negativo + Más tiempos (Oct 27, 2026)
- New tense key `neg` ("Imperativo negativo", hint "no + subjuntivo"): vos form only, derived at load as the tú-form subjuntivo (`f.neg = subj[1]`: no comas, no vengas); "–" where there is no imperativo (poder, doler, …). `SINGLE` = imper + neg. Shown with "no " in Tablas, flashcards and hints; sentence answers are the verb only ("No ___ eso").
- Tablas: Imperativo + Imperativo negativo share one pair card (one vos row). It's in the Tiempos chips (last) for Tarjetas/Frases/Oreiro.
- Neg sentences (Frases + Oreiro): batches 23–29 cover all complete verbs. The other verbs get neg sentences when their full sets are written.
- Tablas bottom: "Más tiempos" (`details.more`, closed by default): Futuro con ir a, Estar + gerundio, Pluscuamperfecto, Subjuntivo pluscuamperfecto, Condicional compuesto. Built from `participle()` / `gerund()` with `IRR_PART` / `IRR_GER`; auxiliaries muted, irregular participles/gerunds in the irregular colour. Not practised in other tabs yet.

## Album covers (Oct 27, 2026)
- Song cards in Oreiro show the album cover (`COVERS` map in `src/data/covers.ts`: 144 px JPEG data URIs, ~6 KB each; `coverFor(song, SONGS[song])`). Oreiro covers: Natalia Oreiro (1998 album), Tu veneno, Turmalina, Gilda (no me arrepiento de este amor), and the singles Quiero todo and Si no es con vos (keyed `song:<title>`). Un ramito de violetas is on Tu veneno (2000).
- Telenovela soundtracks: 54 covers keyed `song:<title>`; La hormiguita has none yet (placeholder note).

## Telenovela soundtracks (Oct 27, 2026)
- 55 Argentine telenovela soundtrack songs matched against the verb sheet (Canciones tab: 508 filled cells, was 299). Matching rules are kept in the Claude project (`code/songs-matching.md`).
- Song card: every song (Natalia's too) shows the artist under the title; the Spotify / Apple Music / YouTube search uses the artist. Empty state reads "No hay drama para estos tiempos. Elegí otros."
- The Oreiro tab keeps its name for now (Katya's call) even though the app is now telenovela-focused.
