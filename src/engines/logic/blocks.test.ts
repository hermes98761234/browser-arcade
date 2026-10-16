import { describe, expect, it } from 'vitest'
import { makeRng } from '../kit'
import { anyFits, BLAST_SHAPES, canPlace, cellsOf, clearLines, clearRowsCols, collides, dealBlast, dropY, genPacking, lockPiece, makeBag, newBoard, normalize, tryRotate } from './blocks'

describe('tetris', () => {
  it('7-bag deals each piece once per bag', () => {
    const next = makeBag(makeRng(3))
    for (let b = 0; b < 4; b++) expect(new Set(Array.from({ length: 7 }, next)).size).toBe(7)
  })
  it('every rotation has 4 cells', () => {
    for (let t = 0; t < 7; t++) for (let r = 0; r < 4; r++) expect(cellsOf(t, r)).toHaveLength(4)
  })
  it('drops, locks and clears lines', () => {
    const b = newBoard(10, 20)
    for (let x = 0; x < 6; x++) b.g[19 * 10 + x] = 1
    const y = dropY(b, 0, 0, 6, 0)
    expect(collides(b, 0, 0, 6, y + 1)).toBe(true)
    b.g[19 * 10 + 6] = 0
    // I piece horizontal at x=6 fills 6..9 on row y+1
    lockPiece(b, 0, 0, 6, y)
    expect(clearLines(b)).toEqual([19])
    expect(b.g.every((c) => c === 0)).toBe(true)
  })
  it('wall kicks let a vertical I rotate next to the wall', () => {
    const b = newBoard(10, 20)
    const r = tryRotate(b, 0, 1, 7, 5, 1)
    expect(r).not.toBeNull()
    expect(collides(b, 0, r!.rot, r!.x, r!.y)).toBe(false)
  })
})

describe('packing', () => {
  it('cut pieces exactly tile the shape', () => {
    for (let s = 1; s < 30; s++) {
      const size = [0, 3, 4, 5][s % 4]
      const p = genPacking(makeRng(s), { w: 5, h: 4, size, carve: s % 3 })
      const seen = new Set<string>()
      for (const piece of p.solution) for (const [x, y] of piece) {
        expect(seen.has(`${x},${y}`)).toBe(false)
        seen.add(`${x},${y}`)
        expect(p.shape[y * p.w + x]).toBe(1)
      }
      expect(seen.size).toBe(p.shape.reduce((a, b) => a + b, 0))
      expect(p.pieces.map((c) => c.length).sort()).toEqual(p.solution.map((c) => c.length).sort())
      for (const piece of p.pieces) expect(piece).toEqual(normalize(piece))
    }
  })
  it('pentomino mode makes size-5 pieces', () => {
    const p = genPacking(makeRng(11), { w: 5, h: 4, size: 5 })
    expect(p.pieces.every((c) => c.length === 5)).toBe(true)
  })
})

describe('block blast', () => {
  it('clears rows and columns together', () => {
    const b = newBoard(8, 8)
    for (let i = 0; i < 8; i++) {
      b.g[2 * 8 + i] = 1
      b.g[i * 8 + 5] = 1
    }
    const r = clearRowsCols(b)
    expect(r.rows).toEqual([2])
    expect(r.cols).toEqual([5])
    expect(b.g.every((c) => c === 0)).toBe(true)
  })
  it('deals at least one placeable shape', () => {
    const b = newBoard(8, 8)
    for (let s = 1; s < 20; s++) {
      const d = dealBlast(makeRng(s), b)
      expect(d.some((i) => anyFits(b, BLAST_SHAPES[i].cells))).toBe(true)
    }
    expect(canPlace(b, BLAST_SHAPES[0].cells, 7, 7)).toBe(true)
  })
})
