import { describe, expect, it } from 'vitest'
import { makeRng } from '../kit'
import {
  akariCheck, binairoCount, binairoSolved, countSolutions, genAkari, genBinairo, genNonogram, genSudoku, mineCounts, neighbors, nonogramClues, placeMines, revealFrom,
  solveLine, solveNonogram, SUDOKU6, SUDOKU9, sudokuConflicts,
} from './logic'

describe('minesweeper', () => {
  it('first click is always a safe opening', () => {
    for (const topo of ['sq', 'hex'] as const) for (let s = 1; s < 30; s++) {
      const safe = (s * 7) % 81
      const m = placeMines(topo, 9, 9, 12, safe, makeRng(s))
      expect(m.filter(Boolean)).toHaveLength(12)
      expect(m[safe]).toBe(false)
      const counts = mineCounts(topo, 9, 9, m)
      expect(counts[safe]).toBe(0)
      const rev = new Array(81).fill(false)
      const got = revealFrom(topo, 9, 9, counts, m, rev, new Array(81).fill(false), safe)
      expect(got.length).toBeGreaterThan(1)
      expect(got.some((i) => m[i])).toBe(false)
    }
  })
  it('hex cells have up to six neighbours', () => {
    expect(neighbors('hex', 5, 5, 12)).toHaveLength(6)
    expect(neighbors('sq', 5, 5, 12)).toHaveLength(8)
    expect(neighbors('sq', 5, 5, 0)).toHaveLength(3)
  })
})
describe('sudoku', () => {
  it('generates unique-solution puzzles', () => {
    for (let s = 1; s < 4; s++) {
      const { puzzle, solution } = genSudoku(SUDOKU9, 34, makeRng(s), s === 2)
      expect(countSolutions(puzzle, SUDOKU9, 2)).toBe(1)
      expect(sudokuConflicts(solution, SUDOKU9).some(Boolean)).toBe(false)
      expect(puzzle.filter(Boolean).length).toBeLessThanOrEqual(45)
    }
    const six = genSudoku(SUDOKU6, 16, makeRng(5))
    expect(countSolutions(six.puzzle, SUDOKU6, 2)).toBe(1)
  })
  it('flags conflicts', () => {
    const g = new Array(81).fill(0)
    g[0] = 5
    g[8] = 5
    const bad = sudokuConflicts(g, SUDOKU9)
    expect(bad[0] && bad[8]).toBe(true)
  })
})
describe('nonogram', () => {
  it('line solver finds overlaps', () => {
    expect(solveLine([4], [0, 0, 0, 0, 0, 0])).toEqual([0, 0, 1, 1, 0, 0])
    expect(solveLine([1, 1], [0, 0, 0])).toEqual([1, 2, 1])
    expect(solveLine([3], [2, 2, 0, 0, 1])).toEqual([2, 2, 1, 1, 1])
  })
  it('generated pictures are line-solvable for small sizes', () => {
    for (const n of [5, 7, 10]) for (let s = 1; s < 6; s++) {
      const { pic, solvable } = genNonogram(n, makeRng(s))
      expect(solvable).toBe(true)
      const { rows, cols } = nonogramClues(pic, n)
      const r = solveNonogram(rows, cols, n)
      expect(r.grid.every((v, i) => (v === 1) === pic[i])).toBe(true)
    }
  })
})
describe('binairo', () => {
  it('generates unique puzzles', () => {
    for (const n of [4, 6, 8]) {
      const { puzzle, solution } = genBinairo(n, makeRng(n), Math.floor(n * n * 0.45))
      expect(binairoCount(puzzle, n, 2)).toBe(1)
      expect(binairoSolved(solution, n)).toBe(true)
    }
  })
})
describe('akari', () => {
  it('generated solution satisfies the rules', () => {
    for (let s = 1; s < 20; s++) {
      const a = genAkari(7, makeRng(s), 0.2, 0.6)
      expect(akariCheck(a, a.solution).solved).toBe(true)
      expect(akariCheck(a, new Array(49).fill(false)).solved).toBe(false)
    }
  })
})
