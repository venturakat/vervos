# vervos

**Open the app:** https://venturakat.github.io/vervos/

Practicá tus verbos rioplatenses: a phone-first app for practising Rioplatense Spanish (voseo) verb conjugations.

## What's here

- `index.html`: the page shell (header, tabs, dock).
- `src/main.ts`: starts the app and switches tabs.
- `src/tabs/`: one file per screen: `tablas.ts`, `tarjetas.ts`, `quiz.ts` (Frases + Oreiro), `verbos.ts`, `ajustes.ts`.
- `src/grammar.ts`: tenses, persons, regular patterns, participles and gerunds.
- `src/data/`: the content: `verbs.ts`, `frases.ts`, `oreiro.ts`, `songs.ts`, `tele.ts`, `covers.ts`.
- `src/styles.css`: all styles and colour tokens.
- `public/`: icons.
- `tools/`: Python helpers (`conj.py` voseo conjugation engine, `verbs.py` verb list) used to check new sentences.
- `docs/NOTES.md`: design and code notes.

## Run it locally

```sh
npm install
npm run dev
```

`npm run build` type-checks and builds to `dist/`. Every push to `main` deploys to GitHub Pages through `.github/workflows/deploy.yml`.
