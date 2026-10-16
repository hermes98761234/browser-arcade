// Stack sub-modes: Tower of Hanoi, Jenga-style pulling and seesaw torque.

// ---------- Hanoi ----------
export type Pegs = number[][]

export const newHanoi = (n: number): Pegs => [Array.from({ length: n }, (_, i) => n - i), [], []]
export const canMove = (p: Pegs, from: number, to: number): boolean => {
  if (from === to || !p[from].length) return false
  const d = p[from][p[from].length - 1]
  const top = p[to][p[to].length - 1]
  return top === undefined || d < top
}
export function moveDisc(p: Pegs, from: number, to: number): Pegs {
  const q = p.map((a) => a.slice())
  q[to].push(q[from].pop()!)
  return q
}
export const hanoiSolved = (p: Pegs, n: number): boolean => p[2].length === n
export const hanoiPar = (n: number): number => 2 ** n - 1

// ---------- Jenga ----------
/** A layer is three slots [left, middle, right]; true = block present. */
export type Layer = [boolean, boolean, boolean]

export const newTower = (layers: number): Layer[] => Array.from({ length: layers }, () => [true, true, true] as Layer)

/** A layer carries load if it keeps its middle block, or both end blocks. */
export const layerHolds = (l: Layer): boolean => l[1] || (l[0] && l[2])

/** Would pulling slot `s` of layer `i` bring the tower down? Layers above the top finished layer are free. */
export function pullCollapses(t: Layer[], i: number, s: number): boolean {
  const l = t[i].slice() as Layer
  l[s] = false
  if (layerHolds(l)) return false
  // a weakened layer only matters when something rests on it
  return t.slice(i + 1).some((u) => u.some(Boolean))
}

/** Pullable: block exists and is not in the top (unfinished or finished) layer. */
export const canPull = (t: Layer[], i: number, s: number): boolean => t[i][s] && i < t.length - 1

/** Move a pulled block to the top: opens a new layer when the top one is full. */
export function putOnTop(t: Layer[]): Layer[] {
  const out = t.map((l) => l.slice() as Layer)
  const top = out[out.length - 1]
  const free = top.findIndex((b) => !b)
  if (free >= 0 && top.some(Boolean) && top.filter(Boolean).length < 3) {
    // fill from the left so the new layer stays centred
    top[[0, 2, 1].find((k) => !top[k])!] = true
  } else out.push([true, false, false])
  return out
}

/** Width of the green zone (0..1) when pulling under `above` layers. */
export const pullZone = (above: number, diff: 0 | 1 | 2): number => Math.max(0.1, (diff === 0 ? 0.5 : diff === 1 ? 0.4 : 0.32) - above * 0.02)

// ---------- Seesaw ----------
export interface Weight {
  /** Position along the beam, -1 (left end) .. 1 (right end). */
  p: number
  w: number
}
export const torque = (ws: Weight[]): number => ws.reduce((a, b) => a + b.p * b.w, 0)
export const totalMass = (ws: Weight[]): number => ws.reduce((a, b) => a + b.w, 0)
export const MAX_TILT = 0.38
/** Beam angle in radians for the current load (positive = right side down). */
export const tiltOf = (ws: Weight[]): number => Math.atan(torque(ws) / 4)
export const tips = (ws: Weight[]): boolean => Math.abs(tiltOf(ws)) > MAX_TILT
/** Best position in [-1, 1] for a new weight w to cancel the current torque. */
export const bestSpot = (ws: Weight[], w: number): number => Math.max(-1, Math.min(1, -torque(ws) / w))
