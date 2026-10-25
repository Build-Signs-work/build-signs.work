// Writes package.json's version into the footer of every page
// (`<p class="version">v…</p>`). Run by `npm version` (package.json's
// `version` script), which the pre-commit hook calls on every commit — the
// pages are hand-written HTML with no build step, so the version is stamped in.
// It stages what it writes, so `PAGES` is the only list to keep up to date.
import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";

const PAGES = ["index.html", "privacy/index.html", "terms/index.html", "licenses/index.html"];
const root = new URL("../", import.meta.url);
const { version } = JSON.parse(await readFile(new URL("package.json", root), "utf8"));

for (const page of PAGES) {
  const url = new URL(page, root);
  const html = await readFile(url, "utf8");
  const next = html.replace(/(<p class="version">)v[^<]*(<\/p>)/, `$1v${version}$2`);
  if (next === html && !html.includes(`<p class="version">v${version}</p>`)) {
    throw new Error(`${page}: no <p class="version"> in the footer`);
  }
  await writeFile(url, next);
}
execFileSync("git", ["add", ...PAGES], { cwd: new URL(".", root) });
console.log(`footer version → v${version}`);
