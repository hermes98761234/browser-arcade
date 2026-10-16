import { describe, expect, it } from 'vitest'
import { detectReflex, judge, lifetime, reactionPoints, zoneWidth } from './reflex'

describe('reflex logic', () => {
  it('detects micro-modes', () => {
    expect(detectReflex('Whack-a-Mole', 'classic whack')).toBe('whack')
    expect(detectReflex('Perfect Stop', 'stop the bar dead center')).toBe('bar')
    expect(detectReflex('Aim Trainer', 'click targets')).toBe('aim')
    expect(detectReflex('Flash Freeze', 'freeze when lights flash')).toBe('react')
    expect(detectReflex('Pinpoint Pulse', 'tap on rhythmic pulse peaks')).toBe('pulse')
  })
  it('routes the new modes', () => {
    expect(detectReflex('Button Mash Duel', 'mashing contest')).toBe('mash')
    expect(detectReflex('Rapid Sort', 'swipe items to correct bins')).toBe('match')
    expect(detectReflex('Bridge Stretcher', 'hold to grow plank')).toBe('hold')
    expect(detectReflex('Hammer Bell', 'strike carnival bell perfectly')).toBe('bar')
    expect(detectReflex('Mole Hammer Timing', 'single button whack timing')).toBe('whack')
    expect(detectReflex('Microwave Countdown', 'reheat items perfectly')).toBe('bar')
  })
  it('judges and tightens', () => {
    expect(judge(0.01, 0, 1)).toBe('perfect')
    expect(judge(0.3, 0, 1)).toBe('miss')
    expect(judge(0.06, 0, 1)).toBe('good')
    expect(zoneWidth(10, 1)).toBeLessThan(zoneWidth(0, 1))
    expect(lifetime(100, 2)).toBe(0.55)
    expect(reactionPoints(200)).toBeGreaterThan(reactionPoints(500))
  })
})
