// Pure logic for the "quiz" engine: question banks and generators.
import type { Rng } from '../kit'
import { COUNTRIES } from './quiz-data-geo'
import { LANG_A } from './quiz-data-lang-a'
import { LANG_B } from './quiz-data-lang-b'
import { SCI_A } from './quiz-data-sci-a'
import { SCI_B } from './quiz-data-sci-b'
import { SCI_C } from './quiz-data-sci-c'
import { TRIVIA_A } from './quiz-data-trivia-a'
import { TRIVIA_B } from './quiz-data-trivia-b'
import { TRIVIA_C } from './quiz-data-trivia-c'
import { TRIVIA_D } from './quiz-data-trivia-d'

export type Bank = 'math' | 'geo' | 'science' | 'lang' | 'trivia'
export interface Question {
  q: string
  /** Large display line (equation, flag, word to translate). */
  big?: string
  options: string[]
  answer: number
  tag: string
}

export const flag = (iso: string) => String.fromCodePoint(...[...iso].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65))

export const TRIVIA: Record<string, string[][]> = {}
for (const src of [TRIVIA_A, TRIVIA_B, TRIVIA_C, TRIVIA_D]) for (const [k, v] of Object.entries(src)) TRIVIA[k] = [...(TRIVIA[k] ?? []), ...v]
export const TRIVIA_CATS = Object.keys(TRIVIA)
export const SCIENCE = [...SCI_A, ...SCI_B, ...SCI_C]
export const LANG = [...LANG_A, ...LANG_B]
export const LANGS = [
  { id: 'es', name: 'Spanish', col: 1, flag: flag('ES') },
  { id: 'fr', name: 'French', col: 2, flag: flag('FR') },
  { id: 'de', name: 'German', col: 3, flag: flag('DE') },
  { id: 'uk', name: 'Ukrainian', col: 4, flag: flag('UA') },
]

/** Put the correct answer among the wrong ones in a random slot. */
export function makeOptions(rng: Rng, correct: string, wrong: string[], n = 4): { options: string[]; answer: number } {
  const ws = [...new Set(wrong.filter((w) => w !== correct))].slice(0, n - 1)
  const options = rng.shuffle([correct, ...ws])
  return { options, answer: options.indexOf(correct) }
}

function fromRow(rng: Rng, row: string[], tag: string): Question {
  const [q, a, ...w] = row
  return { q, tag, ...makeOptions(rng, a, w) }
}

function pickN<T>(rng: Rng, a: readonly T[], n: number): T[] {
  return rng.shuffle([...a]).slice(0, n)
}

// ---------- math ----------

function numberOptions(rng: Rng, correct: number): string[] {
  const set = new Set<number>()
  const spread = Math.max(3, Math.round(Math.abs(correct) * 0.15))
  let guard = 0
  while (set.size < 3 && guard++ < 60) {
    const k = rng.pick([-10, -2, -1, 1, 2, 10, rng.int(-spread, spread)])
    const v = correct + k
    if (v !== correct && v >= 0) set.add(v)
  }
  for (let i = 1; set.size < 3; i++) set.add(correct + i * 3)
  return [...set].map(String)
}

export function mathQuestion(rng: Rng, d: 0 | 1 | 2): Question {
  const kinds = d === 0 ? ['add', 'sub', 'mul', 'add'] : d === 1 ? ['add', 'sub', 'mul', 'div', 'mul'] : ['add', 'sub', 'mul', 'div', 'sq', 'mix', 'pct', 'miss']
  const kind = rng.pick(kinds)
  let expr = ''
  let ans = 0
  switch (kind) {
    case 'add': {
      const m = [20, 100, 999][d]
      const a = rng.int(2, m)
      const b = rng.int(2, m)
      expr = `${a} + ${b}`
      ans = a + b
      break
    }
    case 'sub': {
      const m = [20, 100, 999][d]
      const a = rng.int(5, m)
      const b = rng.int(1, a)
      expr = `${a} − ${b}`
      ans = a - b
      break
    }
    case 'mul': {
      const a = rng.int(2, [5, 12, 25][d])
      const b = rng.int(2, [10, 12, 15][d])
      expr = `${a} × ${b}`
      ans = a * b
      break
    }
    case 'div': {
      const b = rng.int(2, [5, 12, 15][d])
      const c = rng.int(2, [10, 12, 20][d])
      expr = `${b * c} ÷ ${b}`
      ans = c
      break
    }
    case 'sq': {
      const a = rng.int(3, 20)
      expr = `${a}²`
      ans = a * a
      break
    }
    case 'mix': {
      const a = rng.int(2, 30)
      const b = rng.int(2, 9)
      const c = rng.int(2, 9)
      expr = `${a} + ${b} × ${c}`
      ans = a + b * c
      break
    }
    case 'pct': {
      const p = rng.pick([10, 20, 25, 50])
      const base = rng.int(2, 20) * 20
      expr = `${p}% of ${base}`
      ans = (p * base) / 100
      break
    }
    default: {
      const a = rng.int(3, 12)
      const b = rng.int(3, 12)
      expr = `? × ${a} = ${a * b}`
      ans = b
    }
  }
  const opts = numberOptions(rng, ans)
  return { q: 'Solve it', big: kind === 'miss' ? expr : `${expr} = ?`, tag: 'Math', ...makeOptions(rng, String(ans), opts) }
}

// ---------- geography ----------

export function geoQuestion(rng: Rng, d: 0 | 1 | 2): Question {
  const kind = rng.pick(['capital', 'country', 'flagname', 'nameflag', 'capital', 'flagname'] as const)
  const c = rng.pick(COUNTRIES)
  const others = (hardSame: boolean) => {
    const pool = COUNTRIES.filter((x) => x[0] !== c[0] && (!hardSame || x[3] === c[3]))
    return pickN(rng, pool.length >= 3 ? pool : COUNTRIES.filter((x) => x[0] !== c[0]), 3)
  }
  const near = others(d > 0)
  switch (kind) {
    case 'capital':
      return { q: `What is the capital of ${c[0]}?`, big: flag(c[2]), tag: 'Geography', ...makeOptions(rng, c[1], near.map((x) => x[1])) }
    case 'country':
      return { q: `${c[1]} is the capital of...`, big: '🏙️', tag: 'Geography', ...makeOptions(rng, c[0], near.map((x) => x[0])) }
    case 'flagname':
      return { q: 'Whose flag is this?', big: flag(c[2]), tag: 'Flags', ...makeOptions(rng, c[0], near.map((x) => x[0])) }
    default:
      return { q: `Which flag belongs to ${c[0]}?`, tag: 'Flags', ...makeOptions(rng, flag(c[2]), near.map((x) => flag(x[2]))) }
  }
}

// ---------- language ----------

export function langQuestion(rng: Rng, d: 0 | 1 | 2, langId: string): Question {
  const L = LANGS.find((l) => l.id === langId) ?? LANGS[0]
  const row = rng.pick(LANG)
  const rev = rng.chance([0.15, 0.4, 0.6][d])
  const pool = LANG.filter((r) => r !== row)
  const near = pickN(rng, pool, 6)
  if (!rev) return { q: `${L.flag} How do you say it in ${L.name}?`, big: row[0], tag: L.name, ...makeOptions(rng, row[L.col], near.map((r) => r[L.col])) }
  return { q: `${L.flag} What does this ${L.name} word mean?`, big: row[L.col], tag: L.name, ...makeOptions(rng, row[0], near.map((r) => r[0])) }
}

// ---------- building a round ----------

export interface QuizOpts { bank: Bank; difficulty: 0 | 1 | 2; count?: number; category?: string; lang?: string }

export function buildQuiz(rng: Rng, o: QuizOpts): Question[] {
  const n = o.count ?? 12
  const out: Question[] = []
  const seen = new Set<string>()
  const add = (q: Question) => {
    const k = q.q + (q.big ?? '')
    if (seen.has(k)) return false
    seen.add(k)
    out.push(q)
    return true
  }
  const gen = {
    math: () => mathQuestion(rng, o.difficulty),
    geo: () => geoQuestion(rng, o.difficulty),
    lang: () => langQuestion(rng, o.difficulty, o.lang ?? 'es'),
    science: () => fromRow(rng, rng.pick(SCIENCE), 'Science'),
    trivia: () => {
      const cat = o.category && TRIVIA[o.category] ? o.category : rng.pick(TRIVIA_CATS)
      return fromRow(rng, rng.pick(TRIVIA[cat]), cat[0].toUpperCase() + cat.slice(1))
    },
  }[o.bank]
  if (o.bank === 'trivia' && o.category && TRIVIA[o.category]) {
    for (const r of pickN(rng, TRIVIA[o.category], n)) add(fromRow(rng, r, o.category[0].toUpperCase() + o.category.slice(1)))
  } else if (o.bank === 'science') {
    for (const r of pickN(rng, SCIENCE, n)) add(fromRow(rng, r, 'Science'))
  } else if (o.bank === 'trivia') {
    const all = Object.entries(TRIVIA).flatMap(([k, rows]) => rows.map((r) => [k, r] as const))
    for (const [k, r] of pickN(rng, all, n)) add(fromRow(rng, r, k[0].toUpperCase() + k.slice(1)))
  }
  for (let guard = 0; out.length < n && guard < 400; guard++) add(gen())
  return out
}

/** Choose a bank (and category / language) from mods and the game's name or description. */
export function pickBank(mods: Set<string>, text: string): { bank: Bank; category?: string; lang?: string } {
  const s = text.toLowerCase()
  const lang = /spanish|espa/.test(s) ? 'es' : /french|fran/.test(s) ? 'fr' : /german|deutsch|der die das|gender/.test(s) ? 'de' : /ukrain|cyrillic/.test(s) ? 'uk' : undefined
  if (mods.has('lang') || lang || /vocab|language|translat|dialogue|idiom|phrase/.test(s)) return { bank: 'lang', lang }
  if (mods.has('geo') || /flag|capital|countr|geograph|atlas|continent/.test(s)) return { bank: 'geo' }
  if (mods.has('science') || /element|periodic|science|chemi|anatomy|atom|physics|\bph\b|dna|magnet|tectonic|germ|pendulum/.test(s)) return { bank: 'science' }
  const cat = /sport/.test(s) ? 'sports' : /space|astronom|constellation|planet/.test(s) ? 'space' : /animal|nature|species/.test(s) ? 'nature' : /food|dish|cook/.test(s) ? 'food' : /histor|decade|invention|year|who came first/.test(s) ? 'history' : /music|paint|lyrics|movie|portrait|art\b/.test(s) ? 'art' : /tech|computer|logo|code/.test(s) ? 'tech' : undefined
  if (cat) return { bank: 'trivia', category: cat }
  if (mods.has('math') || /math|fraction|prime|coin|calc|number|equation|arith|price|count|clock|time/.test(s)) return { bank: 'math' }
  return { bank: 'trivia' }
}
