// Pure map generation for Galcon-style conquest: free-form planets and hex tiles.
import type { Rng } from '../kit'

export interface MapNode {
  id: number
  x: number
  y: number
  r: number
  owner: number
  troops: number
  prod: number
  cap: number
  blocked?: boolean
  city?: boolean
  /** Index into a glyph list. */
  glyph: number
}

export interface MapSpec {
  nodes: MapNode[]
  /** Hex tiles: adjacency lists. Empty for free-form maps. */
  adj: number[][]
  hexR: number
}

/** Pick `k` spread-out indices (farthest-point sampling) from candidate nodes. */
function spread(nodes: MapNode[], k: number, rng: Rng): number[] {
  const out = [rng.int(0, nodes.length - 1)]
  // First owner starts on the left side: pick the leftmost node among a few.
  let left = 0
  nodes.forEach((n, i) => { if (n.x < nodes[left].x) left = i })
  out[0] = left
  while (out.length < k) {
    let best = -1
    let bd = -1
    nodes.forEach((n, i) => {
      if (out.includes(i)) return
      const d = Math.min(...out.map((j) => Math.hypot(n.x - nodes[j].x, n.y - nodes[j].y)))
      if (d > bd) { bd = d; best = i }
    })
    out.push(best)
  }
  return out
}

export function genPlanets(rng: Rng, w: number, h: number, players: number, count: number): MapSpec {
  const nodes: MapNode[] = []
  const pad = 40
  for (let tries = 0; tries < 4000 && nodes.length < count; tries++) {
    const r = rng.int(14, 32)
    const x = rng.range(pad + r, w - pad - r)
    const y = rng.range(pad + r, h - pad - r)
    if (nodes.some((n) => Math.hypot(n.x - x, n.y - y) < n.r + r + 46)) continue
    nodes.push({ id: nodes.length, x, y, r, owner: -1, troops: Math.round(r * rng.range(0.6, 1.3)), prod: r / 12, cap: r * 9, glyph: rng.int(0, 99) })
  }
  const starts = spread(nodes, players, rng)
  starts.forEach((si, o) => {
    const n = nodes[si]
    n.owner = o
    n.r = 28
    n.prod = 28 / 12
    n.cap = 28 * 9
    n.troops = 30
  })
  return { nodes, adj: [], hexR: 0 }
}

export function genHex(rng: Rng, cols: number, rows: number, R: number, ox: number, oy: number, players: number): MapSpec {
  const nodes: MapNode[] = []
  const idx = (c: number, r: number) => c * rows + r
  const h = Math.sqrt(3) * R
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const city = rng.chance(0.14)
      nodes.push({
        id: idx(c, r), x: ox + c * 1.5 * R, y: oy + r * h + (c % 2) * (h / 2), r: R, owner: -1,
        troops: city ? rng.int(10, 20) : rng.int(3, 11), prod: city ? 0.7 : 0.22, cap: city ? 90 : 50, city, glyph: rng.int(0, 99),
      })
    }
  }
  const adj: number[][] = nodes.map((a) => nodes.filter((b) => b !== a && Math.hypot(a.x - b.x, a.y - b.y) < h * 1.05).map((b) => b.id))
  const starts = [idx(0, Math.floor(rows / 2)), idx(cols - 1, Math.floor(rows / 2)), idx(Math.floor(cols / 2), 0), idx(Math.floor(cols / 2), rows - 1)].slice(0, players)
  const startSet = new Set(starts)
  for (const n of nodes) if (!startSet.has(n.id) && rng.chance(0.12)) n.blocked = true
  // keep only tiles reachable from the first start
  const seen = new Set<number>([starts[0]])
  const q = [starts[0]]
  while (q.length) {
    const c = q.pop()!
    for (const nb of adj[c]) if (!nodes[nb].blocked && !seen.has(nb)) { seen.add(nb); q.push(nb) }
  }
  for (const n of nodes) if (!seen.has(n.id)) { n.blocked = true; n.owner = -1 }
  starts.forEach((si, o) => {
    const n = nodes[si]
    n.blocked = false
    n.owner = o
    n.troops = 25
    n.city = true
    n.prod = 0.7
    n.cap = 90
  })
  for (const n of nodes) if (n.blocked) n.troops = 0
  return { nodes, adj, hexR: R }
}

/** BFS reachability over non-blocked tiles from the first start; used by tests. */
export function reachable(spec: MapSpec, from: number): Set<number> {
  const seen = new Set<number>([from])
  const q = [from]
  while (q.length) {
    const c = q.pop()!
    for (const nb of spec.adj[c] ?? []) if (!spec.nodes[nb].blocked && !seen.has(nb)) { seen.add(nb); q.push(nb) }
  }
  return seen
}
