#!/usr/bin/env node
/**
 * Snapshots the example signs shown on build-signs.work into signs/*.svg.
 *
 * The page serves those files statically, so it never calls the sign API at
 * load time. Re-run this only to refresh or change the examples:
 *
 *   node scripts/fetch-signs.mjs            # all signs
 *   API=http://localhost:4000 node scripts/fetch-signs.mjs
 *
 * Each entry is a backend sign type + params (the same calls the sibling
 * sites make); `file` is the name the page's <img> tags reference.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const API = process.env.API ?? "https://api.road-signs.work";
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "signs");

export const EXAMPLES = [
  // Road-Signs.work
  { file: "road-stop", type: "stop", params: {} },
  { file: "road-interstate", type: "interstate", params: { number: "95" } },
  { file: "road-speed-limit", type: "speed-limit", params: { limit: "65" } },
  { file: "road-deer", type: "warning", params: { symbol: "deer" } },
  { file: "road-distance", type: "distance", params: { dest: ["Stratton:16", "Limon:76", "Denver:165"] } },
  { file: "road-street-name", type: "street-name", params: { text: "Main St" } },

  // Trail-Signs.work
  { file: "trail-junction", type: "trail-junction", params: { route: "Great Ridge Trail:458", dest: ["Sunrise Lake:2.5:left", "Bear Pass:4:right"] } },
  { file: "trail-forest-route", type: "forest-route", params: { number: "26" } },
  { file: "trail-frd", type: "frd-sign", params: { dest: ["Campground:2:right", "Lookout Tower:5:left"] } },
  { file: "trail-wilderness", type: "wilderness-boundary", params: { name: "Eagle Cap|Wilderness" } },
  { file: "trail-difficulty", type: "trail-difficulty", params: { level: "most-difficult", name: "Ridgeline" } },
  { file: "trail-portal", type: "forest-portal", params: { name: "Pine Ridge", shield: "false", credit: "false" } },

  // Park-Signs.work
  { file: "park-entrance", type: "park-entrance", params: { name: "Lakeview", kind: "State Park" } },
  { file: "park-site", type: "recreation-site", params: { name: "Pine Hollow|Campground" } },
  { file: "park-attraction", type: "attraction-sign", params: { name: "Bridal Veil Falls", descriptor: "Scenic Overlook", symbols: "viewpoint,parking,accessible", arrow: "right" } },
  { file: "park-directions", type: "recreation-guide", params: { dest: ["Visitor Center::up", "Campground:2:left", "Boat Launch:1:right"] } },
  { file: "park-campsite", type: "campsite-marker", params: { site: "12", loop: "A" } },
  { file: "park-trailhead", type: "trailhead", params: { name: "Cedar Loop", subtitle: "Trailhead", symbols: "hiking,bicycle,no-horse", dest: ["Cedar Falls:1.5", "Summit:4"] } },

  // Airport-Signs.work
  { file: "airport-holding", type: "airport-sign", params: { kind: "mandatory", text: "4-22", location: "B" } },
  { file: "airport-location", type: "airport-sign", params: { kind: "location", text: "B" } },
  { file: "airport-direction", type: "airport-sign", params: { kind: "direction", text: "A", arrow: "right" } },
  { file: "airport-destination", type: "airport-sign", params: { kind: "destination", text: "FBO", arrow: "left" } },
  { file: "airport-distance", type: "airport-sign", params: { kind: "distance", text: "3" } },
  { file: "airport-no-entry", type: "airport-sign", params: { kind: "no-entry" } },

  // Safety-Signs.work
  { file: "safety-danger", type: "danger-sign", params: { text: "HIGH VOLTAGE|KEEP OUT" } },
  { file: "safety-caution", type: "caution-sign", params: { text: "WET FLOOR" } },
  { file: "safety-biohazard", type: "biohazard-sign", params: {} },
  { file: "safety-nfpa-704", type: "nfpa-704", params: { health: "2", flammability: "3", instability: "1", special: "W" } },
  { file: "safety-exit", type: "exit-sign", params: { arrow: "right" } },
  { file: "safety-fire", type: "fire-equipment-sign", params: { text: "FIRE|EXTINGUISHER" } },

  // Railroad-Signs.work
  { file: "railroad-crossbuck", type: "mutcd-sign", params: { code: "R15-1" } },
  { file: "railroad-advance", type: "mutcd-sign", params: { code: "W10-1" } },
  { file: "railroad-tracks", type: "regulatory-sign", params: { text: "3|TRACKS" } },
  { file: "railroad-do-not-stop", type: "regulatory-sign", params: { text: "DO NOT STOP ON TRACKS" } },
  { file: "railroad-look", type: "mutcd-sign", params: { code: "R15-8" } },
  { file: "railroad-no-horn", type: "warning", params: { text: "NO|TRAIN|HORN" } },

  // ADA-Signs.work
  { file: "ada-room", type: "ada-room-sign", params: { number: "204", text: "CONFERENCE ROOM" } },
  { file: "ada-restroom", type: "ada-restroom-sign", params: { kind: "all-gender" } },
  { file: "ada-exit", type: "ada-exit-sign", params: { kind: "exit-stair-down" } },
  { file: "ada-symbol", type: "ada-symbol-sign", params: { text: "ACCESSIBLE|ENTRANCE", arrow: "right" } },
  { file: "ada-parking", type: "ada-parking-sign", params: { van: "yes" } },
  { file: "ada-directional", type: "ada-directional-sign", params: { dest: ["Restrooms:left", "Elevator:right"] } },

  // Boating-Signs.work
  { file: "boating-no-wake", type: "waterway-marker", params: { text: "NO|WAKE", top: "SLOW", bottom: "ZONE" } },
  { file: "boating-danger", type: "waterway-marker", params: { kind: "danger" } },
  { file: "boating-marina", type: "marina-sign", params: {} },
  { file: "boating-slip", type: "slip-marker", params: { slip: "B-12", dock: "DOCK B" } },
  { file: "boating-dive-flag", type: "dive-flag", params: {} },
  { file: "boating-signal-flags", type: "signal-flags", params: { text: "AHOY" } },

  // DOT-Signs.work
  { file: "dot-usdot", type: "usdot-number", params: { panel: "17x11", docket: "123456" } },
  { file: "dot-placard", type: "hazmat-placard", params: { class: "3", un: "1203" } },
  { file: "dot-corrosive", type: "hazmat-placard", params: { class: "8" } },
  { file: "dot-un-panel", type: "un-number-panel", params: { un: "1993" } },
  { file: "dot-oversize", type: "oversize-load", params: {} },
  { file: "dot-wide-turns", type: "vehicle-safety-sign", params: { arrow: "right" } },
];

function query(params) {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    for (const v of Array.isArray(value) ? value : [value]) q.append(key, v);
  }
  return q.toString();
}

await mkdir(OUT, { recursive: true });
let failed = 0;
for (const { file, type, params } of EXAMPLES) {
  const qs = query(params);
  const url = `${API}/api/signs/${type}${qs ? `?${qs}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`✗ ${file}: ${res.status} ${await res.text()}`);
    failed++;
    continue;
  }
  const { svg } = await res.json();
  await writeFile(join(OUT, `${file}.svg`), svg + "\n");
  console.log(`✓ ${file} (${svg.length} bytes)`);
}
process.exit(failed ? 1 : 0);
