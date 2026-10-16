import { describe, expect, it } from 'vitest'
import { makeRng } from '../kit'
import { ANSWERS, atbash, buildHive, caesar, DICT, evalGuess, genCrossword, genSearch, hangmanPool, hiveCandidates, HIVE_WORDS, lineCells, makeCipher, DIRS_HARD, vigenere, PROVERB_COUNT, CLUES } from './words'

describe('words data', () => {
  it('has enough content', () => {
    expect(ANSWERS.length).toBeGreaterThan(400)
    expect(DICT.size).toBeGreaterThan(1200)
    expect(PROVERB_COUNT).toBeGreaterThanOrEqual(55)
    expect(CLUES.length).toBeGreaterThanOrEqual(150)
    expect(hangmanPool('animals').length).toBeGreaterThan(20)
  })
})

describe('wordle', () => {
  it('handles duplicate letters', () => {
    expect(evalGuess('speed', 'abide')).toEqual(['x', 'x', 'y', 'x', 'y'])
    expect(evalGuess('apple', 'apple')).toEqual(['g', 'g', 'g', 'g', 'g'])
    expect(evalGuess('allay', 'label')).toEqual(['y', 'y', 'y', 'x', 'x'])
  })
})

describe('hive', () => {
  it('has playable hives', () => {
    const c = hiveCandidates(12)
    expect(HIVE_WORDS.length).toBeGreaterThan(30)
    expect(c.length).toBeGreaterThan(15)
    const h = buildHive(makeRng(3))
    expect(h.words.length).toBeGreaterThanOrEqual(12)
    expect(h.pangrams.length).toBeGreaterThan(0)
    expect(h.words.every((w) => w.includes(h.center))).toBe(true)
  })
})

describe('ciphers', () => {
  it('round trips', () => {
    expect(caesar(caesar('HELLO', 5), -5)).toBe('HELLO')
    expect(atbash(atbash('HELLO'))).toBe('HELLO')
    expect(vigenere(vigenere('ATTACK', 'LEMON'), 'LEMON', true)).toBe('ATTACK')
    for (const k of ['caesar', 'atbash', 'vigenere', 'morse', 'substitution'] as const) {
      const p = makeCipher(k, 'Look before you leap', makeRng(5))
      expect(p.cells.map((c) => c.plain).join('')).toBe('LOOKBEFOREYOULEAP')
      if (k === 'substitution') for (const c of p.cells) expect(c.sym).not.toBe(c.plain)
    }
  })
})

describe('word search', () => {
  it('places all words correctly', () => {
    const words = ['tiger', 'zebra', 'horse', 'sheep', 'mouse', 'whale', 'shark', 'panda']
    const g = genSearch(makeRng(9), words, 12, DIRS_HARD)
    expect(g.placed.length).toBe(words.length)
    for (const p of g.placed) {
      for (let i = 0; i < p.word.length; i++) expect(g.grid[p.r + p.dir[1] * i][p.c + p.dir[0] * i]).toBe(p.word[i])
    }
    expect(lineCells([0, 0], [2, 2])).toHaveLength(3)
    expect(lineCells([0, 0], [1, 2])).toBeNull()
  })
})

describe('crossword', () => {
  it('generates consistent crossings', () => {
    for (let s = 1; s < 8; s++) {
      const cw = genCrossword(makeRng(s), 8, 11)
      expect(cw.entries.length).toBeGreaterThanOrEqual(5)
      for (const e of cw.entries) {
        for (let i = 0; i < e.word.length; i++) expect(cw.grid[e.r + (e.across ? 0 : i)][e.c + (e.across ? i : 0)]).toBe(e.word[i])
      }
    }
  })
})
