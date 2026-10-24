# build-signs.work

The hub page for the free sign builders: Road-, Trail-, Park-, Airport-,
Safety- and Railroad-Signs.work. It also holds the shared **Terms of Service**
(`/#terms`) and **Privacy Policy** (`/#privacy`) that cover all of them.

A single static page on GitHub Pages (`CNAME` → build-signs.work, `.nojekyll`
so the files are served as-is). No build step, no analytics, no cookies.

## Files

- `index.html` — the whole page: brandmark, one card per builder site with six
  example signs, how-it-works, Terms, Privacy. CSS is inline.
- `icon.svg` — the favicon and brandmark: a fingerpost whose blades use the
  sibling sites' colours (guide green, airfield yellow, park brown, safety red).
- `signs/*.svg` — the example signs, snapshotted from the shared sign API and
  committed, so the page loads even when the API is down.
- `og.png` — 1200×630 share card, rendered from `scripts/og.html`.

## Updating the example signs

Edit `EXAMPLES` in `scripts/fetch-signs.mjs`, then:

```sh
node scripts/fetch-signs.mjs                              # from the live API
API=http://localhost:4000 node scripts/fetch-signs.mjs    # or a local backend
```

Add or rename an `<img src="signs/…">` in `index.html` to match. Re-render
`og.png` with the Chrome command at the top of `scripts/og.html`.

## Legal text

When the Terms or Privacy Policy change, update the date under its heading.
The sibling sites' own `/privacy` pages should stay consistent with this one.
