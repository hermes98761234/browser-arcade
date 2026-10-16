// Pure logic for the "words" engine: dictionaries, wordle, hive, hangman, ciphers, word search, crossword.
import type { Rng } from '../kit'
import { TOPICS_A } from './words-data-a'
import { TOPICS_B } from './words-data-b'
import { TOPICS_C } from './words-data-c'
import { FIVE_A } from './words-data-d'
import { FIVE_B } from './words-data-e'
import { HIVES as HIVE_SEEDS } from './words-data-f'
import { DICT_A } from './words-data-g'
import { DICT_B } from './words-data-h'
import { DICT_C } from './words-data-i'
import { PROVERBS } from './words-data-j'
import { CLUES_A } from './words-data-k'
import { CLUES_B } from './words-data-l'

const split = (s: string) => s.split(/\s+/).filter(Boolean)
const alpha = /^[a-z]+$/

export const TOPICS: Record<string, string[]> = {}
for (const src of [TOPICS_A, TOPICS_B, TOPICS_C]) for (const [k, v] of Object.entries(src)) TOPICS[k] = [...new Set(split(v))].filter((w) => alpha.test(w))
export const TOPIC_NAMES = Object.keys(TOPICS)

const five = (s: string) => split(s).filter((w) => w.length === 5 && alpha.test(w))
const topicAll = Object.values(TOPICS).flat()

/** Five-letter answers for wordle (lowercase, unique). */
export const ANSWERS: string[] = [...new Set([...five(FIVE_A), ...five(FIVE_B), ...topicAll.filter((w) => w.length === 5)])]

/** Every known word (lowercase). */
export const DICT: Set<string> = new Set([...topicAll, ...split(FIVE_A), ...split(FIVE_B), ...HIVE_SEEDS, ...DICT_A, ...DICT_B, ...DICT_C].filter((w) => alpha.test(w) && w.length >= 3))
export const GUESSES: Set<string> = new Set([...DICT].filter((w) => w.length === 5))

export const dailySeed = (d = new Date()) => d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()

// ---------- wordle ----------

export type Mark = 'g' | 'y' | 'x'

export function evalGuess(guess: string, answer: string): Mark[] {
  const res: Mark[] = Array(guess.length).fill('x')
  const left: Record<string, number> = {}
  for (let i = 0; i < answer.length; i++) {
    if (guess[i] === answer[i]) res[i] = 'g'
    else left[answer[i]] = (left[answer[i]] ?? 0) + 1
  }
  for (let i = 0; i < guess.length; i++) {
    if (res[i] === 'g') continue
    if ((left[guess[i]] ?? 0) > 0) {
      res[i] = 'y'
      left[guess[i]]--
    }
  }
  return res
}

// ---------- hive (spelling bee) ----------

export interface Hive { letters: string[]; center: string; words: string[]; pangrams: string[]; maxScore: number }

const distinct = (w: string) => new Set(w).size === w.length
export const HIVE_WORDS = [...new Set(HIVE_SEEDS)].filter((w) => w.length === 7 && distinct(w) && alpha.test(w))
const DICT4 = [...DICT].filter((w) => w.length >= 4 && w.length <= 9)

export function wordScore(w: string, pangram: boolean) {
  return (w.length === 4 ? 1 : w.length) + (pangram ? 7 : 0)
}

export function hiveFor(letters: string[], center: string): Hive {
  const set = new Set(letters)
  const words = DICT4.filter((w) => w.includes(center) && [...w].every((c) => set.has(c))).sort()
  const pangrams = words.filter((w) => set.size === new Set(w).size && [...set].every((c) => w.includes(c)))
  return { letters, center, words, pangrams, maxScore: words.reduce((s, w) => s + wordScore(w, pangrams.includes(w)), 0) }
}

/** All (seed word, centre) combos that have at least `min` words, best-first. */
export function hiveCandidates(min = 10) {
  const out: Hive[] = []
  for (const w of HIVE_WORDS) for (const c of w) {
    const h = hiveFor([...w], c)
    if (h.words.length >= min) out.push(h)
  }
  return out
}
let hiveCache: Hive[] | null = null
export function buildHive(rng: Rng, min = 12): Hive {
  hiveCache ??= hiveCandidates(min)
  const pool = hiveCache.length ? hiveCache : hiveCandidates(1)
  const h = rng.pick(pool)
  return { ...h, letters: rng.shuffle([...h.letters]) }
}

// ---------- hangman ----------

export function hangmanPool(topic: string): string[] {
  return (TOPICS[topic] ?? topicAll).filter((w) => w.length >= 5 && w.length <= 10)
}
export const HANGMAN_TOPICS = ['animals', 'food', 'nature', 'home', 'travel', 'science', 'sports', 'colours', 'verbs', 'music', 'clothes']

// ---------- ciphers ----------

export type CipherKind = 'caesar' | 'atbash' | 'vigenere' | 'morse' | 'substitution'
const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
export const MORSE: Record<string, string> = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--',
  N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
}
export const caesar = (s: string, shift: number) => s.replace(/[A-Z]/g, (c) => A[(A.indexOf(c) + shift + 26) % 26])
export const atbash = (s: string) => s.replace(/[A-Z]/g, (c) => A[25 - A.indexOf(c)])
export function vigenere(s: string, key: string, dec = false) {
  let i = 0
  return s.replace(/[A-Z]/g, (c) => {
    const k = A.indexOf(key[i++ % key.length]) * (dec ? -1 : 1)
    return A[(A.indexOf(c) + k + 26) % 26]
  })
}

export interface CipherCell { plain: string; sym: string; key?: string }
export interface CipherPuzzle {
  kind: CipherKind
  text: string
  /** Words of the message; each token is a letter cell index or a literal punctuation char. */
  words: (number | string)[][]
  cells: CipherCell[]
  key?: string
  shift?: number
}
export const VIGENERE_KEYS = ['FOX', 'MOON', 'STAR', 'LEMON', 'PEARL', 'OWL', 'BEE', 'SAND', 'KITE', 'PINE']

export function substitutionKey(rng: Rng): string {
  for (;;) {
    const p = rng.shuffle([...A])
    if (p.every((c, i) => c !== A[i])) return p.join('')
  }
}

export function makeCipher(kind: CipherKind, proverb: string, rng: Rng): CipherPuzzle {
  const text = proverb.toUpperCase().replace(/[^A-Z ]/g, '')
  const cells: CipherCell[] = []
  const words: (number | string)[][] = []
  const shift = kind === 'caesar' ? rng.int(1, 25) : undefined
  const key = kind === 'vigenere' ? rng.pick(VIGENERE_KEYS) : undefined
  const sub = kind === 'substitution' ? substitutionKey(rng) : ''
  const enc = (c: string, idx: number) =>
    kind === 'caesar' ? caesar(c, shift!) : kind === 'atbash' ? atbash(c) : kind === 'vigenere' ? vigenere(c, key![idx % key!.length]) : kind === 'morse' ? MORSE[c] : sub[A.indexOf(c)]
  let li = 0
  for (const w of text.split(' ')) {
    const toks: number[] = []
    for (const ch of w) {
      cells.push({ plain: ch, sym: enc(ch, li), key: key?.[li % key.length] })
      toks.push(cells.length - 1)
      li++
    }
    words.push(toks)
  }
  return { kind, text, words, cells, key, shift }
}

export function pickProverbs(rng: Rng, n: number, maxLen = 99): string[] {
  const pool = PROVERBS.filter((p) => p.length <= maxLen)
  return rng.shuffle([...(pool.length >= n ? pool : PROVERBS)]).slice(0, n)
}
export const PROVERB_COUNT = PROVERBS.length

// ---------- word search ----------

export type Dir = [number, number]
export const DIRS_EASY: Dir[] = [[1, 0], [0, 1]]
export const DIRS_MED: Dir[] = [[1, 0], [0, 1], [1, 1], [1, -1]]
export const DIRS_HARD: Dir[] = [[1, 0], [0, 1], [1, 1], [1, -1], [-1, 0], [0, -1], [-1, -1], [-1, 1]]

export interface Placement { word: string; r: number; c: number; dir: Dir }
export interface SearchGrid { size: number; grid: string[][]; placed: Placement[] }

export function genSearch(rng: Rng, words: string[], size: number, dirs: Dir[]): SearchGrid {
  const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(''))
  const placed: Placement[] = []
  for (const raw of words) {
    const word = raw.toUpperCase()
    if (word.length > size) continue
    for (let t = 0; t < 300; t++) {
      const dir = rng.pick(dirs)
      const r = rng.int(0, size - 1)
      const c = rng.int(0, size - 1)
      const er = r + dir[1] * (word.length - 1)
      const ec = c + dir[0] * (word.length - 1)
      if (er < 0 || ec < 0 || er >= size || ec >= size) continue
      let ok = true
      for (let i = 0; i < word.length && ok; i++) {
        const g = grid[r + dir[1] * i][c + dir[0] * i]
        if (g && g !== word[i]) ok = false
      }
      if (!ok) continue
      for (let i = 0; i < word.length; i++) grid[r + dir[1] * i][c + dir[0] * i] = word[i]
      placed.push({ word, r, c, dir })
      break
    }
  }
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (!grid[r][c]) grid[r][c] = A[rng.int(0, 25)]
  return { size, grid, placed }
}

/** Cells of the straight line from a to b, or null when not on a row, column or diagonal. */
export function lineCells(a: [number, number], b: [number, number]): [number, number][] | null {
  const dr = b[0] - a[0]
  const dc = b[1] - a[1]
  if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return null
  const n = Math.max(Math.abs(dr), Math.abs(dc))
  const sr = Math.sign(dr)
  const sc = Math.sign(dc)
  return Array.from({ length: n + 1 }, (_, i) => [a[0] + sr * i, a[1] + sc * i] as [number, number])
}

// ---------- crossword ----------

export const CLUES: [string, string][] = [...CLUES_A, ...CLUES_B]

export interface CwEntry { word: string; clue: string; r: number; c: number; across: boolean; num: number }
export interface Crossword { rows: number; cols: number; grid: string[][]; entries: CwEntry[] }

export function genCrossword(rng: Rng, count: number, size: number, pool: [string, string][] = CLUES): Crossword {
  let best: { grid: string[][]; list: { word: string; clue: string; r: number; c: number; across: boolean }[] } | null = null
  for (let attempt = 0; attempt < 24; attempt++) {
    const cand = rng.shuffle([...pool]).filter(([w]) => w.length <= size)
    cand.sort((a, b) => b[0].length - a[0].length + (rng() - 0.5) * 4)
    const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(''))
    const used: boolean[][][] = Array.from({ length: size }, () => Array.from({ length: size }, () => [false, false]))
    const list: { word: string; clue: string; r: number; c: number; across: boolean }[] = []
    const at = (r: number, c: number) => (r < 0 || c < 0 || r >= size || c >= size ? '' : grid[r][c])
    const fits = (w: string, r: number, c: number, across: boolean) => {
      const dr = across ? 0 : 1
      const dc = across ? 1 : 0
      if (r + dr * (w.length - 1) >= size || c + dc * (w.length - 1) >= size) return -1
      if (at(r - dr, c - dc) || at(r + dr * w.length, c + dc * w.length)) return -1
      let cross = 0
      for (let i = 0; i < w.length; i++) {
        const rr = r + dr * i
        const cc = c + dc * i
        const g = grid[rr][cc]
        if (g) {
          if (g !== w[i] || used[rr][cc][across ? 0 : 1]) return -1
          cross++
        } else if (at(rr + dc, cc + dr) || at(rr - dc, cc - dr)) return -1
      }
      return cross
    }
    const put = (w: string, clue: string, r: number, c: number, across: boolean) => {
      for (let i = 0; i < w.length; i++) {
        const rr = r + (across ? 0 : i)
        const cc = c + (across ? i : 0)
        grid[rr][cc] = w[i]
        used[rr][cc][across ? 0 : 1] = true
      }
      list.push({ word: w, clue, r, c, across })
    }
    const first = cand.shift()
    if (!first) continue
    put(first[0], first[1], Math.floor(size / 2), Math.max(0, Math.floor((size - first[0].length) / 2)), true)
    for (const [w, clue] of cand) {
      if (list.length >= count) break
      let bestPos: { r: number; c: number; across: boolean; cross: number } | null = null
      for (const across of [true, false]) for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
        const x = fits(w, r, c, across)
        if (x > 0 && (!bestPos || x > bestPos.cross || (x === bestPos.cross && rng() < 0.3))) bestPos = { r, c, across, cross: x }
      }
      if (bestPos) put(w, clue, bestPos.r, bestPos.c, bestPos.across)
    }
    if (!best || list.length > best.list.length) best = { grid, list }
    if (list.length >= count) break
  }
  const { grid, list } = best!
  let r0 = size, r1 = 0, c0 = size, c1 = 0
  for (const e of list) {
    r0 = Math.min(r0, e.r)
    c0 = Math.min(c0, e.c)
    r1 = Math.max(r1, e.r + (e.across ? 0 : e.word.length - 1))
    c1 = Math.max(c1, e.c + (e.across ? e.word.length - 1 : 0))
  }
  const rows = r1 - r0 + 1
  const cols = c1 - c0 + 1
  const out: string[][] = Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => grid[r + r0][c + c0]))
  const starts = new Map<string, number>()
  const entries: CwEntry[] = list.map((e) => ({ ...e, r: e.r - r0, c: e.c - c0, num: 0 }))
  const keys = [...new Set(entries.map((e) => e.r * 1000 + e.c))].sort((a, b) => a - b)
  keys.forEach((k, i) => starts.set(String(k), i + 1))
  for (const e of entries) e.num = starts.get(String(e.r * 1000 + e.c))!
  entries.sort((a, b) => a.num - b.num)
  return { rows, cols, grid: out, entries }
}
