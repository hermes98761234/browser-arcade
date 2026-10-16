import { describe, expect, it } from 'vitest'
import { makeRng } from '../kit'
import { drop, genBoard, hasMove, planAfterSwap, planClear, reshuffle, runs, SP, type Cell, type Grid } from './match3'

const mk = (rows: string[]): Grid => rows.join('').split('').map((c) => (c === '.' ? null : { k: +c, s: 0 }))

describe('match3', () => {
  it('generates boards without matches and with a move', () => {
    for (let seed = 1; seed < 40; seed++) {
      const g = genBoard(makeRng(seed), 8, 5 + (seed % 2))
      expect(runs(g, 8)).toHaveLength(0)
      expect(hasMove(g, 8)).toBe(true)
    }
  })
  it('detects a simple run', () => {
    const g = mk(['00012', '12345', '21435', '34521', '45213'])
    const p = planClear(g, 5)!
    expect(p.clear.sort()).toEqual([0, 1, 2])
    expect(p.spawn).toHaveLength(0)
  })
  it('match of 4 spawns a line piece, 5 a colour bomb, L a bomb', () => {
    const four = planClear(mk(['00001', '12345', '21435', '34521', '45213']), 5)!
    expect(four.spawn[0].s).toBe(SP.row)
    expect(four.clear).toHaveLength(3)
    const five = planClear(mk(['00000', '12345', '21435', '34521', '45213']), 5)!
    expect(five.spawn[0].s).toBe(SP.color)
    const l = planClear(mk(['00034', '01234', '02345', '34512', '45123']), 5)!
    expect(l.spawn[0].s).toBe(SP.bomb)
  })
  it('line special clears its row when matched', () => {
    const g = mk(['00012', '12345', '21435', '34521', '45213'])
    g[1]!.s = SP.col
    const p = planClear(g, 5)!
    expect(p.fired).toBe(1)
    expect(p.clear).toContain(1 + 5 * 3)
  })
  it('colour bomb swap clears a colour', () => {
    const g = mk(['01234', '12345', '21435', '34521', '45213'])
    g[0] = { k: 100, s: SP.color }
    const p = planAfterSwap(g, 5, 0, 1)!
    expect(p.clear).toContain(0)
    expect(p.clear.length).toBeGreaterThan(3)
  })
  it('drop fills the board', () => {
    const g: Grid = genBoard(makeRng(3), 6, 5)
    g[10] = null
    g[4] = null
    let made = 0
    drop(g as Grid<Cell>, 6, () => ({ k: 1, s: 0 }), () => made++)
    expect(made).toBe(2)
    expect(g.every(Boolean)).toBe(true)
  })
  it('reshuffle yields a playable board', () => {
    const g: Grid = genBoard(makeRng(9), 8, 6)
    reshuffle(g, 8, makeRng(2), 6)
    expect(runs(g, 8)).toHaveLength(0)
    expect(hasMove(g, 8)).toBe(true)
  })
})
