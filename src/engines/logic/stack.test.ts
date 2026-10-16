import { describe, expect, it } from 'vitest'
import { cutSlab, findToppling, groupOf, landingY, stabilityOf, type Blk } from './stack'

describe('classic stack', () => {
  it('cuts the overhang', () => {
    const r = cutSlab({ x: 100, w: 80 }, { x: 120, w: 80 })
    expect(r.slab).toEqual({ x: 120, w: 60 })
    expect(r.chop).toEqual({ x: 180, w: 20 })
    expect(r.perfect).toBe(false)
  })
  it('cuts the left overhang', () => {
    const r = cutSlab({ x: 100, w: 80 }, { x: 70, w: 80 })
    expect(r.slab).toEqual({ x: 100, w: 50 })
    expect(r.chop).toEqual({ x: 70, w: 30 })
  })
  it('snaps a near-perfect drop', () => {
    const r = cutSlab({ x: 100, w: 80 }, { x: 102, w: 80 })
    expect(r.perfect).toBe(true)
    expect(r.slab).toEqual({ x: 100, w: 80 })
  })
  it('misses entirely', () => {
    expect(cutSlab({ x: 0, w: 50 }, { x: 60, w: 50 }).slab).toBeNull()
  })
})

describe('balance stability', () => {
  const plat = { x0: 0, x1: 200 }
  const b = (id: number, x: number, y: number, w = 60, h = 20): Blk => ({ id, x, y, w, h })
  it('lands on the highest surface below', () => {
    expect(landingY([b(1, 50, 0)], plat, 60, 40)).toBe(20)
    expect(landingY([b(1, 50, 0)], plat, 150, 40)).toBe(0)
    expect(landingY([], plat, 300, 40)).toBe(-Infinity)
  })
  it('a centred stack is stable', () => {
    expect(findToppling([b(1, 70, 0), b(2, 70, 20), b(3, 72, 40)], plat)).toBeNull()
  })
  it('a block hanging mostly off the edge topples toward the overhang', () => {
    const t = findToppling([b(1, 185, 0)], plat)
    expect(t?.block.id).toBe(1)
    expect(t?.dir).toBe(1)
  })
  it('the group above shifts the centre of mass', () => {
    const blocks = [b(1, 70, 0), b(2, 100, 20, 60, 20), b(3, 130, 40, 60, 20)]
    expect(groupOf(blocks, plat, blocks[1]).map((x) => x.id).sort()).toEqual([2, 3])
    expect(stabilityOf(blocks, plat, blocks[1]).ratio).toBeGreaterThan(1)
    expect(findToppling(blocks, plat)?.block.id).toBe(2)
  })
})
