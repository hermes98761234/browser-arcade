import { describe, expect, it } from 'vitest'
import { makeRng } from '../kit'
import { buildQuiz, flag, LANG, pickBank, SCIENCE, TRIVIA } from './quiz'
import { COUNTRIES } from './quiz-data-geo'

describe('quiz data', () => {
  it('has enough content', () => {
    expect(COUNTRIES.length).toBeGreaterThanOrEqual(100)
    expect(SCIENCE.length).toBeGreaterThanOrEqual(95)
    expect(LANG.length).toBeGreaterThanOrEqual(100)
    expect(Object.values(TRIVIA).flat().length).toBeGreaterThanOrEqual(150)
    expect(flag('UA')).toBe('🇺🇦')
  })
  it('rows are well-formed', () => {
    for (const r of [...SCIENCE, ...Object.values(TRIVIA).flat()]) {
      expect(r.length).toBe(5)
      expect(new Set(r.slice(1)).size).toBe(4)
    }
    for (const r of LANG) expect(r.length).toBe(5)
  })
})

describe('buildQuiz', () => {
  it('builds 12 valid unique questions for every bank', () => {
    for (const bank of ['math', 'geo', 'science', 'lang', 'trivia'] as const) {
      for (const d of [0, 1, 2] as const) {
        for (let s = 1; s < 6; s++) {
          const qs = buildQuiz(makeRng(s * 7 + d), { bank, difficulty: d, lang: 'de' })
          expect(qs).toHaveLength(12)
          expect(new Set(qs.map((q) => q.q + (q.big ?? ''))).size).toBe(12)
          for (const q of qs) {
            expect(q.options.length).toBe(4)
            expect(new Set(q.options).size).toBe(4)
            expect(q.answer).toBeGreaterThanOrEqual(0)
          }
        }
      }
    }
  })
  it('math answers are right', () => {
    const qs = buildQuiz(makeRng(4), { bank: 'math', difficulty: 1 })
    for (const q of qs) {
      const m = /^(\d+) ([+−×÷]) (\d+) = \?$/.exec(q.big ?? '')
      if (!m) continue
      const [a, b] = [Number(m[1]), Number(m[3])]
      const r = m[2] === '+' ? a + b : m[2] === '−' ? a - b : m[2] === '×' ? a * b : a / b
      expect(Number(q.options[q.answer])).toBe(r)
    }
  })
  it('picks banks', () => {
    expect(pickBank(new Set(['math']), 'Prime Hunter').bank).toBe('math')
    expect(pickBank(new Set(['geo']), 'Flag Master').bank).toBe('geo')
    expect(pickBank(new Set(), 'Space Facts Sprint').category).toBe('space')
    expect(pickBank(new Set(['lang']), 'x').bank).toBe('lang')
    expect(pickBank(new Set(), 'Trivia Party').bank).toBe('trivia')
  })
})
