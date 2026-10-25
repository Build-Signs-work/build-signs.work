# build-signs.work

The hub page for the free sign builders: Road-, Trail-, Park-, Airport-,
Safety-, Railroad-, ADA-, Boating- and DOT-Signs.work — the Build-Signs.work
network; every site's footer links back here. It also holds the shared **Terms of Service**
(`/terms/`) and **Privacy Policy** (`/privacy/`) that cover all of them.

Three static pages on GitHub Pages (`CNAME` → build-signs.work, `.nojekyll`
so the files are served as-is). No build step. Google Analytics via
`assets/ga.js` (set `GA_ID` there — empty disables it); no cookies of its own.

## Files

- `index.html` — the hub: brandmark, one card per builder site (nine) with six example
  signs, how-it-works.
- `terms/index.html`, `privacy/index.html` — the legal pages, linked from the
  footer. Header and footer markup is repeated in all three pages (no build
  step): change it in each.
- `assets/site.css` — the one stylesheet. The footer's "Free sign builders"
  list mirrors the sibling sites' `<SiblingSites>` row (name + blurb from
  their `siblingSites.ts`).
- `assets/menu.js` — the top-right "Sign Builders" slide-in menu (road-signs'
  Sign Choices pattern): links to each site, closes on Escape / backdrop / ×.
- `assets/ga.js` — gtag.js for the hub's own GA property, loaded by all three
  pages; the measurement ID is the `GA_ID` constant at its top.
- `package.json` — no dependencies or build; holds the site `version` (shown
  as `v0.1.2` at the foot of every page) and the scripts. `.githooks/pre-commit`
  (enabled by `npm install`; `prepare` sets `core.hooksPath`) bumps the patch
  number on every commit, and its `version` script runs
  `scripts/sync-version.mjs` to stamp it into the three pages'
  `<p class="version">` and stage them. Bump minor / major by hand and the hook
  leaves it alone; skip once with `SKIP_VERSION_BUMP=1`.
- `icon.svg` — the favicon and brandmark: a fingerpost whose blades use the
  sibling sites' colours (guide green, airfield yellow, park brown, safety red).
- `signs/*.svg` — the example signs, snapshotted from the shared sign API and
  committed, so the page loads even when the API is down.
- `og.png` — 1200×630 share card, rendered from `scripts/og.html`.

## Updating the example signs

Edit `EXAMPLES` in `scripts/fetch-signs.mjs`, then:

```sh
npm run fetch-signs                                       # from the live API
API=http://localhost:4000 node scripts/fetch-signs.mjs    # or a local backend
```

The ADA / boating / DOT examples were snapshotted from a local backend before
those types reached production; a full re-run against the live API works once
it's deployed.

```sh
```

Add or rename an `<img src="signs/…">` in `index.html` to match. Re-render
`og.png` with the Chrome command at the top of `scripts/og.html`.

## Legal text

When the Terms or Privacy Policy change, update the date under its heading.
The sibling sites' own `/privacy` pages should stay consistent with this one.
