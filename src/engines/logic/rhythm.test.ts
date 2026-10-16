import { describe, expect, it } from 'vitest'
import { compose, grade, judge, MIN_GAP } from './rhythm'

describe('rhythm compose', () => {
  it('is deterministic and chart notes align with the music', () => {
    for (let seed = 1; seed < 20; seed++) {
      for (let diff = 0; diff < 3; diff++) {
        for (let index = 0; index < 3; index++) {
          const a = compose({ seed, index, diff, bpm: 100 + index * 12 })
          const b = compose({ seed, index, diff, bpm: 100 + index * 12 })
          expect(a.chart).toEqual(b.chart)
          expect(a.chart.length).toBeGreaterThan(18)
          let prev = -99
          for (const n of a.chart) {
            expect(n.lane).toBeGreaterThanOrEqual(0)
            expect(n.lane).toBeLessThan(4)
            expect(n.step).toBeLessThan(a.steps)
            // every note sits on a step where the song actually plays something
            expect(a.lead[n.step] !== null || a.kick[n.step] || a.snare[n.step]).toBe(true)
            expect(n.step - prev).toBeGreaterThanOrEqual(MIN_GAP[diff])
            prev = n.step
          }
        }
      }
    }
  })
  it('gets denser with difficulty and faster per song', () => {
    const easy = compose({ seed: 5, index: 0, diff: 0, bpm: 100 })
    const hard = compose({ seed: 5, index: 0, diff: 2, bpm: 100 })
    expect(hard.chart.length).toBeGreaterThan(easy.chart.length)
    expect(compose({ seed: 5, index: 1, diff: 1, bpm: 120 }).stepDur).toBeLessThan(compose({ seed: 5, index: 0, diff: 1, bpm: 100 }).stepDur)
  })
})

describe('judge & grade', () => {
  it('windows shrink with difficulty', () => {
    expect(judge(0.05, 0)).toBe('perfect')
    expect(judge(0.05, 2)).toBe('good')
    expect(judge(0.2, 1)).toBeNull()
  })
  it('grades', () => {
    expect(grade(100, 0, 100)).toBe('S')
    expect(grade(70, 20, 100)).toBe('A')
    expect(grade(55, 20, 100)).toBe('B')
    expect(grade(10, 10, 100)).toBe('C')
  })
})
