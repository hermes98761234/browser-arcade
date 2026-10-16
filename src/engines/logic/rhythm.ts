// Rhythm engine logic: procedural song composition (drums + bass + lead) and a note chart derived from the same sequence.
import { makeRng, type Rng } from '../kit'

export const STEPS_PER_BAR = 16
const MAJ = [0, 2, 4, 7, 9]
const MIN = [0, 3, 5, 7, 10]

export interface ChartNote {
  /** 16th-note step index from the start of the song. */
  step: number
  lane: number
}

export interface Song {
  bpm: number
  /** Seconds per 16th note. */
  stepDur: number
  bars: number
  steps: number
  minor: boolean
  root: number
  kick: boolean[]
  snare: boolean[]
  /** 0 none, 1 closed hat, 2 open hat. */
  hat: number[]
  bass: (number | null)[]
  lead: (number | null)[]
  /** Chord root (MIDI) per bar for pads. */
  chords: number[]
  chart: ChartNote[]
}

export interface ComposeOpts {
  seed: number
  /** 0..2 song index in the run. */
  index: number
  /** 0 easy, 1 normal, 2 hard. */
  diff: number
  bpm: number
  minor?: boolean
  bars?: number
}

const MOTIFS = [
  [0, 3, 6, 8, 11, 14], [0, 2, 4, 6, 8, 10, 12, 14], [0, 4, 6, 8, 12, 14], [0, 3, 4, 7, 8, 12],
  [0, 2, 3, 6, 8, 10, 11, 14], [0, 6, 8, 14], [0, 4, 8, 10, 12], [0, 3, 6, 10, 12, 14],
]
const BASS = [[0, 8], [0, 6, 8, 14], [0, 3, 6, 8, 11, 14], [0, 4, 8, 12], [0, 6, 10]]
const MAJ_PROG = [[0, 9, 7, 4], [0, 7, 9, 4], [0, 4, 9, 7]]
const MIN_PROG = [[0, 10, 7, 5], [0, 5, 3, 7], [0, 3, 10, 7]]

/** Minimum gap (in 16th steps) between chart notes per difficulty. */
export const MIN_GAP = [4, 2, 2]

export function compose(o: ComposeOpts): Song {
  const r: Rng = makeRng(o.seed * 7919 + o.index * 104729 + 17)
  const minor = o.minor ?? r.chance(0.4)
  const scale = minor ? MIN : MAJ
  const root = 57 + r.int(0, 6) // A3..E4 area
  const bars = o.bars ?? 12
  const steps = bars * STEPS_PER_BAR
  const prog = r.pick(minor ? MIN_PROG : MAJ_PROG)
  const chords: number[] = []
  for (let b = 0; b < bars; b++) chords.push(root + prog[b % 4] - 12)
  const kick = new Array<boolean>(steps).fill(false)
  const snare = new Array<boolean>(steps).fill(false)
  const hat = new Array<number>(steps).fill(0)
  const bass = new Array<number | null>(steps).fill(null)
  const lead = new Array<number | null>(steps).fill(null)
  const leadIdx = new Array<number>(steps).fill(-1)

  // drums
  const kickPat = r.pick([[0, 4, 8, 12], [0, 6, 8, 12], [0, 3, 8, 10, 12], [0, 4, 8, 11, 14]])
  const hatEighth = r.chance(0.7)
  for (let b = 0; b < bars; b++) {
    const o0 = b * 16
    const fill = b % 4 === 3
    for (const s of kickPat) kick[o0 + s] = true
    snare[o0 + 4] = snare[o0 + 12] = true
    if (fill) for (const s of [14, 15]) snare[o0 + s] = r.chance(0.7) || s === 14
    for (let s = 0; s < 16; s += hatEighth ? 2 : 4) hat[o0 + s] = 1
    if (b > 0 && b % 2 === 1) hat[o0 + 14] = 2
    if (b === 0) for (let s = 0; s < 16; s++) if (s % 4) hat[o0 + s] = 0 // sparse intro
  }
  // bass
  const bassPat = r.pick(BASS)
  for (let b = 0; b < bars; b++) for (const s of bassPat) bass[b * 16 + s] = chords[b] + (s === 6 || s === 14 ? 12 : 0)

  // lead melody over the key's pentatonic scale (index 0..9 across two octaves)
  const pitch = (i: number) => root + 12 * Math.floor(i / 5) + scale[((i % 5) + 5) % 5]
  const mA = r.pick(MOTIFS)
  let mB = r.pick(MOTIFS)
  if (mB === mA) mB = MOTIFS[(MOTIFS.indexOf(mA) + 3) % MOTIFS.length]
  const mk = (motif: number[], start: number) => {
    const idxs: number[] = []
    let i = start
    for (let k = 0; k < motif.length; k++) {
      i = Math.max(0, Math.min(9, i + r.pick([-2, -1, -1, 1, 1, 2, 0])))
      idxs.push(i)
    }
    return idxs
  }
  const phraseA = mk(mA, 4)
  const phraseB = mk(mB, 5)
  for (let b = 1; b < bars; b++) {
    const ph = b % 4
    const motif = ph === 2 ? mB : mA
    const idx = (ph === 2 ? phraseB : phraseA).slice()
    if (ph === 1 || ph === 3) for (let k = Math.max(0, idx.length - 2); k < idx.length; k++) idx[k] = Math.max(0, Math.min(9, idx[k] + (ph === 1 ? 1 : -1)))
    motif.forEach((s, k) => {
      leadIdx[b * 16 + s] = idx[k]
      lead[b * 16 + s] = pitch(idx[k])
    })
  }

  // chart: lead notes (+ drum hits on harder levels), thinned by minimum gap
  let lo = 99
  let hi = 0
  for (const i of leadIdx) if (i >= 0) {
    lo = Math.min(lo, i)
    hi = Math.max(hi, i)
  }
  const laneOf = (i: number) => Math.min(3, Math.floor(((i - lo) / (hi - lo + 1)) * 4))
  const cand: ChartNote[] = []
  for (let s = 0; s < steps; s++) if (leadIdx[s] >= 0) cand.push({ step: s, lane: laneOf(leadIdx[s]) })
  const cr = makeRng(o.seed + o.index * 31 + 5)
  if (o.diff >= 1) {
    for (let s = 16; s < steps - 4; s++) {
      if (leadIdx[s] >= 0) continue
      const near = leadIdx[s - 1] >= 0 || leadIdx[s + 1] >= 0
      if (near) continue
      if (snare[s] && cr.chance(o.diff === 1 ? 0.4 : 0.75)) cand.push({ step: s, lane: cr.pick([2, 3]) })
      else if (o.diff === 2 && kick[s] && cr.chance(0.45)) cand.push({ step: s, lane: cr.pick([0, 1]) })
    }
    cand.sort((a, b) => a.step - b.step)
  }
  const gap = MIN_GAP[o.diff] ?? 2
  const chart: ChartNote[] = []
  for (const n of cand) {
    const prev = chart[chart.length - 1]
    if (prev && n.step - prev.step < gap) continue
    chart.push(n)
  }
  const bpm = o.bpm
  return { bpm, stepDur: 60 / bpm / 4, bars, steps, minor, root, kick, snare, hat, bass, lead, chords, chart }
}

// ---------- judgement & grading ----------

export type Judge = 'perfect' | 'good'
/** Timing windows in seconds [perfect, good] per difficulty. */
export const WINDOWS: [number, number][] = [[0.07, 0.15], [0.055, 0.12], [0.04, 0.095]]

export function judge(dt: number, diff: number): Judge | null {
  const [p, g] = WINDOWS[diff] ?? WINDOWS[1]
  const a = Math.abs(dt)
  return a <= p ? 'perfect' : a <= g ? 'good' : null
}

export function grade(perfect: number, good: number, total: number): 'S' | 'A' | 'B' | 'C' {
  if (total <= 0) return 'C'
  const acc = (perfect + good * 0.5) / total
  return acc >= 0.93 ? 'S' : acc >= 0.8 ? 'A' : acc >= 0.62 ? 'B' : 'C'
}
