// Domino toppling logic: a fallen domino knocks over anything standing within reach in front of it.
export interface Domino {
  x: number
  y: number
  /** Direction it falls (radians). */
  a: number
}
export interface Spot {
  x: number
  y: number
}

export const REACH = 38
export const CONE = (50 * Math.PI) / 180

const angDiff = (a: number, b: number) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)))

export const hits = (d: Domino, x: number, y: number, reach = REACH): boolean => {
  const dx = x - d.x
  const dy = y - d.y
  const dist = Math.hypot(dx, dy)
  return dist > 0.5 && dist <= reach && angDiff(Math.atan2(dy, dx), d.a) <= CONE
}

/** Sets each domino's facing toward the next one along the drawn line (the last keeps the previous facing). */
export function faceAlong(line: Spot[]): Domino[] {
  return line.map((p, i) => {
    const q = line[i + 1] ?? null
    const prev = line[i - 1] ?? null
    const a = q ? Math.atan2(q.y - p.y, q.x - p.x) : prev ? Math.atan2(p.y - prev.y, p.x - prev.x) : 0
    return { x: p.x, y: p.y, a }
  })
}

export interface Topple {
  /** Fall time in seconds for every domino, or -1 if it stays standing. */
  dom: number[]
  /** Fall time for every target, or -1. */
  tgt: number[]
}

/** Pushing domino `start` at t=0. Each hit takes 0.1 s plus travel time. */
export function simulate(doms: Domino[], targets: Spot[], start: number, reach = REACH): Topple {
  const dom = doms.map(() => -1)
  const tgt = targets.map(() => -1)
  if (start < 0 || start >= doms.length) return { dom, tgt }
  dom[start] = 0
  const queue = [start]
  while (queue.length) {
    queue.sort((a, b) => dom[a] - dom[b])
    const i = queue.shift()!
    const d = doms[i]
    for (let j = 0; j < doms.length; j++) {
      if (dom[j] >= 0 || !hits(d, doms[j].x, doms[j].y, reach)) continue
      dom[j] = dom[i] + 0.1 + Math.hypot(doms[j].x - d.x, doms[j].y - d.y) / 400
      queue.push(j)
    }
    for (let j = 0; j < targets.length; j++) {
      if (tgt[j] >= 0 || !hits(d, targets[j].x, targets[j].y, reach)) continue
      tgt[j] = dom[i] + 0.1 + Math.hypot(targets[j].x - d.x, targets[j].y - d.y) / 400
    }
  }
  return { dom, tgt }
}

/** Points along the drag, spaced `gap` apart, starting from `from` (the previous domino) toward the pointer. */
export function nextSpots(from: Spot, to: Spot, gap: number): Spot[] {
  const dist = Math.hypot(to.x - from.x, to.y - from.y)
  const n = Math.floor(dist / gap)
  const out: Spot[] = []
  for (let i = 1; i <= n; i++) out.push({ x: from.x + ((to.x - from.x) * i * gap) / dist, y: from.y + ((to.y - from.y) * i * gap) / dist })
  return out
}
