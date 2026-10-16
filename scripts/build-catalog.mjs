// Parse data/games.md (the source list) into src/data/raw.json.
// usage: node scripts/build-catalog.mjs
import { readFileSync, writeFileSync } from 'node:fs'

const md = readFileSync(new URL('../data/games.md', import.meta.url), 'utf8')
const sections = []
const games = []
for (const line of md.split('\n')) {
  const h = line.match(/^## (\d+)\. (.+?)(?: — \*(.+)\*)?$/)
  if (h) {
    sections.push({ id: +h[1], name: h[2].trim(), tech: h[3]?.trim() ?? '' })
    continue
  }
  const g = line.match(/^(\d+)\. \*\*(.+?)\*\* `\[([23])D\]` — (.+?) \*Build:\* (.+)$/)
  if (g) games.push([+g[1], g[2], +g[3], g[4].trim().replace(/\.$/, ''), g[5].trim().replace(/\.$/, ''), sections.length])
}
if (games.length !== 3000) throw new Error(`expected 3000 games, got ${games.length}`)
writeFileSync(new URL('../src/data/raw.json', import.meta.url), JSON.stringify({ sections, games }))
console.log(`${sections.length} sections, ${games.length} games`)
